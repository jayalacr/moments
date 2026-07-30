import EleganceTemplate from '@/components/templates/elegance/EleganceTemplate';
import { CLASSIC_ELEGANCE_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export const metadata = {
  title: 'Vista Previa Classic Elegance',
  description: 'Vista previa de la plantilla Classic Elegance para invitaciones digitales de boda.',
};

export default async function ClassicElegancePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ui?: string }>;
}) {
  const { plan: rawPlan, ui } = await searchParams;
  const plan: EventPlan = VALID_PLANS.includes(rawPlan as EventPlan)
    ? (rawPlan as EventPlan)
    : 'deluxe';

  return (
    <>
      {ui !== 'hidden' && <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/classic-elegance" />}
      <EleganceTemplate key={plan} config={CLASSIC_ELEGANCE_DEMO} plan={plan} />
    </>
  );
}
