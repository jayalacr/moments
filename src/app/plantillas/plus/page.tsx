import PlusTemplate from '@/components/templates/plus/PlusTemplate';
import { PLUS_DEMO } from '@/lib/demo-data';

export const metadata = {
  title: 'Vista Previa Plus',
  description: 'Vista previa de la plantilla del plan Plus para invitaciones digitales.',
};

export default function PlusPreviewPage() {
  return <PlusTemplate config={PLUS_DEMO} />;
}
