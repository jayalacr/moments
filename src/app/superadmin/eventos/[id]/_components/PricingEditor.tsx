'use client';

import { useMemo, useState, useTransition } from 'react';
import { updateEventPricing, updatePaymentStatus } from '@/app/superadmin/_actions';
import {
  EXTENSION_LABEL,
  DESIGN_LABEL,
  calcularTotal,
  formatMXN,
  isSubdomainAvailable,
  type Plan,
  type ExtensionKey,
  type DesignType,
} from '@/lib/pricing';

const C = {
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedMid: '#7A6F63',
  green: '#5A7A5A',
  greenDim: 'rgba(90,122,90,0.12)',
  amber: '#8B6914',
  amberDim: 'rgba(139,105,20,0.12)',
  red: '#C0392B',
  redDim: 'rgba(192,57,41,0.12)',
};

type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'expired';

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending',  label: 'Pendiente' },
  { value: 'partial',  label: 'Parcial' },
  { value: 'paid',     label: 'Pagado' },
  { value: 'refunded', label: 'Reembolsado' },
  { value: 'expired',  label: 'Expirado' },
];

const PAYMENT_COLOR: Record<PaymentStatus, string> = {
  pending:  C.red,
  partial:  C.amber,
  paid:     C.green,
  refunded: C.mutedMid,
  expired:  C.muted,
};

const EXTENSIONS: ExtensionKey[] = ['none', '1m', '3m'];
const DESIGNS: DesignType[] = ['template', 'custom'];

interface Props {
  eventId: string;
  plan: Plan;
  initial: {
    designType: DesignType;
    extensionKey: ExtensionKey;
    customDesignFeeMxn: number;
    paymentStatus: PaymentStatus;
    paymentNotes: string | null;
  };
}

export default function PricingEditor({ eventId, plan, initial }: Props) {
  const [designType, setDesignType] = useState<DesignType>(initial.designType);
  const [extensionKey, setExtensionKey] = useState<ExtensionKey>(initial.extensionKey);
  const [customDesignFeeMxn, setCustomDesignFeeMxn] = useState<number>(initial.customDesignFeeMxn);
  const [snapshot, setSnapshot] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initial.paymentStatus);
  const [paymentNotes, setPaymentNotes] = useState<string>(initial.paymentNotes ?? '');
  const [paymentSnapshot, setPaymentSnapshot] = useState({ paymentStatus: initial.paymentStatus, paymentNotes: initial.paymentNotes ?? '' });
  const [isPaymentPending, startPaymentTransition] = useTransition();
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isPaymentDirty =
    paymentStatus !== paymentSnapshot.paymentStatus ||
    paymentNotes !== paymentSnapshot.paymentNotes;

  const breakdown = useMemo(
    () => calcularTotal({ plan, designType, extensionKey, customDesignFeeMxn }),
    [plan, designType, extensionKey, customDesignFeeMxn],
  );

  const isDirty =
    designType !== snapshot.designType ||
    extensionKey !== snapshot.extensionKey ||
    customDesignFeeMxn !== snapshot.customDesignFeeMxn

  function handleSave() {
    setError(null);
    setSaved(false);
    const appliedFee = designType === 'custom' ? customDesignFeeMxn : 0;
    startTransition(async () => {
      try {
        await updateEventPricing(eventId, {
          designType,
          extensionKey,
          customDesignFeeMxn: appliedFee
        });
        setSnapshot({
          designType,
          extensionKey,
          customDesignFeeMxn: appliedFee,
          paymentStatus: paymentSnapshot.paymentStatus,
          paymentNotes: paymentSnapshot.paymentNotes,
        });
        setCustomDesignFeeMxn(appliedFee);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar');
      }
    });
  }

  function handlePaymentSave() {
    setPaymentError(null);
    setPaymentSaved(false);
    startPaymentTransition(async () => {
      try {
        await updatePaymentStatus(eventId, paymentStatus, paymentNotes || null);
        setPaymentSnapshot({ paymentStatus, paymentNotes });
        setPaymentSaved(true);
      } catch (e) {
        setPaymentError(e instanceof Error ? e.message : 'Error al guardar');
      }
    });
  }

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

  const labelStyle: React.CSSProperties = {
    fontSize: '9px',
    color: C.muted,
    letterSpacing: '2px',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Diseño</label>
          <select
            value={designType}
            onChange={(e) => setDesignType(e.target.value as DesignType)}
            style={inputStyle}
          >
            {DESIGNS.map((d) => (
              <option key={d} value={d} style={{ background: '#FFFFFF' }}>
                {DESIGN_LABEL[d]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Extensión</label>
          <select
            value={extensionKey}
            onChange={(e) => setExtensionKey(e.target.value as ExtensionKey)}
            style={inputStyle}
          >
            {EXTENSIONS.map((k) => (
              <option key={k} value={k} style={{ background: '#FFFFFF' }}>
                {EXTENSION_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        {designType === 'custom' && (
          <div>
            <label style={labelStyle}>Costo diseño (MXN)</label>
            <input
              type="number"
              min={0}
              step={50}
              value={customDesignFeeMxn}
              onChange={(e) => setCustomDesignFeeMxn(Math.max(0, parseInt(e.target.value || '0', 10)))}
              style={inputStyle}
              placeholder="0 = aún por cotizar"
            />
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div style={{
        border: `1px solid ${C.border}`,
        borderRadius: '8px',
        padding: '16px',
        background: 'rgba(201,168,124,0.05)',
      }}>
        {breakdown.lineItems.map((li, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '8px 0',
              borderTop: idx === 0 ? 'none' : `1px solid ${C.border}`,
              gap: '12px',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: C.text }}>
                {li.label}
              </p>
              {li.detail && (
                <p style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>
                  {li.detail}
                </p>
              )}
            </div>
            <span style={{
              fontSize: '12px',
              color: li.isEstimate ? C.amber : C.accent,
              whiteSpace: 'nowrap',
              fontStyle: li.isEstimate ? 'italic' : 'normal',
            }}>
              {li.isEstimate ? 'Por cotizar' : formatMXN(li.amount)}
            </span>
          </div>
        ))}

        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${C.borderBright}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span style={{
            fontSize: '10px',
            color: C.muted,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            {breakdown.hasCustomDesignEstimate ? 'Total (desde)' : 'Total'}
          </span>
          <span style={{
            fontSize: '18px',
            color: C.green,
            fontWeight: 500,
          }}>
            {formatMXN(breakdown.total)}
          </span>
        </div>

        {breakdown.hasCustomDesignEstimate && (
          <p style={{
            marginTop: '8px',
            fontSize: '10px',
            color: C.amber,
            lineHeight: 1.5,
          }}>
            ⚠ Falta capturar el costo del diseño personalizado.
          </p>
        )}
      </div>

      {/* Save pricing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isPending}
          style={{
            padding: '9px 18px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: !isDirty || isPending ? 'not-allowed' : 'pointer',
            border: `1px solid ${!isDirty || isPending ? C.border : C.accent}`,
            background: !isDirty || isPending ? 'transparent' : C.accentDim,
            color: !isDirty || isPending ? C.muted : C.accent,
            transition: 'all 0.15s',
          }}
        >
          {isPending ? 'guardando…' : 'guardar cambios'}
        </button>
        {saved && !isDirty && (
          <span style={{ fontSize: '11px', color: C.green }}>
            ✓ guardado
          </span>
        )}
        {error && (
          <span style={{ fontSize: '11px', color: C.red }}>
            ✗ {error}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: C.border }} />

      {/* Payment status */}
      <div>
        <p style={{ ...labelStyle, marginBottom: '12px' }}>ESTATUS DE PAGO</p>

        {/* Current badge */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '4px',
            background: paymentStatus === 'paid'
              ? C.greenDim
              : paymentStatus === 'partial'
                ? C.amberDim
                : paymentStatus === 'pending'
                  ? C.redDim
                  : 'rgba(0,0,0,0.03)',
          }}>
            <span style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: PAYMENT_COLOR[paymentStatus],
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '10px',
              color: PAYMENT_COLOR[paymentStatus],
              letterSpacing: '0.05em',
            }}>
              {PAYMENT_OPTIONS.find(o => o.value === paymentStatus)?.label ?? paymentStatus}
            </span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Cambiar estatus</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              style={inputStyle}
            >
              {PAYMENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#FFFFFF' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Notas del pago (opcional)</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              style={inputStyle}
              placeholder="ej. Transferencia parcial 500 MXN"
              maxLength={255}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handlePaymentSave}
            disabled={!isPaymentDirty || isPaymentPending}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: !isPaymentDirty || isPaymentPending ? 'not-allowed' : 'pointer',
              border: `1px solid ${!isPaymentDirty || isPaymentPending ? C.border : C.accent}`,
              background: !isPaymentDirty || isPaymentPending ? 'transparent' : C.accentDim,
              color: !isPaymentDirty || isPaymentPending ? C.muted : C.accent,
              transition: 'all 0.15s',
            }}
          >
            {isPaymentPending ? 'guardando…' : 'guardar pago'}
          </button>
          {paymentSaved && !isPaymentDirty && (
            <span style={{ fontSize: '11px', color: C.green }}>
              ✓ guardado
            </span>
          )}
          {paymentError && (
            <span style={{ fontSize: '11px', color: C.red }}>
              ✗ {paymentError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
