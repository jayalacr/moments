import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

interface Props {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { type, slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('event_type', type)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!event) return { title: 'Invitación — Moments' };
  return { title: event.title, description: `Estás invitado — ${event.title}` };
}

export default async function InvitacionPage({ params }: Props) {
  const { type, slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, template_type, config')
    .eq('event_type', type)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!event) notFound();

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;

  if (!entry) notFound();

  const Template = entry.component;

  return <Template config={event.config ?? {}} />;
}
