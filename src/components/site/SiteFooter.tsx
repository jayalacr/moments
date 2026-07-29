import { Montserrat, Jost } from 'next/font/google';
import { Instagram } from 'lucide-react';
import { waLink } from '@/lib/contact';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300'], variable: '--font-montserrat' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost' });

const WA_HREF = waLink('Hola Moments, quiero cotizar mi invitación');

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.6 6.3A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 19.9a7.95 7.95 0 0 0 5.6-13.6Zm-5.6 12.2a6.6 6.6 0 0 1-3.4-.9l-.24-.15-2.5.66.67-2.43-.16-.25a6.6 6.6 0 1 1 5.63 3.06Zm3.6-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.5.64-.62.77-.23.15-.43.05a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.37c-.12-.2 0-.31.09-.41s.2-.23.3-.35a1.36 1.36 0 0 0 .2-.33.37.37 0 0 0 0-.35c0-.1-.44-1.06-.6-1.45s-.32-.33-.44-.34h-.37a.72.72 0 0 0-.52.24 2.17 2.17 0 0 0-.68 1.62a3.77 3.77 0 0 0 .79 2 8.63 8.63 0 0 0 3.3 2.92c.46.2.82.32 1.1.41a2.65 2.65 0 0 0 1.21.08 2 2 0 0 0 1.3-.92 1.6 1.6 0 0 0 .12-.92c-.05-.08-.18-.13-.38-.23Z" />
    </svg>
  );
}

const css = `
  .sf { background: #111; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.08); }
  .sf__inner {
    max-width: 1100px; margin: 0 auto; padding: 0 24px;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  }
  .sf__copy { font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; font-weight: 300; color: rgba(250,247,242,0.2); justify-self: start; }
  .sf__wordmark { font-family: var(--font-montserrat), 'Montserrat', system-ui, sans-serif; font-size: 16px; font-weight: 300; letter-spacing: 0.26em; color: rgba(250,247,242,0.4); }
  .sf__links { display: flex; align-items: center; gap: 24px; justify-self: end; }
  .sf__links a { color: rgba(250,247,242,0.35); text-decoration: none; display: flex; transition: color 0.18s; }
  .sf__links a:hover { color: #B8965A; }
  .sf__wa { width: 22px; height: 22px; }
  @media (max-width: 600px) {
    .sf__inner { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 12px; }
    .sf__wordmark { grid-column: 1 / -1; text-align: center; }
    .sf__copy { grid-row: 2; }
    .sf__links { grid-row: 2; }
  }
`;

export default function SiteFooter() {
  return (
    <div className={`${montserrat.variable} ${jost.variable}`}>
      <style suppressHydrationWarning>{css}</style>
      <footer className="sf">
        <div className="sf__inner">
          <span className="sf__copy">© 2026 Powered by code4u</span>
          <span className="sf__wordmark">moments</span>
          <div className="sf__links">
            {WA_HREF && (
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon className="sf__wa" />
              </a>
            )}
            <a href="https://www.instagram.com/code4u_mx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
