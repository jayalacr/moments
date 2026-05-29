import EssentialTemplate from '@/components/templates/essential/EssentialTemplate';
import { ESSENTIAL_DEMO } from '@/lib/demo-data';

export const metadata = {
  title: 'Vista Previa Essential',
  description: 'Vista previa de la plantilla del plan Essential para invitaciones digitales.',
};

export default function EssentialPreviewPage() {
  return <EssentialTemplate config={ESSENTIAL_DEMO} />;
}
