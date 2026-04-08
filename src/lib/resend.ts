import 'server-only';
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`;

  await resend.emails.send({
    from: 'Moments <onboarding@resend.dev>',
    to,
    subject: 'Bienvenido a Moments — Tu panel está listo',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8F3EC;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F3EC;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;color:#C9A87C;text-transform:uppercase;">
                Moments
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#fff;border-radius:12px;padding:40px 40px 32px;border:1px solid #EDE5D8;">

              <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;color:#C9A87C;text-transform:uppercase;">
                Bienvenido
              </p>
              <h1 style="margin:0 0 20px;font-size:26px;font-weight:300;color:#1C1611;line-height:1.2;">
                Hola, ${name} 👋
              </h1>

              <div style="height:1px;background:linear-gradient(90deg,transparent,#C9A87C,transparent);margin:0 0 24px;"></div>

              <p style="margin:0 0 16px;font-size:14px;color:#4A3F35;line-height:1.7;">
                Tu acceso al panel de Moments ha sido creado. Desde aquí podrás
                personalizar tu invitación con todos los detalles de tu evento.
              </p>

              <p style="margin:0 0 28px;font-size:14px;color:#4A3F35;line-height:1.7;">
                Ya puedes ingresar con tu correo y la contraseña que elegiste.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#1C1611;border-radius:8px;">
                    <a href="${adminUrl}"
                       style="display:inline-block;padding:14px 32px;color:#F8F3EC;font-size:12px;
                              letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
                      Ir a mi panel
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#9C8E82;text-align:center;line-height:1.6;">
                Si tienes alguna duda, responde este correo y con gusto te ayudamos.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#B5A99A;">
                © ${new Date().getFullYear()} Moments · Invitaciones digitales
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
