'use client';

import { useRef, useState } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

// Convierte URLs de compartir a URLs de stream directo
function transformUrl(raw: string): { url: string; transformed: boolean } {
  const trimmed = raw.trim();

  // Google Drive: /file/d/ID/view
  const driveFile = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFile) {
    return { url: `https://drive.google.com/uc?export=download&id=${driveFile[1]}`, transformed: true };
  }
  // Google Drive: open?id=ID
  const driveOpen = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpen) {
    return { url: `https://drive.google.com/uc?export=download&id=${driveOpen[1]}`, transformed: true };
  }
  // Dropbox: cambiar dominio a descarga directa
  if (trimmed.includes('dropbox.com')) {
    const direct = trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace(/[?&]dl=0/, '');
    return { url: direct, transformed: true };
  }

  return { url: trimmed, transformed: false };
}

const C = {
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.10)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  white: '#FFFFFF',
  error: '#C0392B',
  green: '#2E7D32',
};

interface Props {
  value: string;
  onChange: (url: string) => void;
  title: string;
  artist: string;
  onTitleChange: (v: string) => void;
  onArtistChange: (v: string) => void;
}

type Tab = 'upload' | 'url';

export default function AudioUpload({ value, onChange, title, artist, onTitleChange, onArtistChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('upload');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [transformNote, setTransformNote] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'var(--font-jost)',
    color: C.text,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: C.white,
  };

  async function handleFile(file: File) {
    if (!file.type.startsWith('audio/')) {
      setError('Solo se permiten archivos de audio (MP3, AAC, M4A, etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('El archivo no debe superar 15 MB.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'moments/audio');
      formData.append('resource_type', 'video');

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve((JSON.parse(xhr.responseText) as { secure_url: string }).secure_url);
          } else {
            const msg = (JSON.parse(xhr.responseText) as { error?: { message?: string } })?.error?.message;
            reject(new Error(msg || 'Error al subir el audio.'));
          }
        };
        xhr.onerror = () => reject(new Error('Error de red.'));
        xhr.send(formData);
      });

      onChange(url);
      if (!title) onTitleChange(file.name.replace(/\.[^.]+$/, ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleUrlApply() {
    if (!urlInput.trim()) return;
    const { url, transformed } = transformUrl(urlInput);
    onChange(url);
    setUrlInput('');
    setTransformNote(transformed ? 'Enlace convertido a URL de reproducción directa.' : '');
    setError('');
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
    background: 'transparent',
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    fontFamily: 'var(--font-jost)',
    color: active ? C.accent : C.muted,
    cursor: 'pointer',
    fontWeight: active ? 500 : 400,
    transition: 'color 0.15s, border-color 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Audio preview */}
      {value && (
        <div style={{
          padding: '12px 14px',
          background: C.accentLight,
          borderRadius: '8px',
          border: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: C.muted, fontFamily: 'var(--font-jost)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Audio cargado
            </span>
            <button
              type="button"
              onClick={() => { onChange(''); setTransformNote(''); }}
              style={{ fontSize: '18px', lineHeight: 1, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
            >
              ×
            </button>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={value} style={{ width: '100%', height: '32px' }} />
          {transformNote && (
            <span style={{ fontSize: '11px', color: C.green, fontFamily: 'var(--font-jost)' }}>✓ {transformNote}</span>
          )}
        </div>
      )}

      {/* Nombre y artista */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: 'var(--font-jost)' }}>Nombre de la canción</span>
          <input style={inputStyle} value={title} onChange={e => onTitleChange(e.target.value)} placeholder="A Thousand Years" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: 'var(--font-jost)' }}>Artista</span>
          <input style={inputStyle} value={artist} onChange={e => onArtistChange(e.target.value)} placeholder="Christina Perri" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, backgroundColor: '#FDFBF7' }}>
          <button type="button" style={tabStyle(tab === 'upload')} onClick={() => setTab('upload')}>
            Subir archivo
          </button>
          <button type="button" style={tabStyle(tab === 'url')} onClick={() => setTab('url')}>
            URL externa
          </button>
        </div>

        <div style={{ padding: '14px' }}>
          {tab === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              {uploading ? (
                <>
                  <div style={{ width: '100%', height: '4px', backgroundColor: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: C.accent, transition: 'width 0.2s', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: C.muted, fontFamily: 'var(--font-jost)' }}>Subiendo… {progress}%</span>
                </>
              ) : (
                <>
                  <div
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '20px',
                      border: `1.5px dashed ${C.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>🎵</span>
                    <span style={{ fontSize: '12px', color: C.text, fontFamily: 'var(--font-jost)' }}>
                      {value ? 'Reemplazar audio' : 'Seleccionar o arrastrar MP3'}
                    </span>
                    <span style={{ fontSize: '11px', color: C.mutedLight, fontFamily: 'var(--font-jost)' }}>
                      MP3, AAC, M4A · máx. 15 MB · se guarda en Cloudinary
                    </span>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', color: C.muted, fontFamily: 'var(--font-jost)', lineHeight: '1.7', margin: 0 }}>
                Pega el enlace de <strong>Google Drive</strong>, <strong>Dropbox</strong> o cualquier URL directa de MP3.
                Los enlaces de &ldquo;Compartir&rdquo; de Google Drive se convierten automáticamente.
              </p>
              <details style={{ fontSize: '11px', color: C.muted, fontFamily: 'var(--font-jost)' }}>
                <summary style={{ cursor: 'pointer', letterSpacing: '0.05em', userSelect: 'none' }}>
                  ¿Cómo obtener el link de Google Drive?
                </summary>
                <ol style={{ margin: '8px 0 0 16px', lineHeight: '1.8', padding: 0 }}>
                  <li>Sube el MP3 a Google Drive.</li>
                  <li>Clic derecho → <em>Compartir</em> → cambia acceso a <strong>&ldquo;Cualquier persona con el enlace&rdquo;</strong>.</li>
                  <li>Clic en <em>Copiar enlace</em> y pégalo aquí — se convierte solo.</li>
                </ol>
              </details>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleUrlApply(); } }}
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  disabled={!urlInput.trim()}
                  style={{
                    padding: '10px 16px',
                    background: C.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-jost)',
                    cursor: urlInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: urlInput.trim() ? 1 : 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: C.error, fontFamily: 'var(--font-jost)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
