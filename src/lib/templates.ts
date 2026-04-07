/**
 * Registro de templates disponibles.
 *
 * Cada clave es el valor que se guarda en events.template_type.
 * Para agregar un template nuevo:
 *   1. Crea el componente en src/components/templates/[nombre]/
 *   2. Agrégalo aquí con su clave
 *
 * El plan define las features disponibles (Essential/Plus/Deluxe).
 * El template_type define el diseño visual único de cada invitación.
 */

import type { ComponentType } from 'react';
import type { EssentialConfig } from '@/components/templates/essential/EssentialTemplate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateComponent = ComponentType<{ config: any }>;

// Importaciones estáticas de templates registrados
import EssentialTemplate from '@/components/templates/essential/EssentialTemplate';

export const TEMPLATES: Record<string, TemplateComponent> = {
  // Templates de ejemplo (referencia por plan)
  'essential-demo': EssentialTemplate as TemplateComponent,

  // Templates de invitaciones reales — agrega aquí los nuevos
  // 'boda-clasica-dorado': BodaClasicaDorado,
  // 'boda-rustica-flores':  BodaRusticaFlores,
  // 'xv-botanico':          XVBotanico,
};

export type { EssentialConfig };
