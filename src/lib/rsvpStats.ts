export type PersonStatus = 'confirmed' | 'declined' | 'pending';

export interface GuestStatsInput {
  companion_names: string[]; // guests.companion_names (universo precargado, plan Deluxe)
  rsvp?: { status: PersonStatus; seats: number; companion_names: string[] } | null;
}

export interface InvitationStats {
  invitations: { total: number; answered: number; notAnswered: number };
  people: { confirmed: number; declined: number; pending: number };
}

// Deriva conteos a nivel persona (titular + acompañantes) a partir de la misma
// información ya usada para pintar las sub-filas expandibles por acompañante:
// guests.companion_names (invitados) vs rsvp.companion_names (confirmados).
export function computeInvitationStats(guests: GuestStatsInput[], isDeluxe: boolean): InvitationStats {
  let answered = 0;
  let notAnswered = 0;
  let peopleConfirmed = 0;
  let peopleDeclined = 0;
  let peoplePending = 0;

  const bump = (status: PersonStatus) => {
    if (status === 'confirmed') peopleConfirmed++;
    else if (status === 'declined') peopleDeclined++;
    else peoplePending++;
  };

  for (const g of guests) {
    const titularStatus: PersonStatus = g.rsvp?.status ?? 'pending';
    if (titularStatus === 'pending') notAnswered++;
    else answered++;
    bump(titularStatus);

    if (isDeluxe && g.companion_names.length > 0) {
      const confirmedSet = new Set(g.rsvp?.companion_names ?? []);
      for (const name of g.companion_names) {
        bump(
          !g.rsvp
            ? 'pending'
            : g.rsvp.status === 'declined'
              ? 'declined'
              : confirmedSet.has(name) ? 'confirmed' : 'declined',
        );
      }
    } else if (g.rsvp && g.rsvp.seats > 1) {
      // Planes sin identidad de acompañante (ej. Plus): el grupo se mueve junto.
      for (let i = 0; i < g.rsvp.seats - 1; i++) bump(titularStatus);
    }
  }

  return {
    invitations: { total: guests.length, answered, notAnswered },
    people: { confirmed: peopleConfirmed, declined: peopleDeclined, pending: peoplePending },
  };
}
