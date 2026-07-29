import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { cormorant, jost } from '@/lib/adminFonts';

export const metadata: Metadata = {
  title: {
    default: 'Superadmin',
    template: '%s — Moments',
  },
};

const C = {
  bg: '#F8F3EC',
  text: '#1C1611',
};

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user?.id ?? '')
    .single();

  const { data: events } = await supabase
    .from('events')
    .select('id, title, plan')
    .order('created_at', { ascending: false });

  return (
    <div
      className={`${cormorant.variable} ${jost.variable}`}
      style={{
        backgroundColor: C.bg,
        fontFamily: 'var(--font-jost)',
      }}
    >
      <AdminLayoutClient profile={profile} events={events || []} basePath="/superadmin">
        {children}
      </AdminLayoutClient>
    </div>
  );
}
