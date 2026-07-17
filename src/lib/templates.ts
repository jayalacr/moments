/**
 * Registro central de templates disponibles.
 *
 * Para agregar un template nuevo:
 *   1. Crea el componente en src/components/templates/[nombre]/
 *   2. Agrégalo aquí con su clave y label
 *   3. Commit + push → Vercel despliega automáticamente
 *   4. En el superadmin, asigna el template_type al evento
 *
 * El plan (essential/plus/deluxe) se pasa como prop al componente — no va en este registro.
 */

import type { ComponentType } from 'react';
import type { EventPlan } from './plans';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateComponent = ComponentType<{
  config: any;
  plan?: EventPlan;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
  invalidToken?: boolean;
}>;

export interface TemplateEntry {
  component: TemplateComponent;
  label: string;
  hidden?: boolean;
}

import ClassicTemplate from '@/components/templates/classic/ClassicTemplate';
import EleganceTemplate from '@/components/templates/elegance/EleganceTemplate';
import CostaTemplate from '@/components/templates/costa/CostaTemplate';

export const TEMPLATES: Record<string, TemplateEntry> = {
  'classic': {
    component: ClassicTemplate as TemplateComponent,
    label: 'Classic',
  },

  'elegance': {
    component: EleganceTemplate as TemplateComponent,
    label: 'Elegance',
  },

  'costa': {
    component: CostaTemplate as TemplateComponent,
    label: 'Costa',
  },

  // ponytail: aliases de migración — borrar tras: UPDATE events SET template_type = 'classic' WHERE template_type = 'deluxe-classic'
  'deluxe-classic': {
    component: ClassicTemplate as TemplateComponent,
    label: 'Classic (legacy)',
    hidden: true,
  },
  'classic-elegance': {
    component: EleganceTemplate as TemplateComponent,
    label: 'Elegance (legacy)',
    hidden: true,
  },
};
