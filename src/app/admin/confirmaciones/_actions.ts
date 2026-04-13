'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface RsvpRow {
  id: string;
  guest_id: string | null;
  name: string;
  seats: number;
  companion_names: string[];
  dietary: string | null;
  status: 'confirmed' | 'declined' | 'pending';
  created_at: string;
  guests: { name: string | null; token: string } | null;
}

export interface RsvpStats {
  confirmed: number;
  declined: number;
  pending: number;
  totalSeats: number;
}

export async function getRsvpsForOwnEvent(): Promise<{
  rsvps: RsvpRow[];
  event: { id: string; slug: string; event_type: string; plan: string } | null;
  stats: RsvpStats;
  maxCapacity: number | null;
}> {
  const empty = { rsvps: [], event: null, stats: { confirmed: 0, declined: 0, pending: 0, totalSeats: 0 }, maxCapacity: null };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data: event } = await supabase
    .from('events')
    .select('id, slug, event_type, plan, config')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!event) return empty;

  const maxCapacity: number | null = (event.config as Record<string, unknown> | null)?.rsvp
    ? ((event.config as Record<string, Record<string, unknown>>).rsvp.maxCapacity as number | null) ?? null
    : null;

  const { data } = await supabase
    .from('rsvps')
    .select('*, guests(name, token)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });

  const rsvps = (data ?? []) as RsvpRow[];

  const stats: RsvpStats = rsvps.reduce(
    (acc, r) => {
      if (r.status === 'confirmed') {
        acc.confirmed++;
        acc.totalSeats += r.seats;
      } else if (r.status === 'declined') {
        acc.declined++;
      } else {
        acc.pending++;
      }
      return acc;
    },
    { confirmed: 0, declined: 0, pending: 0, totalSeats: 0 },
  );

  return { rsvps, event, stats, maxCapacity };
}

export async function saveMaxCapacity(capacity: number | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado.' };

  const { data: event } = await supabase
    .from('events')
    .select('id, config')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!event) return { error: 'No se encontró el evento.' };

  const currentConfig = (event.config as Record<string, unknown>) ?? {};
  const currentRsvp = (currentConfig.rsvp as Record<string, unknown>) ?? {};

  const newConfig = {
    ...currentConfig,
    rsvp: { ...currentRsvp, maxCapacity: capacity },
  };

  const { error } = await supabase
    .from('events')
    .update({ config: newConfig })
    .eq('id', event.id);

  if (error) return { error: error.message };

  revalidatePath('/admin/confirmaciones');
  return {};
}
