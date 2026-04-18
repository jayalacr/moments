export interface RsvpRow {
  id: string;
  guest_id: string | null;
  name: string;
  seats: number;
  companion_names: string[];
  dietary: string | null;
  dietary_per_person?: Record<string, string>;
  status: 'confirmed' | 'declined' | 'pending';
  created_at: string;
  guests: { name: string | null; token: string } | null;
}

export interface GuestWithRsvp {
  id: string;
  name: string;
  token: string;
  max_companions: number;
  companion_names: string[];
  rsvp: {
    id: string;
    status: 'confirmed' | 'declined' | 'pending';
    seats: number;
    companion_names: string[];
    dietary: string | null;
    dietary_per_person?: Record<string, string>;
    created_at: string;
  } | null;
}

export interface RsvpStats {
  confirmed: number;
  declined: number;
  pending: number;
  totalSeats: number;
}

export interface GuestRow {
  id: string;
  name: string | null;
  token: string;
  phone: string | null;
  max_companions: number;
  companion_names: string[];
  created_at: string;
  rsvp?: {
    status: 'confirmed' | 'declined' | 'pending';
    seats: number;
    companion_names: string[];
  } | null;
}
