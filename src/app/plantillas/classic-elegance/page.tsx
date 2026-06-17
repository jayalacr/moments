import ClassicEleganceTemplate from '@/components/templates/classic-elegance/ClassicEleganceTemplate';
import { CLASSIC_ELEGANCE_DEMO } from '@/lib/demo-data';

export const metadata = {
  title: 'Vista Previa Classic Elegance',
  description: 'Vista previa de la plantilla Classic Elegance para invitaciones digitales de boda.',
};

export default function ClassicElegancePreviewPage() {
  return <ClassicEleganceTemplate config={CLASSIC_ELEGANCE_DEMO} plan="deluxe" />;
}
