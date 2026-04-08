'use client';

import { useRef, useState } from 'react';
import { cld, T } from '@/lib/cloudinary';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const MAX_PX = 2400;        // ancho/alto máximo al comprimir
const QUALITY = 0.92;       // calidad JPEG de la compresión en canvas
const COMPRESS_THRESHOLD = 5 * 1024 * 1024; // solo comprimir si > 5 MB

const C = {
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.10)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  white: '#FFFFFF',
  error: '#C0392B',
};

/** Redimensiona y comprime una imagen usando canvas antes de subir. */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Error al comprimir la imagen.')),
        'image/jpeg',
        QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen.'));
    };

    img.src = objectUrl;
  });
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      // Solo comprimir si el archivo supera el umbral; de lo contrario subir original
      const fileToUpload = file.size > COMPRESS_THRESHOLD
        ? await compressImage(file)
        : file;

      const formData = new FormData();
      formData.append('file', fileToUpload, 'image.jpg');
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'moments');

      const rawUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            resolve(res.secure_url as string);
          } else {
            reject(new Error('Error al subir la imagen.'));
          }
        };

        xhr.onerror = () => reject(new Error('Error de red.'));
        xhr.send(formData);
      });

      // URL limpia — el template aplica transformaciones según contexto
      onChange(rawUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <span style={{
          display: 'block',
          fontSize: '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: C.muted,
          fontFamily: 'var(--font-jost)',
        }}>
          {label}
        </span>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `1px dashed ${uploading ? C.accent : C.border}`,
          borderRadius: '10px',
          backgroundColor: uploading ? C.accentLight : C.white,
          overflow: 'hidden',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {/* Preview — imagen completa sin recortar */}
        {value && !uploading && (
          <div style={{ position: 'relative', backgroundColor: '#F0EBE3' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cld(value, T.thumb)}
              alt="preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              title="Eliminar imagen"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Upload area */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          {uploading ? (
            <>
              <div style={{ width: '100%', height: '4px', backgroundColor: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: C.accent, transition: 'width 0.2s', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '12px', color: C.muted, fontFamily: 'var(--font-jost)' }}>
                Subiendo… {progress}%
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  padding: '8px 20px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: C.text,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jost)',
                  letterSpacing: '1px',
                }}
              >
                {value ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>
              <span style={{ fontSize: '11px', color: C.mutedLight, fontFamily: 'var(--font-jost)' }}>
                o arrastra aquí · JPG, PNG, WebP · cualquier tamaño
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: C.error, fontFamily: 'var(--font-jost)' }}>
          {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
