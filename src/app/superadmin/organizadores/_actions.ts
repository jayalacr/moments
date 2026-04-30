'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function inviteOrganizador(formData: FormData) {
  const name  = (formData.get('name')  as string).trim();
  const email = (formData.get('email') as string).trim();
  const role  = (formData.get('role')  as string).trim() || 'organizador';

  if (!name || !email) throw new Error('Nombre y email son requeridos.');
  if (!['organizador', 'wedding-planner'].includes(role)) throw new Error('Rol inválido.');

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?type=invite`,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin/organizadores');
  redirect('/superadmin/organizadores');
}

export async function deleteOrganizador(organizadorId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Sin permisos');

  const admin = createAdminClient();

  // Reasignar owner_id al superadmin en eventos donde el organizador era dueño
  // (owner_id es NOT NULL, no se puede dejar vacío)
  const { error: reassignError } = await admin
    .from('events')
    .update({ owner_id: user.id })
    .eq('owner_id', organizadorId);

  if (reassignError) throw new Error(`Error al reasignar eventos: ${reassignError.message}`);

  // Eliminar el usuario de auth (cascadea a profiles y a todas sus entradas en event_organizers)
  const { error: authError } = await admin.auth.admin.deleteUser(organizadorId);
  if (authError) throw new Error(`Error al eliminar usuario: ${authError.message}`);

  revalidatePath('/superadmin/organizadores');
}

