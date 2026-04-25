export type Plan = 'essential' | 'plus' | 'deluxe';
export type ExtensionKey = 'none' | '1m' | '3m';
//export type DomainOption = 'none' | 'subdomain' | 'custom_purchase' | 'custom_config';
export type DesignType = 'template' | 'custom';

export const BASE_PRICES: Record<Plan, number> = {
  essential: 699,
  plus: 1199,
  deluxe: 1799,
};

export const EXTENSION_PRICES: Record<Plan, Record<ExtensionKey, number>> = {
  essential: { none: 0, '1m': 99, '3m': 249},
  plus:      { none: 0, '1m': 149, '3m': 379 },
  deluxe:    { none: 0, '1m': 199, '3m': 499 },
};

/* export const DOMAIN_PRICES: Record<DomainOption, number> = {
  none: 0,
  subdomain: 0,
  custom_purchase: 798,
  custom_config: 499,
}; */

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

export const EXTENSION_LABEL: Record<ExtensionKey, string> = {
  none: '1 mes (incluido)',
  '1m': '+1 mes adicional',
  '3m': '+3 meses'
};

/* export const DOMAIN_LABEL: Record<DomainOption, string> = {
  none: 'Sin dominio personalizado',
  subdomain: 'Subdominio Moments (nombre.moments.mx)',
  custom_purchase: 'Dominio propio (Moments lo compra)',
  custom_config: 'Dominio propio (solo configuración)',
}; */

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
  extensionKey: ExtensionKey;
  //domainOption: DomainOption;
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
  const { plan, designType, extensionKey,  customDesignFeeMxn = 0 } = input;

  const base = BASE_PRICES[plan];
  const extension = EXTENSION_PRICES[plan][extensionKey];
/*   const domainEligible = domainOption === 'subdomain' && !isSubdomainAvailable(plan)
    ? 'none'
    : domainOption;
  const domain = DOMAIN_PRICES[domainEligible]; */
  const customDesign = designType === 'custom' ? Math.max(0, customDesignFeeMxn) : 0;
  const hasCustomDesignEstimate = designType === 'custom' && customDesign === 0;

  const lineItems: LineItem[] = [
    {
      label: `Plan ${PLAN_LABEL[plan]}`,
      detail: 'Pago único · 1 mes de publicación incluido',
      amount: base,
    },
  ];

  if (extensionKey !== 'none') {
    lineItems.push({
      label: 'Extensión de publicación',
      detail: EXTENSION_LABEL[extensionKey],
      amount: extension,
    });
  }

/*   if (domainEligible !== 'none') {
    lineItems.push({
      label: 'Dominio personalizado',
      detail: DOMAIN_LABEL[domainEligible],
      amount: domain,
    });
  } */

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
