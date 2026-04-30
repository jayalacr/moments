'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateEventConfig(eventId: string, config: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('events')
    .update({ config })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  const { data: event } = await supabase
    .from('events')
    .select('slug, event_type')
    .eq('id', eventId)
    .single();

  revalidatePath(`/admin/eventos/${eventId}`);
  revalidatePath(`/admin/eventos/${eventId}/editar`);
  if (event) {
    revalidatePath(`/${event.event_type}/${event.slug}`);
  }
}
