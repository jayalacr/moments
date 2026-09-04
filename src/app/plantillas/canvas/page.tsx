import CanvasTemplate from '@/components/templates/canvas/CanvasTemplate';
import { CANVAS_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export const metadata = {
  title: 'Vista Previa Canvas',
  description: 'Vista previa de la plantilla Canvas: el diseño es una imagen y el texto se coloca encima.',
};

export default async function CanvasPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ui?: string }>;
}) {
  const { plan: rawPlan, ui } = await searchParams;
  const plan: EventPlan = VALID_PLANS.includes(rawPlan as EventPlan) ? (rawPlan as EventPlan) : 'deluxe';

  return (
    <>
      {ui !== 'hidden' && <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/canvas" />}
      <CanvasTemplate key={plan} config={CANVAS_DEMO} plan={plan} />
    </>
  );
}
