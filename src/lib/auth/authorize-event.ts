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

  if (profile?.role === 'organizador') {
    const { data: membership } = await supabase
      .from('event_organizers')
      .select('role')
      .eq('event_id', eventId)
      .eq('profile_id', user.id)
      .single();

    if (!membership) redirect('/admin');
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event || error) redirect('/admin');

  return { event, profile: { ...profile, id: user.id }, user };
}
