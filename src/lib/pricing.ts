export type Plan = 'essential' | 'plus' | 'deluxe';
export type DesignType = 'template' | 'custom';

export const BASE_PRICES: Record<Plan, number> = {
  essential: 699,
  plus: 1199,
  deluxe: 1499,
};

/** Meses de publicación incluidos en el precio base, contados desde la fecha del evento hacia atrás (cuánto antes de la boda se puede publicar sin pagar extra). */
export const INCLUDED_MONTHS = 2;

export const EXTRA_MONTH_PRICE_BY_PLAN: Record<Plan, number> = {
  essential: 99,
  plus: 149,
  deluxe: 199,
};

export const PLAN_LABEL: Record<Plan, string> = {
  essential: 'Essential',
  plus: 'Plus',
  deluxe: 'Deluxe',
};

export const PLAN_TAGLINE: Record<Plan, string> = {
  essential: 'Sencillo y elegante',
  plus: 'Experiencia completa',
  deluxe: 'Premium e inmersivo',
};

export const DESIGN_LABEL: Record<DesignType, string> = {
  template: 'Plantilla prediseñada',
  custom: 'Diseño personalizado',
};

export function isSubdomainAvailable(plan: Plan): boolean {
  return plan === 'plus' || plan === 'deluxe';
}

export function formatMXN(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export interface QuoteInput {
  plan: Plan;
  designType: DesignType;
  extensionMonths: number;
  customDesignFeeMxn?: number;
}

export interface LineItem {
  label: string;
  detail?: string;
  amount: number;
  isEstimate?: boolean;
}

export interface QuoteBreakdown {
  base: number;
  extension: number;
  customDesign: number;
  total: number;
  hasCustomDesignEstimate: boolean;
  lineItems: LineItem[];
}

export function calcularTotal(input: QuoteInput): QuoteBreakdown {
  const { plan, designType, extensionMonths, customDesignFeeMxn = 0 } = input;

  const base = BASE_PRICES[plan];
  const extension = extensionMonths * EXTRA_MONTH_PRICE_BY_PLAN[plan];
  const customDesign = designType === 'custom' ? Math.max(0, customDesignFeeMxn) : 0;
  const hasCustomDesignEstimate = designType === 'custom' && customDesign === 0;

  const lineItems: LineItem[] = [
    {
      label: `Plan ${PLAN_LABEL[plan]}`,
      detail: `Pago único · ${INCLUDED_MONTHS} meses de anticipación incluidos`,
      amount: base,
    },
  ];

  if (extensionMonths > 0) {
    lineItems.push({
      label: 'Publicación anticipada',
      detail: `${extensionMonths} mes${extensionMonths !== 1 ? 'es' : ''} adicional${extensionMonths !== 1 ? 'es' : ''} × ${formatMXN(EXTRA_MONTH_PRICE_BY_PLAN[plan])}`,
      amount: extension,
    });
  }

  if (designType === 'custom') {
    lineItems.push({
      label: 'Diseño personalizado',
      detail: hasCustomDesignEstimate
        ? 'Se cotiza según el alcance de las modificaciones'
        : 'Cotización definida',
      amount: customDesign,
      isEstimate: hasCustomDesignEstimate,
    });
  }

  const total = base + extension + customDesign;

  return {
    base,
    extension,
    customDesign,
    total,
    hasCustomDesignEstimate,
    lineItems,
  };
}
