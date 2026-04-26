import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SuperadminPreviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: event } = await supabase
    .from('events')
    .select('template_type, config')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;
  if (!entry) notFound();

  const Template = entry.component;

  return <Template config={event.config ?? {}} />;
}
