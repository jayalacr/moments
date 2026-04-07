'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function toggleEventStatus(eventId: string, currentStatus: string) {
  const supabase = await createClient();
  const newStatus = currentStatus === 'published' ? 'paused' : 'published';
  await supabase.from('events').update({ status: newStatus }).eq('id', eventId);
  revalidatePath('/superadmin');
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const event_type = formData.get('event_type') as string;
  const plan = formData.get('plan') as string;
  const owner_id = formData.get('owner_id') as string;

  const { error } = await supabase.from('events').insert({
    title,
    slug,
    event_type,
    plan,
    owner_id,
    status: 'draft',
    config: {},
  });

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
  redirect('/superadmin');
}
