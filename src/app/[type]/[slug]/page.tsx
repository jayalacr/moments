import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import InvitacionRenderer from './_components/InvitacionRenderer';

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
    .select('id, title, config, template_url')
    .eq('event_type', type)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!event?.template_url) notFound();

  // Fetcha el HTML desde Supabase Storage
  const res = await fetch(event.template_url, { next: { revalidate: 60 } });
  if (!res.ok) notFound();

  const html = await res.text();

  // Inyecta el config antes del </head> o al inicio si no hay head
  const configScript = `<script>window.__MOMENTS__=${JSON.stringify({ config: event.config ?? {} })}</script>`;
  const injected = html.includes('</head>')
    ? html.replace('</head>', `${configScript}</head>`)
    : configScript + html;

  return <InvitacionRenderer html={injected} />;
}
