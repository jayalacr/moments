import DeluxeTemplate from '@/components/templates/deluxe/DeluxeTemplate';
import { DELUXE_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export const metadata = {
  title: 'Vista Previa Deluxe Clásico',
  description: 'Vista previa de la plantilla Deluxe Clásico para invitaciones digitales.',
};

export default async function DeluxePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: rawPlan } = await searchParams;
  const plan: EventPlan = VALID_PLANS.includes(rawPlan as EventPlan)
    ? (rawPlan as EventPlan)
    : 'deluxe';

  return (
    <>
      <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/deluxe" />
      <DeluxeTemplate key={plan} config={DELUXE_DEMO} plan={plan} />
    </>
  );
}
