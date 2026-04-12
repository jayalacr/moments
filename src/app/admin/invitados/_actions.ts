'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface GuestRow {
  id: string;
  name: string | null;
  token: string;
  max_companions: number;
  companion_names: string[];
  created_at: string;
}

async function getOwnEvent(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: event } = await supabase
    .from('events')
    .select('id, slug, event_type, plan')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return event ?? null;
}

export async function getGuestsForOwnEvent(): Promise<{
  guests: GuestRow[];
  event: { id: string; slug: string; event_type: string; plan: string } | null;
}> {
  const supabase = await createClient();
  const event = await getOwnEvent(supabase);
  if (!event) return { guests: [], event: null };

  const { data } = await supabase
    .from('guests')
    .select('id, name, token, max_companions, companion_names, created_at')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true });

  return { guests: (data ?? []) as GuestRow[], event };
}

export async function createGuest(formData: {
  name?: string;
  max_companions: number;
  companion_names?: string[];
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getOwnEvent(supabase);
  if (!event) return { error: 'No se encontró el evento.' };

  const { error } = await supabase.from('guests').insert({
    event_id: event.id,
    name: formData.name?.trim() || null,
    max_companions: formData.max_companions,
    companion_names: formData.companion_names ?? [],
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/invitados');
  return {};
}

export async function updateGuest(
  guestId: string,
  formData: {
    name?: string;
    max_companions: number;
    companion_names?: string[];
  }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getOwnEvent(supabase);
  if (!event) return { error: 'No se encontró el evento.' };

  const { error } = await supabase
    .from('guests')
    .update({
      name: formData.name?.trim() || null,
      max_companions: formData.max_companions,
      companion_names: formData.companion_names ?? [],
    })
    .eq('id', guestId)
    .eq('event_id', event.id);

  if (error) return { error: error.message };

  revalidatePath('/admin/invitados');
  return {};
}

export async function deleteGuest(guestId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const event = await getOwnEvent(supabase);
  if (!event) return { error: 'No se encontró el evento.' };

  // Eliminar RSVPs del invitado antes de eliminarlo
  const { error: rsvpError } = await supabase
    .from('rsvps')
    .delete()
    .eq('guest_id', guestId);

  if (rsvpError) return { error: rsvpError.message };

  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', guestId)
    .eq('event_id', event.id);

  if (error) return { error: error.message };

  revalidatePath('/admin/invitados');
  return {};
}
