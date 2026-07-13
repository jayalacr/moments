import Link from 'next/link';
import { Cormorant_Garamond, Jost, Montserrat } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';


const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-montserrat' });

export const metadata = {
  title: 'Plantillas · Moments',
  description: 'Explora los diseños disponibles para tu invitación digital. Todos los estilos funcionan con cualquier plan.',
};

const TEMPLATES = [
  {
    key: 'classic',
    name: 'Classic',
    tagline: 'Oscuro, dramático e inmersivo.',
    description: 'Fondo negro con tipografía dorada. Para parejas que buscan una presencia fuerte, cinematográfica y atemporal.',
    previewBase: '/plantillas/deluxe',
    style: 'dark' as const,
  },
  {
    key: 'elegance',
    name: 'Elegance',
    tagline: 'Marfil, papel y detalles en oro.',
    description: 'Textura de papel artesanal, transiciones suaves y paleta cálida. Romántico y con carácter propio.',
    previewBase: '/plantillas/classic-elegance',
    style: 'light' as const,
  },
];

const PLANS = [
  { key: 'essential', label: 'Essential' },
  { key: 'plus', label: 'Plus' },
  { key: 'deluxe', label: 'Deluxe' },
];

export default function PlantillasPage() {
  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --ivory:    #FAF7F2;
      --gold:     #B8965A;
      --gold-2:   #D4AA72;
      --charcoal: #1C1611;
      --warm-mid: #5C5248;
      --muted:    #E6DDD2;
      --muted-fg: #9B8B78;
      --font-c: var(--font-cormorant), Georgia, serif;
      --font-j: var(--font-jost), system-ui, sans-serif;
      --font-m: var(--font-montserrat), system-ui, sans-serif;
    }
    body { background: var(--ivory); color: var(--charcoal); font-family: var(--font-j); }

    .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }


    /* Hero */
    .hero { padding: 64px 24px 48px; text-align: center; position: relative; border-bottom: 1px solid var(--muted); }
    .hero::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1px; height: 52px; background: linear-gradient(to bottom, transparent, var(--gold)); }
    .hero h1 { font-family: var(--font-c); font-size: clamp(2.4rem, 5.5vw, 4rem); font-weight: 400; line-height: 1.1; color: var(--charcoal); margin-bottom: 20px; }
    .hero h1 em { font-style: italic; color: var(--gold); }
    .hero-ornament { display: flex; align-items: center; gap: 12px; justify-content: center; margin: 24px auto 0; max-width: 200px; opacity: 0.5; }
    .hero-ornament-line { flex: 1; height: 1px; background: var(--gold); }
    .hero p { font-size: 14px; font-weight: 300; color: var(--muted-fg); max-width: 460px; margin: 20px auto 0; line-height: 1.75; }

    /* Grid */
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; padding: 80px 0; }

    /* Card */
    .card { border-radius: 20px; overflow: hidden; border: 1px solid var(--muted); background: white; display: flex; flex-direction: column; }
    .card:hover .preview img { transform: scale(1.04); }

    /* Preview */
    .preview { height: 320px; position: relative; overflow: hidden; }
    .preview--dark { background: #1C1611; }
    .preview--light { background: #F8F5F0; }
    .preview-inner {
      width: 100%; height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 10px;
      padding: 2rem;
    }
    .p-label { font-family: var(--font-j); font-size: 9px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; }
    .preview--dark .p-label { color: rgba(184,150,90,0.6); }
    .preview--light .p-label { color: #9B8B78; }
    .p-names { font-family: var(--font-c); font-size: 52px; font-weight: 400; line-height: 1.1; text-align: center; }
    .preview--dark .p-names { color: rgba(250,247,242,0.92); }
    .preview--light .p-names { color: #2C2420; }
    .p-amp { font-style: italic; font-size: 38px; display: block; }
    .p-line { width: 56px; height: 1px; display: block; }
    .preview--dark .p-line { background: rgba(184,150,90,0.45); }
    .preview--light .p-line { background: #C9B99A; }
    .p-date { font-family: var(--font-j); font-size: 10px; font-weight: 300; letter-spacing: 0.2em; }
    .preview--dark .p-date { color: rgba(184,150,90,0.65); }
    .preview--light .p-date { color: #9B8B78; }
    .p-deco { position: absolute; top: 16px; left: 16px; right: 16px; height: 1px; }
    .preview--dark .p-deco { background: rgba(184,150,90,0.15); }
    .p-badge {
      position: absolute; top: 16px; right: 16px;
      font-family: var(--font-j); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 100px;
      background: rgba(184,150,90,0.15); border: 1px solid rgba(184,150,90,0.3); color: var(--gold);
    }

    /* Card body */
    .card-body { padding: 28px 28px 24px; flex: 1; display: flex; flex-direction: column; }
    .card-name { font-family: var(--font-c); font-size: 30px; font-weight: 400; margin-bottom: 6px; }
    .card-tagline { font-size: 13px; font-weight: 400; color: var(--gold); letter-spacing: 0.04em; margin-bottom: 12px; }
    .card-desc { font-size: 15px; font-weight: 300; color: var(--muted-fg); line-height: 1.75; margin-bottom: 28px; flex: 1; }

    /* Plan links */
    .plan-strip { border-top: 1px solid var(--muted); padding-top: 20px; display: flex; align-items: center; gap: 0; }
    .plan-label { font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted-fg); margin-right: 16px; white-space: nowrap; }
    .plan-links { display: flex; gap: 8px; flex-wrap: wrap; }
    .plan-link {
      font-family: var(--font-j); font-size: 11px; font-weight: 400; letter-spacing: 0.08em;
      color: var(--warm-mid); border: 1px solid var(--muted); border-radius: 100px;
      padding: 6px 16px; text-decoration: none; transition: border-color 0.18s, color 0.18s;
    }
    .plan-link:hover { border-color: var(--gold); color: var(--gold); }

    /* Soon card */
    .card--soon { border-style: dashed; background: transparent; }
    .soon-inner { padding: 60px 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; min-height: 320px; border-bottom: 1px dashed var(--muted); }
    .soon-circle { width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--muted); display: flex; align-items: center; justify-content: center; }
    .soon-circle svg { width: 24px; height: 24px; color: var(--muted-fg); }
    .soon-label { font-family: var(--font-c); font-size: 26px; font-weight: 400; color: var(--muted-fg); }
    .soon-sub { font-size: 14px; font-weight: 300; color: var(--muted-fg); max-width: 220px; line-height: 1.7; }
    .soon-body { padding: 24px 28px; }
    .soon-body p { font-size: 13px; color: var(--muted-fg); }

    /* Footer */
    .footer { border-top: 1px solid var(--muted); padding: 40px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .footer-brand { font-family: var(--font-m); font-size: 16px; font-weight: 300; letter-spacing: 0.22em; color: var(--warm-mid); }
    .footer-link { font-size: 13px; color: var(--muted-fg); text-decoration: none; }
    .footer-link:hover { color: var(--gold); }

    @media (max-width: 720px) {
      .grid { grid-template-columns: 1fr; gap: 24px; padding: 56px 0; }
      .preview { height: 260px; }
    }
  `;

  return (
    <div className={`${cormorant.variable} ${jost.variable} ${montserrat.variable}`}>
      <style suppressHydrationWarning>{css}</style>

      <SiteHeader />

      <main>
        <section className="hero">
          <h1>El estilo que <em>imaginas</em>,<br />el plan que necesitas.</h1>
          <div className="hero-ornament">
            <span className="hero-ornament-line" />
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 0L6.18 3.82L10 5L6.18 6.18L5 10L3.82 6.18L0 5L3.82 3.82L5 0Z" fill="#B8965A" />
            </svg>
            <span className="hero-ornament-line" />
          </div>
          <p>Cada diseño funciona con cualquier plan. El plan define las funciones — tú eliges la estética.</p>
        </section>

        <div className="wrap">
          <div className="grid">
            {TEMPLATES.map((tpl) => (
              <article key={tpl.key} className="card">
                <div className={`preview preview--${tpl.style}`}>
                  <span className="p-deco" />
                  <div className="preview-inner">
                    <span className="p-label">Nos casamos</span>
                    <div className="p-names">
                      Sofía<br />
                      <span className="p-amp">&amp;</span>
                      Mateo
                    </div>
                    <span className="p-line" />
                    <span className="p-date">14 · 02 · 2026</span>
                  </div>
                  <span className="p-badge">{tpl.name}</span>
                </div>
                <div className="card-body">
                  <div className="card-name">{tpl.name}</div>
                  <div className="card-tagline">{tpl.tagline}</div>
                  <p className="card-desc">{tpl.description}</p>
                  <div className="plan-strip">
                    <span className="plan-label">Ver demo</span>
                    <div className="plan-links">
                      {PLANS.map((p) => (
                        <Link
                          key={p.key}
                          className="plan-link"
                          href={`${tpl.previewBase}?plan=${p.key}`}
                        >
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <article className="card card--soon">
              <div className="soon-inner">
                <div className="soon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4l2.5 2.5" />
                  </svg>
                </div>
                <div className="soon-label">Próximo diseño</div>
                <p className="soon-sub">Seguimos creando. Un nuevo estilo llega pronto.</p>
              </div>
              <div className="soon-body">
                <p>¿Tienes una estética en mente? <a href="https://wa.me/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Cuéntanos →</a></p>
              </div>
            </article>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
