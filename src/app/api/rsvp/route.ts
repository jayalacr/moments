import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido.' }, { status: 400 });
  }

  const { token, eventId, name, seats, companionNames, dietary, dietaryPerPerson, status } = body as {
    token?: string;
    eventId?: string;
    name?: string;
    seats?: number;
    companionNames?: string[];
    dietary?: string;
    dietaryPerPerson?: Record<string, string[]>;
    status?: string;
  };

  if (!name || !status) {
    return NextResponse.json({ error: 'Faltan campos requeridos: name, status.' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Se requiere un token de invitado válido.' }, { status: 401 });
  }

  if (status !== 'confirmed' && status !== 'declined') {
    return NextResponse.json({ error: 'El campo status debe ser "confirmed" o "declined".' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── Modo con token (Deluxe: invitado individual con datos precargados) ──────
  if (token) {
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, event_id, max_companions')
      .eq('token', token)
      .single();

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Token de invitado no válido.' }, { status: 404 });
    }

    const totalSeats = typeof seats === 'number' ? seats : 1;
    const maxSeats = 1 + guest.max_companions;

    if (totalSeats < 0 || totalSeats > maxSeats) {
      return NextResponse.json(
        { error: `El número de asientos debe estar entre 0 y ${maxSeats}.` },
        { status: 400 }
      );
    }

    const rsvpPayload = {
      event_id: guest.event_id,
      guest_id: guest.id,
      name: name.trim(),
      seats: status === 'declined' ? 0 : totalSeats,
      companion_names: status === 'declined' ? [] : (companionNames ?? []),
      dietary: dietary ?? null,
      dietary_per_person: status === 'declined' ? {} : (dietaryPerPerson ?? {}),
      status,
    };

    const { data: existing } = await supabase
      .from('rsvps')
      .select('id')
      .eq('guest_id', guest.id)
      .maybeSingle();

    const { error } = existing
      ? await supabase.from('rsvps').update(rsvpPayload).eq('id', existing.id)
      : await supabase.from('rsvps').insert(rsvpPayload);

    if (error) {
      console.error('[RSVP] Error al guardar (con token):', error);
      return NextResponse.json({ error: 'No se pudo guardar la confirmación.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }
}
