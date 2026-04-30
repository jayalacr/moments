'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

