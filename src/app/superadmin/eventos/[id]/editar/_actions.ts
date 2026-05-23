'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

async function assertSuperadmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superadmin') redirect('/admin');

  return supabase;
}

export async function updateSubdomain(eventId: string, subdomain: string): Promise<{ error?: string } | void> {
  await assertSuperadmin();

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain) && subdomain.length > 1) {
    return { error: 'Formato inválido: solo minúsculas, números y guiones' };
  }

  // Use admin client to check uniqueness across all events
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('events')
    .select('id')
    .eq('subdomain', subdomain)
    .neq('id', eventId)
    .maybeSingle();

  if (existing) {
    return { error: `El subdominio "${subdomain}" ya está en uso` };
  }

  const { error } = await admin.from('events').update({ subdomain }).eq('id', eventId);
  if (error) return { error: error.message };

  revalidatePath(`/superadmin/eventos/${eventId}/editar`);
}

export async function updateEventConfig(eventId: string, config: Record<string, unknown>) {
  const supabase = await assertSuperadmin();

  const { error } = await supabase.from('events').update({ config }).eq('id', eventId);
  if (error) throw new Error(error.message);

  const { data: event } = await supabase
    .from('events')
    .select('slug, event_type')
    .eq('id', eventId)
    .single();

  revalidatePath(`/superadmin/eventos/${eventId}`);
  revalidatePath(`/superadmin/eventos/${eventId}/editar`);
  if (event) {
    revalidatePath(`/${event.event_type}/${event.slug}`);
  }
}
