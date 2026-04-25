'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import type { DesignType, ExtensionKey } from '@/lib/pricing';

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

interface PricingPayload {
  designType: DesignType;
  extensionKey: ExtensionKey;
  customDesignFeeMxn: number;
}

export async function updateEventPricing(eventId: string, payload: PricingPayload) {
  const VALID_DESIGN: DesignType[] = ['template', 'custom'];
  const VALID_EXT: ExtensionKey[] = ['none', '1m', '3m'];

  if (!VALID_DESIGN.includes(payload.designType)) throw new Error('design_type inválido');
  if (!VALID_EXT.includes(payload.extensionKey)) throw new Error('extension_key inválido');
  if (!Number.isFinite(payload.customDesignFeeMxn) || payload.customDesignFeeMxn < 0) {
    throw new Error('custom_design_fee_mxn inválido');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Sin permisos');

  const { error } = await supabase
    .from('events')
    .update({
      design_type: payload.designType,
      extension_key: payload.extensionKey,
      custom_design_fee_mxn: Math.round(payload.designType === 'custom' ? payload.customDesignFeeMxn : 0),
    })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);
  return { success: true };
}

type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'expired';

export async function updatePaymentStatus(
  eventId: string,
  paymentStatus: PaymentStatus,
  paymentNotes: string | null,
) {
  const VALID: PaymentStatus[] = ['pending', 'partial', 'paid', 'refunded', 'expired'];
  if (!VALID.includes(paymentStatus)) throw new Error('payment_status inválido');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Sin permisos');

  const { error } = await supabase
    .from('events')
    .update({ payment_status: paymentStatus, payment_notes: paymentNotes ?? null })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  revalidatePath('/superadmin');
  revalidatePath(`/superadmin/eventos/${eventId}`);
  return { success: true };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const event_type = formData.get('event_type') as string;
  const plan = formData.get('plan') as string;
  const owner_id = formData.get('owner_id') as string;

  const template_type = (formData.get('template_type') as string) || null;

  const { data: newEvent, error } = await supabase
    .from('events')
    .insert({ title, slug, event_type, plan, owner_id, template_type, status: 'draft', config: {} })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Registrar al owner en event_organizers
  if (newEvent) {
    await supabase
      .from('event_organizers')
      .insert({ event_id: newEvent.id, profile_id: owner_id, role: 'owner' });
  }

  revalidatePath('/superadmin');
  redirect('/superadmin');
}

export interface OrganizerProfile {
  id: string;
  full_name: string | null;
  email: string;
}

async function requireSuperadmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Sin permisos');
  return supabase;
}

export async function addEventOrganizer(eventId: string, profileId: string) {
  const supabase = await requireSuperadmin();

  const { error } = await supabase
    .from('event_organizers')
    .insert({ event_id: eventId, profile_id: profileId, role: 'collaborator' });

  if (error) {
    if (error.code === '23505') throw new Error('El organizador ya está asignado a este evento');
    throw new Error(error.message);
  }

  revalidatePath(`/superadmin/eventos/${eventId}`);
  return { success: true };
}

export async function removeEventOrganizer(eventId: string, profileId: string) {
  const supabase = await requireSuperadmin();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: entry } = await supabase
    .from('event_organizers')
    .select('role')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .single();

  // Si es el owner, reasignar owner_id al superadmin antes de quitar (owner_id es NOT NULL)
  if (entry?.role === 'owner') {
    const { error: reassignError } = await supabase
      .from('events')
      .update({ owner_id: user.id })
      .eq('id', eventId);
    if (reassignError) throw new Error(reassignError.message);
  }

  const { error } = await supabase
    .from('event_organizers')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', profileId);

  if (error) throw new Error(error.message);

  revalidatePath(`/superadmin/eventos/${eventId}`);
  return { success: true };
}

export async function searchProfiles(query: string): Promise<OrganizerProfile[]> {
  const supabase = await requireSuperadmin();

  if (!query.trim()) return [];

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('role', 'organizador')
    .limit(8);

  return data ?? [];
}
