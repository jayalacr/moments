'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';

export async function updateTemplateType(eventId: string, templateType: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('events')
    .update({ template_type: templateType || null })
    .eq('id', eventId);
  if (error) throw new Error(error.message);
  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);
}

export async function toggleEventStatus(eventId: string, currentStatus: string) {
  const supabase = await createClient();
  const newStatus = currentStatus === 'published' ? 'paused' : 'published';
  await supabase.from('events').update({ status: newStatus }).eq('id', eventId);
  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);
}

export async function setEventDraft(eventId: string) {
  const supabase = await createClient();
  await supabase.from('events').update({ status: 'draft' }).eq('id', eventId);
  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);
}

type EventPlan = 'essential' | 'plus' | 'deluxe';

export async function updateEventPlan(
  eventId: string,
  newPlan: EventPlan
): Promise<{ success: boolean; templateCleared: boolean }> {
  const VALID_PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];
  if (!VALID_PLANS.includes(newPlan)) throw new Error('Plan inválido');

  const supabase = await createClient();

  // Verificar superadmin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Sin permisos');

  // Leer evento actual para evaluar compatibilidad de template
  const { data: event } = await supabase
    .from('events')
    .select('template_type')
    .eq('id', eventId)
    .single();

  let templateTypeToSet: string | null = event?.template_type ?? null;
  let templateCleared = false;

  if (templateTypeToSet && TEMPLATES[templateTypeToSet]?.plan !== newPlan) {
    templateTypeToSet = null;
    templateCleared = true;
  }

  const { error } = await supabase
    .from('events')
    .update({ plan: newPlan, template_type: templateTypeToSet })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);

  return { success: true, templateCleared };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const event_type = formData.get('event_type') as string;
  const plan = formData.get('plan') as string;
  const owner_id = formData.get('owner_id') as string;

  const template_type = (formData.get('template_type') as string) || null;

  const { error } = await supabase.from('events').insert({
    title,
    slug,
    event_type,
    plan,
    owner_id,
    template_type,
    status: 'draft',
    config: {},
  });

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
  redirect('/superadmin');
}
