'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateEventConfig(eventId: string, config: Record<string, unknown>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({ config, status: 'setup' })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/admin/editar');
}
