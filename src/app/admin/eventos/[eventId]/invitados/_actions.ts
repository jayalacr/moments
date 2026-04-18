'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { GuestRow, RsvpRow, GuestWithRsvp, RsvpStats } from '@/app/admin/invitados/types';

async function getAuthorizedEvent(supabase: Awaited<ReturnType<typeof createClient>>, eventId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: event } = await supabase
    .from('events')
    .select('id, slug, event_type, plan, config')
    .eq('id', eventId)
    .eq('owner_id', user.id)
    .single();

  return event ?? null;
}

export async function getGuestsForEvent(eventId: string): Promise<{
  guests: GuestRow[];
  event: { id: string; slug: string; event_type: string; plan: string; owner_id: string } | null;
  whatsappTemplate: string;
  rsvps: RsvpRow[];
  guestsWithRsvp: GuestWithRsvp[];
  stats: RsvpStats;
  maxCapacity: number | null;
}> {
  const supabase = await createClient();
  const event = await getAuthorizedEvent(supabase, eventId);
  const emptyReturn = { guests: [], event: null, whatsappTemplate: '', rsvps: [], guestsWithRsvp: [], stats: { confirmed: 0, declined: 0, pending: 0, totalSeats: 0 }, maxCapacity: null };
  if (!event) return emptyReturn;

  const { data: guestData } = await supabase
    .from('guests')
    .select('id, name, token, phone, max_companions, companion_names, created_at, rsvps(status, seats, companion_names)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });

  const guests = (guestData ?? []).map(g => {
    const rsvpArr = (g as any).rsvps;
    return { ...g, rsvp: rsvpArr && rsvpArr.length > 0 ? rsvpArr[0] : null };
  }) as GuestRow[];

  const config = (event as any).config as Record<string, unknown> | null;
  const whatsappTemplate = (config?.whatsappTemplate as string) ?? '';
  const maxCapacity: number | null = (config?.rsvp as Record<string, unknown> | undefined)?.maxCapacity as number | null ?? null;

  const { data: rsvpData } = await supabase
    .from('rsvps')
    .select('*, guests(name, token)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false });

  const rsvps = (rsvpData ?? []) as RsvpRow[];

  const stats = rsvps.reduce(
    (acc, r) => {
      if (r.status === 'confirmed') { acc.confirmed++; acc.totalSeats += r.seats; }
      else if (r.status === 'declined') { acc.declined++; }
      else { acc.pending++; }
      return acc;
    },
    { confirmed: 0, declined: 0, pending: 0, totalSeats: 0 },
  );

  let guestsWithRsvp: GuestWithRsvp[] = [];
  if (event.plan === 'deluxe') {
    const { data: gwrData } = await supabase
      .from('guests')
      .select('id, name, token, max_companions, companion_names, rsvps(id, status, seats, companion_names, dietary, created_at)')
      .eq('event_id', event.id)
      .order('name', { ascending: true });

    guestsWithRsvp = (gwrData ?? []).map(g => {
      const rsvpArr = (g as any).rsvps;
      return {
        id: g.id, name: g.name, token: g.token,
        max_companions: g.max_companions,
        companion_names: (g.companion_names as string[]) ?? [],
        rsvp: rsvpArr && rsvpArr.length > 0 ? rsvpArr[0] : null,
      };
    }) as GuestWithRsvp[];
  }

  return { guests, event: event as any, whatsappTemplate, rsvps, guestsWithRsvp, stats, maxCapacity };
}

export async function createGuest(
  eventId: string,
  formData: { name?: string; phone?: string; max_companions: number; companion_names?: string[] },
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getAuthorizedEvent(supabase, eventId);
  if (!event) return { error: 'No se encontró el evento.' };

  const { error } = await supabase.from('guests').insert({
    event_id: event.id,
    name: formData.name?.trim() || null,
    phone: formData.phone?.trim() || null,
    max_companions: formData.max_companions,
    companion_names: formData.companion_names ?? [],
  });

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un invitado con ese número de teléfono en este evento.' };
    return { error: error.message };
  }

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  formData: { name?: string; phone?: string; max_companions: number; companion_names?: string[] },
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getAuthorizedEvent(supabase, eventId);
  if (!event) return { error: 'No se encontró el evento.' };

  const { error } = await supabase
    .from('guests')
    .update({
      name: formData.name?.trim() || null,
      phone: formData.phone?.trim() || null,
      max_companions: formData.max_companions,
      companion_names: formData.companion_names ?? [],
    })
    .eq('id', guestId)
    .eq('event_id', event.id);

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un invitado con ese número de teléfono en este evento.' };
    return { error: error.message };
  }

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}

export async function deleteGuest(eventId: string, guestId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getAuthorizedEvent(supabase, eventId);
  if (!event) return { error: 'No se encontró el evento.' };

  const { error: rsvpError } = await supabase.from('rsvps').delete().eq('guest_id', guestId);
  if (rsvpError) return { error: rsvpError.message };

  const { error } = await supabase.from('guests').delete().eq('id', guestId).eq('event_id', event.id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}

export async function saveWhatsappTemplate(eventId: string, template: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getAuthorizedEvent(supabase, eventId);
  if (!event) return { error: 'No se encontró el evento.' };

  const currentConfig = ((event as any).config as Record<string, unknown>) ?? {};
  const newConfig = { ...currentConfig, whatsappTemplate: template.trim() };

  const { error } = await supabase.from('events').update({ config: newConfig }).eq('id', event.id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}

export async function saveMaxCapacity(eventId: string, capacity: number | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('id, config')
    .eq('id', eventId)
    .eq('owner_id', user.id)
    .single();

  if (!event) return { error: 'No se encontró el evento.' };

  const currentConfig = (event.config as Record<string, unknown>) ?? {};
  const currentRsvp = (currentConfig.rsvp as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from('events')
    .update({ config: { ...currentConfig, rsvp: { ...currentRsvp, maxCapacity: capacity } } })
    .eq('id', event.id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}

export async function updateGuestCompanions(
  eventId: string,
  guestId: string,
  maxCompanions: number,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado.' };

  const { data: guest } = await supabase
    .from('guests')
    .select('id, event_id, events(owner_id)')
    .eq('id', guestId)
    .single();

  if (!guest) return { error: 'Invitado no encontrado.' };
  const eventOwner = (guest as unknown as { events: { owner_id: string } }).events?.owner_id;
  if (eventOwner !== user.id) return { error: 'No autorizado.' };

  const { error } = await supabase.from('guests').update({ max_companions: maxCompanions }).eq('id', guestId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/eventos/${eventId}/invitados`);
  return {};
}
