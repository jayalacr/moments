import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

export default async function PreviewPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('template_type, config')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!event) redirect('/admin');

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;
  if (!entry) notFound();

  const Template = entry.component;

  return <Template config={event.config ?? {}} />;
}
