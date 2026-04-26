import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import PreviewClient from './_components/PreviewClient';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'wedding-planner') {
    redirect(`/admin/eventos/${eventId}/invitados`);
  }

  const { data: event } = await supabase
    .from('events')
    .select('template_type, config')
    .eq('id', eventId)
    .single();

  if (!event) redirect('/admin');

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;
  if (!entry) notFound();

  const Template = entry.component;

  return (
    <PreviewClient eventId={eventId}>
      <Template config={event.config ?? {}} />
    </PreviewClient>
  );
}
