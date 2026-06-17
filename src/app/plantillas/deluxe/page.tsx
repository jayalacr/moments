import DeluxeTemplate from '@/components/templates/deluxe/DeluxeTemplate';
import { DELUXE_DEMO } from '@/lib/demo-data';

export const metadata = {
  title: 'Vista Previa Deluxe',
  description: 'Vista previa de la plantilla del plan Deluxe para invitaciones digitales.',
};

export default function DeluxePreviewPage() {
  return <DeluxeTemplate config={DELUXE_DEMO} plan="deluxe" />;
}
