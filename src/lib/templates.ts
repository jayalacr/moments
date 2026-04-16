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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateComponent = ComponentType<{
  config: any;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
}>;

export interface TemplateEntry {
  component: TemplateComponent;
  label: string;
  plan: 'essential' | 'plus' | 'deluxe';
}

import EssentialTemplate from '@/components/templates/essential/EssentialTemplate';
import PlusTemplate from '@/components/templates/plus/PlusTemplate';
import DeluxeTemplate from '@/components/templates/deluxe/DeluxeTemplate';
import WeddingDarkTemplate from '@/components/templates/wedding-dark/WeddingDarkTemplate';
import WeddingBeachTemplate from '@/components/templates/wedding-beach/WeddingBeachTemplate';

export const TEMPLATES: Record<string, TemplateEntry> = {
  'essential-demo': {
    component: EssentialTemplate as TemplateComponent,
    label: 'Essential — Demo clásico',
    plan: 'essential',
  },

  'plus-classic': {
    component: PlusTemplate as TemplateComponent,
    label: 'Plus — Clásico',
    plan: 'plus',
  },

  'deluxe-classic': {
    component: DeluxeTemplate as TemplateComponent,
    label: 'Deluxe — Clásico',
    plan: 'deluxe',
  },

  'wedding-dark-deluxe': {
    component: WeddingDarkTemplate as TemplateComponent,
    label: 'Wedding — Dark Deluxe',
    plan: 'deluxe',
  },

  'wedding-beach-essential': {
    component: WeddingBeachTemplate as TemplateComponent,
    label: 'Wedding — Beach Essential',
    plan: 'essential',
  },

  // Agrega nuevos templates aquí:
  // 'boda-rustica-2025': {
  //   component: BodaRustica,
  //   label: 'Boda Rústica 2025',
  //   plan: 'essential',
  // },
};
