'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Acepta el config como string JSON para evitar problemas de serialización
// con objetos complejos (NaN, undefined, objetos no-serializables) en React Server Actions.
export async function updateEventConfig(eventId: string, configJson: string) {
  let config: unknown;
  try {
    config = JSON.parse(configJson);
  } catch {
    throw new Error('Config inválido: no es JSON válido.');
  }

  const supabase = await createClient();

  const { data: me } = await supabase.auth.getUser();
  if (!me.user) throw new Error('No autenticado.');

  const { error } = await supabase
    .from('events')
    .update({ config })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  // Obtener slug y tipo para revalidar la invitación pública
  const { data: event } = await supabase
    .from('events')
    .select('slug, event_type')
    .eq('id', eventId)
    .single();

  revalidatePath('/admin');
  if (event) {
    revalidatePath(`/${event.event_type}/${event.slug}`);
  }
}
