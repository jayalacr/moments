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

  const { data: event } = await supabase
    .from('events')
    .select('template_type, config')
    .eq('id', eventId)
    .single();
  if (!event) notFound();

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;
  if (!entry) notFound();

  const Template = entry.component;

  return (
    <>
      <style>{`html,body{scrollbar-width:none;}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}`}</style>
      <Template config={event.config ?? {}} />
    </>
  );
}
