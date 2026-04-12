'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateEventConfig(eventId: string, config: Record<string, unknown>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({ config })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  // Obtener slug y tipo para revalidar la invitación pública
  const { data: event } = await supabase
    .from('events')
    .select('slug, event_type')
    .eq('id', eventId)
    .single();

  revalidatePath('/admin');
  revalidatePath('/admin/editar');
  if (event) {
    revalidatePath(`/${event.event_type}/${event.slug}`);
  }
}
