import { Cormorant_Garamond, Jost } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from '../../components/admin/AdminLayoutClient';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});

const C = {
  bg: '#F8F3EC',
  text: '#1C1611',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user?.id ?? '')
    .single();

  const { data: events } = await supabase
    .from('events')
    .select('id, title, plan')
    .eq('owner_id', user?.id ?? '')
    .order('created_at', { ascending: false });

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
