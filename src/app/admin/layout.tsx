import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from '../../components/admin/AdminLayoutClient';
import { cormorant, jost } from '@/lib/adminFonts';

export const metadata: Metadata = {
  title: {
    default: "Panel de Organizador",
    template: "%s — Moments",
  },
};

const C = {
  bg: '#F8F3EC',
  text: '#1C1611',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user?.id ?? '')
    .single();

  let events: { id: string; title: string; plan: string }[] | null = null;

  if (profile?.role === 'superadmin') {
    const { data } = await supabase
      .from('events')
      .select('id, title, plan')
      .order('created_at', { ascending: false });
    events = data;
  } else {
    const { data: orgEntries } = await supabase
      .from('event_organizers')
      .select('event_id')
      .eq('profile_id', user?.id ?? '');

    const eventIds = orgEntries?.map(e => e.event_id) ?? [];

    if (eventIds.length) {
      const { data } = await supabase
        .from('events')
        .select('id, title, plan')
        .in('id', eventIds)
        .order('created_at', { ascending: false });
      events = data;
    }
  }

  return (
    <div
      className={`${cormorant.variable} ${jost.variable}`}
      style={{
        backgroundColor: C.bg,
        fontFamily: 'var(--font-jost)',
      }}
    >
      <AdminLayoutClient profile={profile} events={events || []}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
