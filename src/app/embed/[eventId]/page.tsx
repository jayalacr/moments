import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperadmin = profile?.role === 'superadmin';

  let eventQuery = supabase
    .from('events')
    .select('template_type, config, owner_id')
    .eq('id', eventId);

  if (!isSuperadmin) {
    eventQuery = eventQuery.eq('owner_id', user.id);
  }

  const { data: event } = await eventQuery.single();
  if (!event) notFound();

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;
  if (!entry) notFound();

  const Template = entry.component;

  return <Template config={event.config ?? {}} />;
}
