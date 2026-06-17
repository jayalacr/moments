export type EventPlan = 'essential' | 'plus' | 'deluxe';

export interface PlanCapabilities {
  loader: boolean;
  music: boolean;
  countdown: boolean;
  carousel: 'none' | 'manual' | 'auto';
  mapsInteractive: boolean;
  recommendations: boolean;
  calendarButton: boolean;
  rsvpMode: 'whatsapp' | 'modalManual' | 'modalToken';
  dashboard: 'none' | 'global' | 'individual';
  maxPhotos: number;
}

export const PLAN_CAPABILITIES: Record<EventPlan, PlanCapabilities> = {
  essential: {
    loader: false,
    music: false,
    countdown: false,
    carousel: 'none',
    mapsInteractive: false,
    recommendations: false,
    calendarButton: false,
    rsvpMode: 'whatsapp',
    dashboard: 'none',
    maxPhotos: 5,
  },
  plus: {
    loader: false,
    music: false,
    countdown: true,
    carousel: 'manual',
    mapsInteractive: true,
    recommendations: true,
    calendarButton: false,
    rsvpMode: 'modalManual',
    dashboard: 'global',
    maxPhotos: 10,
  },
  deluxe: {
    loader: true,
    music: true,
    countdown: true,
    carousel: 'auto',
    mapsInteractive: true,
    recommendations: true,
    calendarButton: true,
    rsvpMode: 'modalToken',
    dashboard: 'individual',
    maxPhotos: 20,
  },
};

export function getCapabilities(plan: EventPlan | null | undefined): PlanCapabilities {
  return PLAN_CAPABILITIES[plan ?? 'deluxe'];
}
