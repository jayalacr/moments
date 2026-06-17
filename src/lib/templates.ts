/**
 * Registro central de templates disponibles.
 *
 * Para agregar un template nuevo:
 *   1. Crea el componente en src/components/templates/[nombre]/index.tsx
 *   2. Agrégalo aquí con su clave, label y plan
 *   3. Commit + push → Vercel despliega automáticamente
 *   4. En el superadmin, asigna el template_type al evento
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
}

import EssentialTemplate from '@/components/templates/essential/EssentialTemplate';
import PlusTemplate from '@/components/templates/plus/PlusTemplate';
import DeluxeTemplate from '@/components/templates/deluxe/DeluxeTemplate';
import ClassicEleganceTemplate from '@/components/templates/classic-elegance/ClassicEleganceTemplate';

export const TEMPLATES: Record<string, TemplateEntry> = {
  'essential-demo': {
    component: EssentialTemplate as TemplateComponent,
    label: 'Essential — Demo clásico',
  },

  'plus-classic': {
    component: PlusTemplate as TemplateComponent,
    label: 'Plus — Clásico',
  },

  'deluxe-classic': {
    component: DeluxeTemplate as TemplateComponent,
    label: 'Deluxe — Clásico',
  },

  'classic-elegance': {
    component: ClassicEleganceTemplate as TemplateComponent,
    label: 'Classic Elegance',
  },

  // Agrega nuevos templates aquí:
  // 'boda-rustica-2025': {
  //   component: BodaRustica,
  //   label: 'Boda Rústica 2025',
  //   plan: 'essential',
  // },
};
