'use client';

import { useState, useTransition } from 'react';
import {
  addEventOrganizer,
  removeEventOrganizer,
  searchProfiles,
  type OrganizerProfile,
} from '@/app/superadmin/_actions';

const C = {
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  red: '#C0392B',
};

export interface OrganizerRow {
  profileId: string;
  fullName: string | null;
  email: string;
  role: 'owner' | 'collaborator'; // interno DB, no expuesto en UI
}

interface Props {
  eventId: string;
  initialOrganizers: OrganizerRow[];
}

const labelStyle: React.CSSProperties = {
  fontSize: '9px',
  color: C.muted,
  letterSpacing: '2px',
  marginBottom: '6px',
  display: 'block',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  background: 'transparent',
  border: `1px solid ${C.borderBright}`,
  borderRadius: '6px',
  color: C.text,
  fontSize: '12px',
  outline: 'none',
};

export default function OrganizersEditor({ eventId, initialOrganizers }: Props) {
  const [organizers, setOrganizers] = useState<OrganizerRow[]>(initialOrganizers);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OrganizerProfile[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSearch() {
    setError(null);
    startSearchTransition(async () => {
      try {
        const results = await searchProfiles(searchQuery);
        const existingIds = new Set(organizers.map(o => o.profileId));
        setSearchResults(results.filter(r => !existingIds.has(r.id)));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al buscar');
      }
    });
  }

  async function handleAdd(profile: OrganizerProfile) {
    setError(null);
    setAddingId(profile.id);
    try {
      await addEventOrganizer(eventId, profile.id);
      setOrganizers(prev => [
        ...prev,
        { profileId: profile.id, fullName: profile.full_name, email: profile.email, role: 'collaborator' },
      ]);
      setSearchResults(prev => prev.filter(r => r.id !== profile.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al agregar');
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemove(profileId: string) {
    setError(null);
    setRemovingId(profileId);
    try {
      await removeEventOrganizer(eventId, profileId);
      setOrganizers(prev => prev.filter(o => o.profileId !== profileId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al remover');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Lista actual */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        {organizers.length === 0 ? (
          <p style={{ padding: '16px', fontSize: '11px', color: C.muted }}>
            Sin organizadores
          </p>
        ) : (
          organizers.map((org, i) => (
            <div
              key={org.profileId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', color: C.text, marginBottom: '2px' }}>
                  {org.fullName || '—'}
                </p>
                <p style={{ fontSize: '10px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {org.email}
                </p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(org.profileId)}
                disabled={removingId === org.profileId}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: removingId === org.profileId ? 'not-allowed' : 'pointer',
                  border: `1px solid ${C.border}`,
                  background: 'transparent',
                  color: C.muted,
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = C.red; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = C.muted; }}
              >
                {removingId === org.profileId ? '…' : 'quitar'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Agregar organizador */}
      <div>
        <label style={labelStyle}>Agregar colaborador</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Nombre o email del organizador"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            style={{
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: !searchQuery.trim() || isSearching ? 'not-allowed' : 'pointer',
              border: `1px solid ${!searchQuery.trim() || isSearching ? C.border : C.accent}`,
              background: !searchQuery.trim() || isSearching ? 'transparent' : C.accentDim,
              color: !searchQuery.trim() || isSearching ? C.muted : C.accent,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {isSearching ? 'buscando…' : 'buscar'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '8px', border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            {searchResults.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: C.text, marginBottom: '2px' }}>
                    {r.full_name || '—'}
                  </p>
                  <p style={{ fontSize: '10px', color: C.muted }}>
                    {r.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(r)}
                  disabled={addingId === r.id}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: addingId === r.id ? 'not-allowed' : 'pointer',
                    border: `1px solid ${C.accent}`,
                    background: C.accentDim,
                    color: C.accent,
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {addingId === r.id ? '…' : '+ agregar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <p style={{ marginTop: '8px', fontSize: '10px', color: C.muted }}>
            Sin resultados para &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Error global */}
      {error && (
        <p style={{ fontSize: '11px', color: C.red }}>
          ✗ {error}
        </p>
      )}
    </div>
  );
}
