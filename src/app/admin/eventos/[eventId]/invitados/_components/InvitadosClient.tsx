'use client';

import { useState, useTransition, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search,
  Plus,
  MessageCircle,
  Copy,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  FileText,
  AlertCircle
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import {
  createGuest,
  updateGuest,
  deleteGuest,
  saveWhatsappTemplate,
  saveMaxCapacity,
  updateGuestCompanions,
  bulkCreateGuests
} from '../_actions';
import type { GuestRow, RsvpRow, GuestWithRsvp, RsvpStats } from '@/app/admin/invitados/types';
import { getInvitationUrl } from '@/lib/invitation';

const C = {
  bg: '#F8F3EC',
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  white: '#FFFFFF',
  danger: '#c0392b',
  dangerLight: 'rgba(192,57,43,0.08)',
  success: '#5A7A5A',
  successLight: 'rgba(90,122,90,0.08)',
  warning: '#D4A017',
  warningLight: 'rgba(212,160,23,0.08)',
};

interface Props {
  initialGuests: GuestRow[];
  event: { id: string; slug: string; event_type: string; plan: string; subdomain?: string | null };
  initialWhatsappTemplate: string;
  initialRsvps: RsvpRow[];
  initialGuestsWithRsvp: GuestWithRsvp[];
  initialStats: RsvpStats;
  initialMaxCapacity: number | null;
}

interface FormState {
  name: string;
  phone: string;
  max_companions: number;
  companion_names: string[];
}

interface CsvRow {
  name: string;
  phone: string;
  max_companions: number;
  companion_names: string[];
  _errors: string[];
}

const EMPTY_FORM: FormState = { name: '', phone: '', max_companions: 0, companion_names: [] };


const DEFAULT_TEMPLATE = '¡Hola {nombre}! 👋 Te compartimos nuestra invitación digital. Nos encantaría que nos acompañaras. Por favor confirma tu asistencia aquí: {link}';

const responsiveStyles = `
  .admin-page-container {
    padding: 0;
  }
  @media (max-width: 768px) {
    .admin-page-container {
      gap: 20px !important;
    }
    .stats-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
    }
    .stats-card {
      padding: 16px !important;
    }
    .stats-value {
      font-size: 24px !important;
    }
    .toolbar-container {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .search-input-wrap {
      min-width: 100% !important;
    }
    .toolbar-actions {
      margin-left: 0 !important;
      justify-content: space-between;
      width: 100%;
    }
    .toolbar-actions button {
      flex: 1;
      padding: 10px 8px !important;
      font-size: 10px !important;
    }
    .guest-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 16px !important;
      padding: 16px !important;
    }
    .guest-actions {
      width: 100%;
      justify-content: flex-end;
      border-top: 1px solid #EDE5D8;
      padding-top: 12px;
    }
    .tabs-selector {
      gap: 12px !important;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
    }
    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .conf-table-header { display: none !important; }
    .conf-desktop-row { display: none !important; }
    .conf-mobile-card { display: block !important; }
  }
  @media (min-width: 769px) {
    .conf-mobile-card { display: none !important; }
  }
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .toolbar-actions {
      flex-direction: column;
    }
    .filter-tabs {
      overflow-x: auto;
      width: 100%;
      padding-bottom: 8px;
    }
  }
`;

export default function InvitadosClient({ 
  initialGuests, 
  event, 
  initialWhatsappTemplate,
  initialRsvps,
  initialGuestsWithRsvp,
  initialStats,
  initialMaxCapacity
}: Props) {
  const [activeTab, setActiveTab] = useState<'invitados' | 'confirmaciones'>('invitados');
  const [guests, setGuests] = useState<GuestRow[]>(initialGuests);
  const [rsvps, setRsvps] = useState<RsvpRow[]>(initialRsvps);
  const [guestsWithRsvp, setGuestsWithRsvp] = useState<GuestWithRsvp[]>(initialGuestsWithRsvp);
  const [statsData, setStatsData] = useState<RsvpStats>(initialStats);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(initialMaxCapacity);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [isPending, startTransition] = useTransition();
  const [waTemplate, setWaTemplate] = useState(
    initialWhatsappTemplate && !initialWhatsappTemplate.includes('�')
      ? initialWhatsappTemplate
      : DEFAULT_TEMPLATE
  );
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [isSavingTemplate, startSaveTransition] = useTransition();

  const isDeluxe = event.plan === 'deluxe';
  const [expandedGuests, setExpandedGuests] = useState<Set<string>>(new Set());

  function toggleExpanded(guestId: string) {
    setExpandedGuests(prev => {
      const next = new Set(prev);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });
  }

  // ── CSV Import State ──────────────────────────────────────────────────────
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvImporting, startCsvTransition] = useTransition();
  const [csvResult, setCsvResult] = useState<{ inserted?: number; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = isDeluxe
      ? ['Nombre', 'Telefono', 'Cupo', 'Acompañantes']
      : ['Nombre', 'Telefono', 'Cupo'];
    const example = isDeluxe
      ? ['Juan Pérez', '+525512345678', '2', '"María G., Pedro P."']
      : ['Juan Pérez', '+525512345678', '2'];
    const csvLine = (row: string[]) =>
      row.map(cell => (cell.startsWith('"') ? cell : /,/.test(cell) ? `"${cell}"` : cell)).join(',');
    const csv = [headers, example].map(csvLine).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_invitados_${event.plan}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvResult(null);

    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        // Skip header row (index 0); access columns by index to avoid encoding issues with special chars
        const dataRows = results.data.slice(1);
        const existingPhones = new Set(guests.map(g => g.phone?.replace(/\D/g, '')).filter(Boolean));
        const seenPhones = new Set<string>();
        const parsed: CsvRow[] = dataRows.map((row) => {
          const errors: string[] = [];
          const name = (row[0] ?? '').trim();
          const phone = (row[1] ?? '').trim();
          const cupoRaw = (row[2] ?? '').trim();
          const companions = isDeluxe ? (row[3] ?? '').trim() : '';

          if (!name) errors.push('Nombre requerido');
          const normalizedPhone = phone.replace(/\D/g, '');
          if (!phone) errors.push('Teléfono requerido');
          if (normalizedPhone && existingPhones.has(normalizedPhone)) errors.push('Teléfono ya registrado');
          if (normalizedPhone && seenPhones.has(normalizedPhone)) errors.push('Teléfono duplicado en el archivo');
          if (normalizedPhone) seenPhones.add(normalizedPhone);

          const max_companions = parseInt(cupoRaw) || 0;
          const companion_names = companions
            ? companions.split(',').map(s => s.trim()).filter(Boolean)
            : [];

          return { name, phone, max_companions, companion_names, _errors: errors };
        });
        setCsvRows(parsed);
      },
    });
  }

  function handleCsvImport() {
    const validRows = csvRows.filter(r => r._errors.length === 0);
    if (validRows.length === 0) return;
    startCsvTransition(async () => {
      const result = await bulkCreateGuests(event.id, validRows);
      setCsvResult(result);
      if (!result.error) {
        window.location.reload();
      }
    });
  }

  function closeCsvModal() {
    setShowCsvModal(false);
    setCsvRows([]);
    setCsvFileName(null);
    setCsvResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let totalConfirmedSeats = 0;

    guests.forEach(g => {
      if (g.rsvp?.status === 'confirmed') {
        confirmed++;
        totalConfirmedSeats += (g.rsvp.seats || 0);
      } else if (g.rsvp?.status === 'declined') {
        declined++;
      } else {
        pending++;
      }
    });

    return { confirmed, declined, pending, totalConfirmedSeats, totalGuests: guests.length };
  }, [guests]);

  // ── Search & Filter ──────────────────────────────────────────────────────
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (g.phone || '').includes(search);
      const matchFilter = 
        filter === 'all' ? true :
        filter === 'confirmed' ? g.rsvp?.status === 'confirmed' :
        filter === 'declined' ? g.rsvp?.status === 'declined' :
        filter === 'pending' ? !g.rsvp?.status : true;
      return matchSearch && matchFilter;
    });
  }, [guests, search, filter]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(guest: GuestRow) {
    setEditingId(guest.id);
    setForm({
      name: guest.name ?? '',
      phone: guest.phone ?? '',
      max_companions: guest.max_companions,
      companion_names: guest.companion_names ?? [],
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function setCompanionCount(n: number) {
    const count = Math.max(0, n);
    const current = form.companion_names;
    const updated =
      count > current.length
        ? [...current, ...Array(count - current.length).fill('')]
        : current.slice(0, count);
    setForm(f => ({ ...f, max_companions: count, companion_names: updated }));
  }

  function setCompanionName(index: number, value: string) {
    const updated = [...form.companion_names];
    updated[index] = value;
    setForm(f => ({ ...f, companion_names: updated }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setError('El nombre del titular es requerido.');
      return;
    }
    if (!form.phone.trim()) {
      setError('El número de teléfono es requerido.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const payload = {
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        max_companions: form.max_companions,
        companion_names: isDeluxe ? form.companion_names : [],
      };

      const result = editingId
        ? await updateGuest(event.id, editingId, payload)
        : await createGuest(event.id, payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      window.location.reload(); 
    });
  }

  function handleDelete(guestId: string) {
    if (!confirm('¿Eliminar este invitado? Se perderá su confirmación si ya respondió.')) return;
    startTransition(async () => {
      const result = await deleteGuest(event.id, guestId);
      if (result.error) {
        alert(result.error);
        return;
      }
      setGuests(g => g.filter(x => x.id !== guestId));
    });
  }

  async function copyUrl(token: string) {
    const url = getInvitationUrl(event, token);
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function openWhatsApp(guest: GuestRow) {
    const url = getInvitationUrl(event, guest.token);
    const message = waTemplate
      .replace(/\{nombre\}/gi, guest.name || 'Invitado')
      .replace(/\{link\}/gi, url);
    const encoded = encodeURIComponent(message);
    if (guest.phone) {
      const digits = guest.phone.replace(/[^\d+]/g, '');
      window.open(`https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  }

  function handleSaveTemplate() {
    startSaveTransition(async () => {
      await saveWhatsappTemplate(event.id, waTemplate);
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 2500);
    });
  }

  function handleSaveMaxCap(newCap: number | null) {
    startTransition(async () => {
      const res = await saveMaxCapacity(event.id, newCap);
      if (!res.error) setMaxCapacity(newCap);
    });
  }

  function exportRsvps() {
    if (rsvps.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const data = rsvps.map(r => ({
      'Nombre': r.name,
      'Estatus': r.status === 'confirmed' ? 'Confirmado' : 'No asistirá',
      'Asientos': r.seats,
      'Acompañantes': r.companion_names?.join(', ') || '',
      'Notas Dieta': r.dietary || '',
      'Fecha': new Date(r.created_at).toLocaleString()
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `confirmaciones_${event.slug}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const statusMetaConf = {
    confirmed: { label: 'Confirmó',  color: C.success, bg: C.successLight },
    declined:  { label: 'Declinó',   color: C.danger,  bg: C.dangerLight },
    pending:   { label: 'Pendiente', color: C.warning,  bg: C.warningLight },
  } as const;

  return (
    <div className="admin-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <style>{responsiveStyles}</style>
      
      {/* ── Selector de Pestañas ── */}
      <div className="tabs-selector" style={{ display: 'flex', gap: '24px', borderBottom: `1px solid ${C.border}`, paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('invitados')}
          style={{
            padding: '12px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'invitados' ? 600 : 400,
            color: activeTab === 'invitados' ? C.text : C.muted,
            border: 'none',
            background: 'none',
            borderBottom: `2px solid ${activeTab === 'invitados' ? C.accent : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} />
          Lista de Invitados
        </button>
        <button
          onClick={() => setActiveTab('confirmaciones')}
          style={{
            padding: '12px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'confirmaciones' ? 600 : 400,
            color: activeTab === 'confirmaciones' ? C.text : C.muted,
            border: 'none',
            background: 'none',
            borderBottom: `2px solid ${activeTab === 'confirmaciones' ? C.accent : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Check size={16} />
          Confirmaciones & Cupo
        </button>
      </div>

      {activeTab === 'invitados' ? (
        <>
          {/* ── Dashboard de Estadísticas ── */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={cardStats}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={labelStats}>Total Familias</p>
              <p style={valueStats}>{stats.totalGuests}</p>
            </div>
            <Users size={20} color={C.mutedLight} strokeWidth={1.5} />
          </div>
        </div>
        <div style={cardStats}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={labelStats}>Confirmados</p>
              <p style={{ ...valueStats, color: C.success }}>{stats.confirmed}</p>
              <p style={{ fontSize: '11px', color: C.mutedLight }}>({stats.totalConfirmedSeats} personas)</p>
            </div>
            <Check size={20} color={C.success} strokeWidth={1.5} />
          </div>
        </div>
        <div style={cardStats}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={labelStats}>Pendientes</p>
              <p style={{ ...valueStats, color: C.warning }}>{stats.pending}</p>
            </div>
            <Search size={20} color={C.warning} strokeWidth={1.5} />
          </div>
        </div>
        <div style={cardStats}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={labelStats}>No asistirán</p>
              <p style={{ ...valueStats, color: C.danger }}>{stats.declined}</p>
            </div>
            <X size={20} color={C.danger} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── Barra de Herramientas ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="toolbar-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
            <input
              style={{ ...inputStyle, paddingLeft: '40px' }}
              placeholder="Buscar por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={16} color={C.muted} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} strokeWidth={1.5} />
          </div>
          <div className="filter-tabs" style={{ display: 'flex', gap: '4px', background: C.border, padding: '2px', borderRadius: '10px' }}>
            {(['all', 'confirmed', 'pending', 'declined'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '8px 16px', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  backgroundColor: filter === tab ? C.white : 'transparent',
                  color: filter === tab ? C.text : C.muted,
                  fontWeight: filter === tab ? 600 : 400,
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'all' ? 'Todos' : tab === 'pending' ? 'Pendientes' : tab === 'confirmed' ? 'Confirmados' : 'No asistirán'}
              </button>
            ))}
          </div>
          <div className="toolbar-actions" style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button onClick={exportRsvps} style={btnSecondary}>
              <Download size={14} style={{ marginRight: '8px' }} />
              Exportar
            </button>
            <button onClick={() => setShowCsvModal(true)} style={btnSecondary}>
              <Upload size={14} style={{ marginRight: '8px' }} />
              Importar CSV
            </button>
            <button onClick={openCreate} style={btnPrimary}>
              <Plus size={14} style={{ marginRight: '8px' }} />
              Agregar invitado
            </button>
          </div>
        </div>
      </div>

      {/* ── Editor de Mensaje WhatsApp ── */}
      <div style={{
        border: `1px solid ${C.border}`,
        borderRadius: '16px',
        backgroundColor: C.white,
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowTemplateEditor(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle size={16} color={C.accent} />
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: C.text }}>
              Mensaje de WhatsApp
            </span>
            <span style={{ fontSize: '11px', color: C.mutedLight }}>
              — personaliza el texto que recibirán tus invitados
            </span>
          </div>
          {showTemplateEditor ? <ChevronUp size={16} color={C.muted} /> : <ChevronDown size={16} color={C.muted} />}
        </button>

        {showTemplateEditor && (
          <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '12px', color: C.muted, marginBottom: '12px', lineHeight: 1.7 }}>
              Usa{' '}
              <code style={{ background: C.accentLight, padding: '2px 6px', borderRadius: '4px', color: C.accent, fontFamily: 'monospace' }}>{'{nombre}'}</code>
              {' '}y{' '}
              <code style={{ background: C.accentLight, padding: '2px 6px', borderRadius: '4px', color: C.accent, fontFamily: 'monospace' }}>{'{link}'}</code>
              {' '}como variables. Se sustituirán automáticamente al enviar a cada invitado.
            </p>
            <textarea
              value={waTemplate}
              onChange={e => setWaTemplate(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.7,
                fontSize: '13px',
                marginBottom: '16px',
              }}
              placeholder="Ej. ¡Hola {nombre}! Te invitamos a nuestra boda. Confirma aquí: {link}"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate}
                style={btnPrimary}
              >
                {isSavingTemplate ? <Spinner size={14} light /> : <Save size={14} style={{ marginRight: '8px' }} />}
                {isSavingTemplate ? 'Guardando…' : 'Guardar mensaje'}
              </button>
              {templateSaved && (
                <span style={{ fontSize: '12px', color: C.success, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Guardado
                </span>
              )}
              <button
                onClick={() => setWaTemplate(DEFAULT_TEMPLATE)}
                style={{ ...btnSecondary, fontSize: '11px', padding: '8px 14px', marginLeft: 'auto' }}
              >
                Restaurar predefinido
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Importación CSV ── */}
      {showCsvModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, maxWidth: '860px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color={C.accent} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  Importar invitados desde CSV
                </p>
              </div>
              <button onClick={closeCsvModal} style={btnIcon}><X size={20} /></button>
            </div>

            {/* Paso 1: Descargar plantilla */}
            <div style={{ backgroundColor: C.bg, borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <p style={{ ...labelStyle, margin: '0 0 4px 0' }}>Paso 1 — Descarga la plantilla</p>
                <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>
                  {isDeluxe
                    ? 'Plantilla Deluxe: incluye columna de nombres de acompañantes.'
                    : 'Plantilla Plus/Essential: Nombre, Teléfono y Cupo.'}
                </p>
              </div>
              <button onClick={downloadTemplate} style={{ ...btnSecondary, whiteSpace: 'nowrap' }}>
                <Download size={14} style={{ marginRight: '8px' }} />
                Descargar plantilla
              </button>
            </div>

            {/* Paso 2: Subir archivo */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Paso 2 — Carga tu archivo CSV</p>
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', padding: '32px', border: `2px dashed ${C.border}`, borderRadius: '12px',
                  cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.5)', transition: 'border-color 0.2s',
                }}
              >
                <Upload size={24} color={C.muted} strokeWidth={1.5} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: C.text, margin: '0 0 4px 0', fontWeight: 500 }}>
                    {csvFileName ?? 'Haz clic para seleccionar tu archivo'}
                  </p>
                  <p style={{ fontSize: '12px', color: C.mutedLight, margin: 0 }}>Solo archivos .csv</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Vista previa */}
            {csvRows.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={labelStyle}>
                    Vista previa — {csvRows.filter(r => r._errors.length === 0).length} de {csvRows.length} filas válidas
                  </p>
                  {csvRows.some(r => r._errors.length > 0) && (
                    <span style={{ fontSize: '12px', color: C.danger, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      {csvRows.filter(r => r._errors.length > 0).length} filas con errores (serán omitidas)
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: C.bg }}>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Teléfono</th>
                        <th style={thStyle}>Cupo</th>
                        {isDeluxe && <th style={thStyle}>Acompañantes</th>}
                        <th style={thStyle}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.map((row, i) => (
                        <tr key={i} style={{ backgroundColor: row._errors.length > 0 ? C.dangerLight : 'transparent', borderBottom: `1px solid ${C.border}` }}>
                          <td style={tdStyle}>{row.name || <em style={{ color: C.mutedLight }}>vacío</em>}</td>
                          <td style={tdStyle}>{row.phone || <em style={{ color: C.mutedLight }}>vacío</em>}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{row.max_companions}</td>
                          {isDeluxe && <td style={tdStyle}>{row.companion_names.join(', ') || '—'}</td>}
                          <td style={tdStyle}>
                            {row._errors.length === 0
                              ? <span style={{ color: C.success, fontWeight: 600 }}>✓ OK</span>
                              : <span style={{ color: C.danger, fontSize: '11px' }}>{row._errors.join(' · ')}</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {csvResult?.error && (
              <p style={{ fontSize: '13px', color: C.danger, backgroundColor: C.dangerLight, padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                {csvResult.error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: `1px solid ${C.border}` }}>
              <button onClick={closeCsvModal} style={btnSecondary}>Cancelar</button>
              <button
                onClick={handleCsvImport}
                disabled={csvImporting || csvRows.filter(r => r._errors.length === 0).length === 0}
                style={{
                  ...btnPrimary,
                  opacity: csvRows.filter(r => r._errors.length === 0).length === 0 ? 0.5 : 1,
                }}
              >
                {csvImporting ? <Spinner size={14} light /> : <Upload size={14} style={{ marginRight: '8px' }} />}
                {csvImporting ? 'Importando…' : `Importar ${csvRows.filter(r => r._errors.length === 0).length} invitados`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Formulario ── */}
      {showForm && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                {editingId ? 'Editar invitado' : 'Nuevo invitado'}
              </p>
              <button onClick={closeForm} style={btnIcon}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Nombre del titular</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. María García"
                />
              </div>

              <div>
                <label style={labelStyle}>Teléfono / WhatsApp</label>
                <input
                  style={inputStyle}
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej. +52 55 1234 5678"
                />
                <p style={{ fontSize: '11px', color: C.mutedLight, marginTop: '6px' }}>
                  Sirve como identificador único de este invitado.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Máximo de acompañantes</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={0} max={20}
                  value={form.max_companions}
                  onChange={e => setCompanionCount(parseInt(e.target.value) || 0)}
                />
                <p style={{ fontSize: '11px', color: C.mutedLight, marginTop: '6px' }}>
                  Define el cupo total permitido para este invitado.
                </p>
              </div>
            </div>

            {isDeluxe && form.max_companions > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Nombres de acompañantes</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginTop: '12px' }}>
                  {form.companion_names.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#C9A87C', minWidth: '20px' }}>{String(i + 1).padStart(2, '0')}</span>
                      <input
                        style={{ ...inputStyle, margin: 0, padding: '10px 14px' }}
                        value={name}
                        onChange={e => setCompanionName(i, e.target.value)}
                        placeholder={`Acompañante ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ fontSize: '12px', color: C.danger, marginBottom: '16px', backgroundColor: C.dangerLight, padding: '10px', borderRadius: '8px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '20px', borderTop: `1px solid ${C.border}` }}>
              <button onClick={closeForm} style={btnSecondary}>Cancelar</button>
              <button onClick={handleSubmit} disabled={isPending} style={btnPrimary}>
                {isPending ? <Spinner size={14} light /> : null}
                {isPending ? ' Guardando…' : editingId ? 'Guardar cambios' : 'Crear invitado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista de invitados ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredGuests.length === 0 ? (
          <div style={{ padding: '80px 40px', border: `1px dashed ${C.border}`, borderRadius: '20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: C.border, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={24} color={C.muted} />
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '26px', fontStyle: 'italic', color: C.muted, marginBottom: '8px' }}>
              {search ? 'Sin coincidencias' : 'Aún no hay invitados'}
            </p>
            <p style={{ fontSize: '14px', color: C.mutedLight }}>
              {search ? 'Intenta con otro término de búsqueda' : 'Comienza agregando invitados para generar sus links personalizados.'}
            </p>
          </div>
        ) : (
          filteredGuests.map(guest => {
            const status = guest.rsvp?.status || 'pending';
            const statusColor = status === 'confirmed' ? C.success : status === 'declined' ? C.danger : C.warning;
            const statusBg = status === 'confirmed' ? C.successLight : status === 'declined' ? C.dangerLight : C.warningLight;
            const statusText = status === 'confirmed' ? 'Confirmado' : status === 'declined' ? 'No asistirá' : 'Pendiente';

            return (
              <div
                key={guest.id}
                className="guest-row"
                style={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: '16px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Status Badge */}
                <div style={{ 
                  width: '100px', padding: '8px 0', borderRadius: '10px', textAlign: 'center',
                  backgroundColor: statusBg, color: statusColor, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px'
                }}>
                  {statusText}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '16px', color: C.text, fontWeight: 500, margin: 0, letterSpacing: '0.01em' }}>
                    {guest.name || <span style={{ color: C.mutedLight, fontStyle: 'italic' }}>Sin nombre asignado</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    {guest.phone && (
                      <span style={{ fontSize: '12px', color: C.muted, fontFamily: 'monospace' }}>
                        {guest.phone}
                      </span>
                    )}
                    {guest.phone && <span style={{ color: C.border }}>•</span>}
                    <span style={{ fontSize: '12px', color: C.muted }}>
                      {guest.max_companions === 0
                        ? 'Acceso personal'
                        : `${1 + guest.max_companions} personas (Titular + ${guest.max_companions})`}
                    </span>
                    {guest.rsvp?.status === 'confirmed' && (
                      <>
                        <span style={{ color: C.border }}>•</span>
                        <span style={{ fontSize: '12px', color: C.success, fontWeight: 500 }}>
                          Confirmó {guest.rsvp.seats} {guest.rsvp.seats === 1 ? 'persona' : 'personas'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="guest-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    onClick={() => openWhatsApp(guest)}
                    title={guest.phone ? `WhatsApp: ${guest.phone}` : 'Enviar por WhatsApp (sin número registrado)'}
                    style={{
                      ...btnIconAction,
                      color: '#25D366',
                      backgroundColor: 'rgba(37, 211, 102, 0.08)',
                      opacity: guest.phone ? 1 : 0.5,
                    }}
                  >
                    <MessageCircle size={18} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => copyUrl(guest.token)}
                    title="Copiar Link"
                    style={{
                      ...btnSecondary,
                      padding: '8px 16px',
                      color: copiedToken === guest.token ? C.success : C.text,
                      borderColor: copiedToken === guest.token ? C.success : C.border,
                      backgroundColor: copiedToken === guest.token ? C.successLight : 'transparent',
                    }}
                  >
                    {copiedToken === guest.token ? <Check size={16} /> : <Copy size={16} />}
                    <span style={{ marginLeft: '8px', fontSize: '11px' }}>{copiedToken === guest.token ? 'Copiado' : 'Link'}</span>
                  </button>
                  <button
                    onClick={() => openEdit(guest)}
                    title="Editar"
                    style={{ ...btnIconAction, color: C.muted, border: `1px solid ${C.border}` }}
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id)}
                    title="Eliminar"
                    style={{ ...btnIconAction, color: C.danger, backgroundColor: C.dangerLight }}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ── Widget de Cupo y Capacidad ── */}
      <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={labelStats}>Cupo del Evento</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <p style={{ ...valueStats, fontSize: '48px', color: (maxCapacity && statsData.totalSeats > maxCapacity) ? C.danger : C.text }}>
                {statsData.totalSeats}
              </p>
              {maxCapacity && <span style={{ fontSize: '24px', color: C.mutedLight, fontFamily: 'var(--font-cormorant)' }}>/ {maxCapacity}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={labelStats}>Límite Máximo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                style={{ ...inputStyle, width: '100px', padding: '8px 12px', textAlign: 'center' }}
                defaultValue={maxCapacity ?? ''}
                onBlur={(e) => handleSaveMaxCap(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Sin límite"
              />
            </div>
          </div>
        </div>
        
        {maxCapacity && (
          <div style={{ width: '100%', height: '8px', backgroundColor: C.bg, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.min((statsData.totalSeats / maxCapacity) * 100, 100)}%`, 
              backgroundColor: (statsData.totalSeats / maxCapacity) > 0.9 ? C.danger : C.accent,
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        )}
      </div>

      {/* ── Tabla de Familias / Confirmaciones ── */}
      <div className="table-container" style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
        {/* Header — solo desktop */}
        <div className="conf-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '35% 15% 9% 26% 15%',
          padding: '16px 24px', backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`
        }}>
          {['Titular', 'Estado', 'Acomp.', 'Dieta', 'Fecha'].map(h => (
            <span key={h} style={{ ...labelStats, whiteSpace: 'nowrap' }}>{h}</span>
          ))}
        </div>

        {guestsWithRsvp.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.mutedLight }}>
            Aún no hay invitados registrados.
          </div>
        ) : (
          guestsWithRsvp.map((guest, gi) => {
            const rsvp = guest.rsvp;
            const titularStatus = rsvp?.status ?? 'pending';
            const confirmedSet = new Set<string>(rsvp?.companion_names ?? []);
            const allCompanions = isDeluxe
              ? (guest.companion_names ?? [])
              : (rsvp?.companion_names ?? []);
            const titularMeta = statusMetaConf[titularStatus];
            const dMap = rsvp?.dietary_per_person ?? {};
            const hasDetailedDietary = Object.keys(dMap).length > 0;
            const isLastGuest = gi === guestsWithRsvp.length - 1;

            const companionRows = allCompanions.map(name => ({
              name,
              status: !rsvp
                ? 'pending' as const
                : rsvp.status === 'declined'
                  ? 'declined' as const
                  : isDeluxe
                    ? (confirmedSet.has(name) ? 'confirmed' as const : 'declined' as const)
                    : 'confirmed' as const,
            }));

            const COLS = '35% 15% 9% 26% 15%';
            const hasCompanions = companionRows.length > 0;

            return (
              <div key={guest.id}>
                {/* ─ Desktop: fila titular ─ */}
                <div
                  className="conf-desktop-row"
                  onClick={hasCompanions ? () => toggleExpanded(guest.id) : undefined}
                  style={{
                    display: 'grid', gridTemplateColumns: COLS,
                    padding: '18px 24px',
                    borderBottom: (!isLastGuest || (hasCompanions && !expandedGuests.has(guest.id))) ? `1px solid ${C.border}` : undefined,
                    alignItems: 'start',
                    cursor: hasCompanions ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasCompanions && (
                      expandedGuests.has(guest.id)
                        ? <ChevronUp size={14} color={C.accent} />
                        : <ChevronDown size={14} color={C.accent} />
                    )}
                    <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{guest.name}</p>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignSelf: 'flex-start', width: 'fit-content',
                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                    backgroundColor: titularMeta.bg, color: titularMeta.color, textTransform: 'uppercase',
                  }}>
                    {titularMeta.label}
                  </span>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {isDeluxe && hasCompanions
                      ? `${(rsvp?.status === 'confirmed' ? 1 : 0) + confirmedSet.size}/${1 + allCompanions.length}`
                      : (rsvp?.seats ?? 'N/A')}
                  </p>
                  <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    {hasDetailedDietary ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferencias:</p>
                        {Object.entries(dMap).map(([person, pref]) =>
                          pref && pref.length > 0 && (
                            <div key={person} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.accentLight}`, paddingBottom: '2px' }}>
                              <span style={{ color: C.muted }}>{person}:</span>
                              <span style={{ fontWeight: 500 }}>{pref.join(', ')}</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : rsvp?.dietary ? (
                      <p style={{ margin: 0, color: C.accent }}>{rsvp.dietary}</p>
                    ) : (
                      <span style={{ color: C.mutedLight }}>N/A</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: C.mutedLight }}>
                    {rsvp ? new Date(rsvp.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {/* ─ Desktop: filas acompañantes (Deluxe) ─ */}
                {expandedGuests.has(guest.id) && companionRows.map((comp, ci) => {
                  const cm = statusMetaConf[comp.status];
                  const isLastRow = ci === companionRows.length - 1;
                  const compDietary = rsvp?.dietary_per_person?.[comp.name] ?? [];
                  return (
                    <div key={`${guest.id}-sub-${ci}`} className="conf-desktop-row" style={{
                      display: 'grid', gridTemplateColumns: COLS,
                      padding: '10px 24px',
                      backgroundColor: 'rgba(201,168,124,0.025)',
                      borderBottom: (!isLastGuest || !isLastRow) ? `1px solid ${C.border}` : undefined,
                      alignItems: 'center',
                    }}>
                      <div style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: C.mutedLight, fontSize: '12px', fontFamily: 'monospace' }}>└─</span>
                        <p style={{ margin: 0, fontSize: '13px', color: C.muted }}>{comp.name}</p>
                      </div>
                      <span style={{
                        display: 'inline-flex', width: 'fit-content',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                        backgroundColor: cm.bg, color: cm.color, textTransform: 'uppercase',
                      }}>
                        {cm.label}
                      </span>
                      <span />
                      <div style={{ fontSize: '12px' }}>
                        {compDietary.length > 0
                          ? <span style={{ color: C.accent }}>{compDietary.join(', ')}</span>
                          : <span style={{ color: C.mutedLight }}>N/A</span>}
                      </div>
                      <span />
                    </div>
                  );
                })}

                {/* ─ Mobile: card por familia ─ */}
                <div className="conf-mobile-card" style={{
                  display: 'none',
                  padding: '16px',
                  borderBottom: !isLastGuest ? `1px solid ${C.border}` : undefined,
                }}>
                  {/* Header de la card — clickeable si tiene acompañantes */}
                  <div
                    onClick={hasCompanions ? () => toggleExpanded(guest.id) : undefined}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: hasCompanions ? 'pointer' : 'default' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {hasCompanions && (
                          expandedGuests.has(guest.id)
                            ? <ChevronUp size={13} color={C.accent} />
                            : <ChevronDown size={13} color={C.accent} />
                        )}
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>{guest.name}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: C.mutedLight }}>
                        {isDeluxe && hasCompanions
                          ? `${(rsvp?.status === 'confirmed' ? 1 : 0) + confirmedSet.size}/${1 + allCompanions.length} total`
                          : rsvp?.seats ? `${rsvp.seats} ${rsvp.seats === 1 ? 'persona' : 'personas'}` : 'Sin confirmar'}
                        {rsvp ? ` · ${new Date(rsvp.created_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: titularMeta.bg, color: titularMeta.color, textTransform: 'uppercase',
                      whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0,
                    }}>
                      {titularMeta.label}
                    </span>
                  </div>

                  {/* Acompañantes — solo cuando expandido */}
                  {hasCompanions && expandedGuests.has(guest.id) && (
                    <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: `2px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {companionRows.map((comp, ci) => {
                        const cm = statusMetaConf[comp.status];
                        const compDietary = rsvp?.dietary_per_person?.[comp.name] ?? [];
                        return (
                          <div key={`mob-${guest.id}-${ci}`} style={{ paddingBottom: ci < companionRows.length - 1 ? '8px' : 0, borderBottom: ci < companionRows.length - 1 ? `1px solid ${C.border}` : undefined }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <p style={{ margin: 0, fontSize: '13px', color: C.muted }}>{comp.name}</p>
                              <span style={{
                                padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                                backgroundColor: cm.bg, color: cm.color, textTransform: 'uppercase',
                              }}>
                                {cm.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {compDietary.length > 0
                                ? compDietary.map((d, di) => (
                                    <span key={di} style={{
                                      fontSize: '10px', padding: '2px 8px',
                                      backgroundColor: C.accentLight, color: C.accent,
                                      borderRadius: '20px', fontWeight: 500,
                                    }}>{d}</span>
                                  ))
                                : <span style={{ fontSize: '10px', color: C.mutedLight, fontStyle: 'italic' }}>sin restricción</span>
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dieta general (no per-person) */}
                  {!hasDetailedDietary && rsvp?.dietary && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: C.bg, borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: 600, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dieta</p>
                      <p style={{ margin: 0, fontSize: '12px' }}>{rsvp.dietary}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

      <style jsx>{`
        .guest-row-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          border-color: ${C.accent} !important;
        }
      `}</style>
    </div>
  );
}

// ── Estilos Pro Max ────────────────────────────────────────────────────────

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(28, 22, 17, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px',
};

const modalContent: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '32px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

const cardStats: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: `1px solid #EDE5D8`,
  borderRadius: '20px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const labelStats: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#9C8E82',
  margin: '0 0 8px 0',
};

const valueStats: React.CSSProperties = {
  fontSize: '32px',
  fontFamily: 'var(--font-cormorant)',
  fontWeight: 400,
  color: '#1C1611',
  margin: 0,
  lineHeight: 1,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  background: '#1C1611',
  color: '#F8F3EC',
  borderRadius: '10px',
  fontSize: '12px',
  fontFamily: 'var(--font-jost)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  fontWeight: 500,
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 20px',
  background: 'transparent',
  color: '#1C1611',
  border: '1px solid #EDE5D8',
  borderRadius: '10px',
  fontSize: '12px',
  fontFamily: 'var(--font-jost)',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};

const btnIcon: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: '#9C8E82',
  transition: 'background 0.2s, color 0.2s',
};

const btnIconAction: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#9C8E82',
  marginBottom: '10px',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #EDE5D8',
  borderRadius: '10px',
  fontSize: '15px',
  color: '#1C1611',
  backgroundColor: '#FFFFFF',
  fontFamily: 'var(--font-jost)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '10px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#9C8E82',
  fontWeight: 600,
  borderBottom: '1px solid #EDE5D8',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '13px',
  color: '#1C1611',
  verticalAlign: 'middle',
};
