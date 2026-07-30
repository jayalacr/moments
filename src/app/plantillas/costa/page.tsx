import CostaTemplate from '@/components/templates/costa/CostaTemplate';
import { COSTA_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export const metadata = {
  title: 'Vista Previa Costa',
  description: 'Vista previa de la plantilla Costa para invitaciones digitales de boda en la playa.',
};

export default async function CostaPreviewPage({
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
      {ui !== 'hidden' && <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/costa" />}
      <CostaTemplate key={plan} config={COSTA_DEMO} plan={plan} />
    </>
  );
}
