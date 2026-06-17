'use client';

import { useState } from 'react';
import { updateEventPlan } from '@/app/superadmin/_actions';

const C = {
  bg: '#0D1117',
  border: '#222D3F',
  borderBright: '#2D3F57',
  accent: '#2DD4BF',
  accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB',
  muted: '#7A90A8',
  mutedMid: '#9DB2C8',
  green: '#4ADE80',
  greenDim: 'rgba(74,222,128,0.12)',
  amber: '#FBBF24',
  amberDim: 'rgba(251,191,36,0.12)',
  red: '#F87171',
  redDim: 'rgba(248,113,113,0.12)',
  sidebar: '#161B26',
  purple: '#A78BFA',
};

type EventPlan = 'essential' | 'plus' | 'deluxe';

const PLAN_ORDER: Record<EventPlan, number> = { essential: 0, plus: 1, deluxe: 2 };

const PLAN_COLOR: Record<EventPlan, string> = {
  essential: C.mutedMid,
  plus: C.accent,
  deluxe: C.purple,
};

const PLANS: EventPlan[] = ['essential', 'plus', 'deluxe'];

interface Props {
  eventId: string;
  currentPlan: EventPlan;
  currentTemplateType: string | null;
}

export default function PlanChanger({ eventId, currentPlan }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<EventPlan>(currentPlan);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{ success: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isUpgrade = PLAN_ORDER[selectedPlan] > PLAN_ORDER[currentPlan];

  function openModal() {
    setIsConfirmed(false);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setIsConfirmed(false);
  }

  async function handleConfirm() {
    setIsPending(true);
    setError(null);
    try {
      const res = await updateEventPlan(eventId, selectedPlan);
      setResult(res);
      closeModal();
      setTimeout(() => setResult(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setIsPending(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Plan actual */}
        <div
          style={{
            padding: '14px 16px',
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: C.muted,
              letterSpacing: '2px',
              marginBottom: '8px',
            }}
          >
            PLAN ACTUAL
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: PLAN_COLOR[currentPlan],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: PLAN_COLOR[currentPlan],
                letterSpacing: '0.05em',
              }}
            >
              {currentPlan.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Selector de nuevo plan */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: C.muted,
              letterSpacing: '2px',
              marginBottom: '10px',
            }}
          >
            CAMBIAR A
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan;
              const isCurrent = plan === currentPlan;
              return (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: `1px solid ${isSelected ? PLAN_COLOR[plan] : C.border}`,
                    borderRadius: '6px',
                    backgroundColor: isSelected
                      ? `${PLAN_COLOR[plan]}18`
                      : C.sidebar,
                    color: isSelected ? PLAN_COLOR[plan] : isCurrent ? C.muted : C.mutedMid,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                    position: 'relative',
                  }}
                >
                  {plan.toUpperCase()}
                  {isCurrent && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '8px',
                        color: C.muted,
                        marginTop: '2px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      actual
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón de acción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={openModal}
            disabled={selectedPlan === currentPlan}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedPlan === currentPlan ? 'transparent' : C.amber,
              color: selectedPlan === currentPlan ? C.muted : '#07090F',
              border: `1px solid ${selectedPlan === currentPlan ? C.border : C.amber}`,
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: selectedPlan === currentPlan ? 'not-allowed' : 'pointer',
              opacity: selectedPlan === currentPlan ? 0.5 : 1,
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
          >
            Cambiar plan
          </button>

          {result?.success && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.green }}>
              ✓ Plan actualizado correctamente
            </span>
          )}
          {error && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.red }}>
              ✗ {error}
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              backgroundColor: '#0D1117',
              border: `1px solid ${C.borderBright}`,
              borderRadius: '12px',
              maxWidth: '480px',
              width: 'calc(100% - 32px)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: C.muted,
                    letterSpacing: '2px',
                    marginBottom: '6px',
                  }}
                >
                  CONFIRMAR CAMBIO DE PLAN
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: PLAN_COLOR[currentPlan],
                      fontWeight: 600,
                    }}
                  >
                    {currentPlan.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted }}>→</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: PLAN_COLOR[selectedPlan],
                      fontWeight: 600,
                    }}
                  >
                    {selectedPlan.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '1px',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      backgroundColor: isUpgrade ? C.greenDim : C.amberDim,
                      color: isUpgrade ? C.green : C.amber,
                      border: `1px solid ${isUpgrade ? C.green : C.amber}`,
                    }}
                  >
                    {isUpgrade ? '↑ UPGRADE' : '↓ DOWNGRADE'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>

            {/* Descripción de consecuencias */}
            <div
              style={{
                padding: '14px 16px',
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: C.mutedMid,
                  lineHeight: 1.7,
                }}
              >
                {isUpgrade ? (
                  <>
                    El evento pasará al plan{' '}
                    <span style={{ color: PLAN_COLOR[selectedPlan] }}>{selectedPlan.toUpperCase()}</span>.
                    El organizador podrá acceder a templates y funcionalidades adicionales.
                    El contenido y configuración actuales se conservan íntegramente.
                  </>
                ) : (
                  <>
                    El evento pasará al plan{' '}
                    <span style={{ color: PLAN_COLOR[selectedPlan] }}>{selectedPlan.toUpperCase()}</span>.
                    El organizador perderá acceso a funcionalidades del plan superior.
                    El contenido y el template asignado se conservan íntegramente.
                  </>
                )}
              </p>
            </div>

            {/* Checkbox de confirmación */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                style={{ marginTop: '2px', accentColor: C.accent, cursor: 'pointer' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: C.mutedMid,
                  lineHeight: 1.5,
                }}
              >
                Entiendo las implicaciones de este cambio
              </span>
            </label>

            {/* Error dentro del modal */}
            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.red }}>
                ✗ {error}
              </p>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                disabled={isPending}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'transparent',
                  color: C.mutedMid,
                  border: `1px solid ${C.borderBright}`,
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmed || isPending}
                style={{
                  padding: '10px 18px',
                  backgroundColor: !isConfirmed || isPending ? 'transparent' : C.amber,
                  color: !isConfirmed || isPending ? C.muted : '#07090F',
                  border: `1px solid ${!isConfirmed || isPending ? C.border : C.amber}`,
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: !isConfirmed || isPending ? 'not-allowed' : 'pointer',
                  opacity: !isConfirmed || isPending ? 0.5 : 1,
                  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                }}
              >
                {isPending ? 'Cambiando...' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
