import { inviteOrganizador } from '../_actions';
import Link from 'next/link';

const C = {
  bg: '#0D1117', border: '#222D3F', borderBright: '#2D3F57',
  accent: '#2DD4BF', accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB', muted: '#7A90A8', mutedMid: '#9DB2C8',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: `1px solid ${C.border}`, borderRadius: '8px',
  backgroundColor: '#161B22', fontSize: '14px',
  color: C.text, fontFamily: 'var(--font-mono)',
  outline: 'none', boxSizing: 'border-box',
};

export default function NuevoOrganizadorPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: '480px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin/organizadores" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, textDecoration: 'none' }}>
          /organizadores
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.accent }}>nuevo</span>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: C.muted, marginBottom: '8px' }}>
          INVITAR ORGANIZADOR
        </p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 400, color: C.text }}>
          Nuevo organizador
        </h1>
        <p style={{ marginTop: '8px', fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>
          Se enviará un email de invitación con un enlace para crear su contraseña.
        </p>
      </div>

      <form action={inviteOrganizador} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: C.muted, textTransform: 'uppercase' }}>
            Nombre completo
          </label>
          <input name="name" required style={inputStyle} placeholder="Sofía Herrera López" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: C.muted, textTransform: 'uppercase' }}>
            Correo electrónico
          </label>
          <input name="email" type="email" required style={inputStyle} placeholder="sofia@ejemplo.com" />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 24px', backgroundColor: C.accent,
              color: '#0D1117', border: 'none', borderRadius: '8px',
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              letterSpacing: '2px', textTransform: 'uppercase',
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            Enviar invitación
          </button>
          <Link
            href="/superadmin/organizadores"
            style={{
              padding: '10px 20px', border: `1px solid ${C.border}`,
              borderRadius: '8px', fontFamily: 'var(--font-mono)',
              fontSize: '11px', color: C.muted, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
