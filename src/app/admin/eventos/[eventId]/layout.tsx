import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

export default async function EventoLayout({ children, params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .single();

  if (!event) redirect('/admin');

  return <>{children}</>;
}
