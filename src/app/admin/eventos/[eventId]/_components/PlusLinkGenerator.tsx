'use client';

import { useState } from 'react';
import { Link, Copy, Check, Sparkles } from 'lucide-react';
import { encodePasses } from '@/lib/rsvp-utils';

interface Props {
  baseUrl: string;
}

export default function PlusLinkGenerator({ baseUrl }: Props) {
  const [passes, setPasses] = useState(1);
  const [copied, setCopied] = useState(false);

  const code = encodePasses(passes);
  const fullUrl = `${baseUrl}?p=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: '24px',
      background: '#FDFBF7',
      border: '1px solid #EDE5D8',
      borderRadius: '20px',
      marginTop: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '8px', 
          background: 'rgba(201,168,124,0.15)', color: '#C9A87C',
          display: 'flex', alignItems: 'center', justify : 'center'
        }}>
          <Sparkles size={18} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', margin: 0 }}>
          Generador de links (Plan Plus)
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#9C8E82', lineHeight: 1.5, marginBottom: '20px' }}>
        Genera links especiales para invitados con un número específico de pases adicionales. 
        El número de pases va oculto en el link.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#C5B9B0', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Acompañantes permitidos
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setPasses(Math.max(0, passes - 1))}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #EDE5D8', background: 'white', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ fontSize: '18px', fontWeight: 500, minWidth: '24px', textAlign: 'center' }}>{passes}</span>
            <button 
              onClick={() => setPasses(passes + 1)}
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #EDE5D8', background: 'white', cursor: 'pointer' }}
            >
              +
            </button>
            <span style={{ fontSize: '12px', color: '#9C8E82', marginLeft: '8px' }}>
              ({passes === 0 ? 'Sin acompañantes' : passes === 1 ? '1 acompañante' : `${passes} acompañantes`})
            </span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#C5B9B0', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            Link para enviar por WhatsApp
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ 
              flex: 1, 
              padding: '10px 14px', 
              background: 'white', 
              border: '1px solid #EDE5D8', 
              borderRadius: '10px',
              fontSize: '12px',
              color: '#1C1611',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Link size={14} style={{ color: '#C9A87C' }} />
              {fullUrl}
            </div>
            <button 
              onClick={handleCopy}
              style={{
                padding: '0 16px',
                background: copied ? '#5A7A5A' : '#1C1611',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                minWidth: '100px',
                justifyContent: 'center'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
