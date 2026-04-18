import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function authorizeEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let query = supabase.from('events').select('*').eq('id', eventId);

  if (profile?.role === 'organizador') {
    query = query.eq('owner_id', user.id);
  }

  const { data: event, error } = await query.single();

  if (!event || error) redirect('/admin');

  return { event, profile: { ...profile, id: user.id }, user };
}
