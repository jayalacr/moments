import JardinTemplate from '@/components/templates/jardin/JardinTemplate';
import { JARDIN_DEMO } from '@/lib/demo-data';
import FloatingPlanSwitcher from '@/components/templates/shared/FloatingPlanSwitcher';
import type { EventPlan } from '@/lib/plans';

const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

export const metadata = {
  title: 'Vista Previa Jardín',
  description: 'Vista previa de la plantilla Jardín para invitaciones digitales de boda al aire libre.',
};

export default async function JardinPreviewPage({
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
      {ui !== 'hidden' && <FloatingPlanSwitcher activePlan={plan} baseUrl="/plantillas/jardin" />}
      <JardinTemplate key={plan} config={JARDIN_DEMO} plan={plan} />
    </>
  );
}
