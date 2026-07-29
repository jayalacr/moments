'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateTemplateType } from '@/app/superadmin/_actions';

const C = {
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedMid: '#7A6F63',
  green: '#5A7A5A',
  greenDim: 'rgba(90,122,90,0.12)',
  red: '#C0392B',
};

interface Props {
  eventId: string;
  currentUrl: string | null;
  eventSlug: string;
  eventType: string;
}

export default function TemplateUpload({ eventId, currentUrl, eventSlug, eventType }: Props) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && file.type !== 'text/html') {
      setStatus('error');
      setErrorMsg('Solo se aceptan archivos .html');
      return;
    }

    setUploading(true);
    setStatus('idle');
    setErrorMsg('');

    const supabase = createClient();
    const path = `${eventId}/index.html`;

    const { error: uploadError } = await supabase.storage
      .from('templates')
      .upload(path, file, {
        upsert: true,
        contentType: 'text/html',
      });

    if (uploadError) {
      setStatus('error');
      setErrorMsg(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('templates').getPublicUrl(path);

    try {
      await updateTemplateType(eventId, data.publicUrl);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('No se pudo actualizar el template_url del evento.');
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Estado actual */}
      <div style={{ padding: '14px 16px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.015)' }}>
        <p style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>
          TEMPLATE ACTUAL
        </p>
        {currentUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.green, flexShrink: 0 }} />
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '11px', color: C.accent, wordBreak: 'break-all' }}
            >
              {currentUrl}
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.muted, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: C.muted }}>
              Sin template — la invitación no es pública aún
            </span>
          </div>
        )}
      </div>

      {/* Upload */}
      <div>
        <label
          htmlFor="html-upload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '32px 20px',
            border: `1px dashed ${uploading ? C.accent : C.borderBright}`,
            borderRadius: '8px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: uploading ? C.accentDim : 'transparent',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <span style={{ fontSize: '28px' }}>⬆</span>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: uploading ? C.accent : C.mutedMid }}>
              {uploading ? 'Subiendo...' : 'Seleccionar archivo HTML'}
            </p>
            <p style={{ fontSize: '10px', color: C.muted, marginTop: '4px' }}>
              El archivo reemplaza el template actual
            </p>
          </div>
        </label>
        <input
          ref={inputRef}
          id="html-upload"
          type="file"
          accept=".html,text/html"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {/* Feedback */}
      {status === 'success' && (
        <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: C.greenDim, border: `1px solid rgba(90,122,90,0.2)` }}>
          <p style={{ fontSize: '12px', color: C.green }}>
            ✓ Template subido correctamente. Publica el evento para que sea visible.
          </p>
        </div>
      )}
      {status === 'error' && (
        <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: 'rgba(192,57,41,0.1)', border: '1px solid rgba(192,57,41,0.2)' }}>
          <p style={{ fontSize: '12px', color: C.red }}>
            ✗ {errorMsg}
          </p>
        </div>
      )}

      {/* Tip */}
      <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.015)', border: `1px solid ${C.border}` }}>
        <p style={{ fontSize: '10px', color: C.muted, lineHeight: 1.7 }}>
          // El HTML puede acceder al config del evento via:<br />
          // <span style={{ color: C.accent }}>window.__MOMENTS__.config</span><br />
          // Ejemplo: window.__MOMENTS__.config.couple.person1
        </p>
      </div>

      {/* Preview link */}
      {currentUrl && (
        <a
          href={`/${eventType}/${eventSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: `1px solid ${C.borderBright}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: C.mutedMid,
            textDecoration: 'none',
            width: 'fit-content',
          }}
        >
          ↗ Ver invitación pública
        </a>
      )}
    </div>
  );
}
