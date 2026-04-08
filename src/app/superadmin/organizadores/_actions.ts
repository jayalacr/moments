'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function inviteOrganizador(formData: FormData) {
  const name  = (formData.get('name')  as string).trim();
  const email = (formData.get('email') as string).trim();

  if (!name || !email) throw new Error('Nombre y email son requeridos.');

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      role: 'organizador',
    },
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?type=invite`,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin/organizadores');
  redirect('/superadmin/organizadores');
}
