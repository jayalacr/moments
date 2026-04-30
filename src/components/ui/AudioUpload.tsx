'use client';

import { useState } from 'react';

function transformUrl(raw: string): { url: string; transformed: boolean } {
  const trimmed = raw.trim();

  const driveFile = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFile) {
    return { url: `https://drive.google.com/uc?export=download&id=${driveFile[1]}`, transformed: true };
  }
  const driveOpen = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpen) {
    return { url: `https://drive.google.com/uc?export=download&id=${driveOpen[1]}`, transformed: true };
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

export default function AudioUpload({ value, onChange, title, artist, onTitleChange, onArtistChange }: Props) {
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

  function handleApply() {
    if (!urlInput.trim()) return;
    const { url, transformed } = transformUrl(urlInput);
    onChange(url);
    setUrlInput('');
    setTransformNote(transformed ? 'Enlace convertido a URL de reproducción directa.' : '');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

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

      {/* URL de Google Drive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: 'var(--font-jost)' }}>
          Enlace de Google Drive
        </span>
        <p style={{ fontSize: '12px', color: C.muted, fontFamily: 'var(--font-jost)', lineHeight: '1.7', margin: 0 }}>
          Pega el enlace de &ldquo;Compartir&rdquo; de Google Drive — se convierte automáticamente al formato correcto.
        </p>
        <details style={{ fontSize: '11px', color: C.muted, fontFamily: 'var(--font-jost)' }}>
          <summary style={{ cursor: 'pointer', letterSpacing: '0.05em', userSelect: 'none' }}>
            ¿Cómo obtener el enlace?
          </summary>
          <ol style={{ margin: '8px 0 0 16px', lineHeight: '1.9', padding: 0 }}>
            <li>Sube el MP3 a Google Drive.</li>
            <li>Clic derecho → <em>Compartir</em> → cambia el acceso a <strong>&ldquo;Cualquier persona con el enlace&rdquo;</strong>.</li>
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
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } }}
          />
          <button
            type="button"
            onClick={handleApply}
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

      {/* Preview del audio cargado */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: C.muted, fontFamily: 'var(--font-jost)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Audio activo
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
          <audio controls src={`/api/audio-proxy?url=${encodeURIComponent(value)}`} style={{ width: '100%' }} />
          {transformNote && (
            <span style={{ fontSize: '11px', color: C.green, fontFamily: 'var(--font-jost)' }}>✓ {transformNote}</span>
          )}
        </div>
      )}
    </div>
  );
}
