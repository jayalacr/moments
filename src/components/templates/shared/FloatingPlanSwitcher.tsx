'use client';

import { useRouter } from 'next/navigation';
import type { EventPlan } from '@/lib/plans';

const PLANS: { key: EventPlan; label: string; color: string }[] = [
  { key: 'essential', label: 'Essential', color: '#9B8B78' },
  { key: 'plus', label: 'Plus', color: '#B8965A' },
  { key: 'deluxe', label: 'Deluxe', color: '#C9A87C' },
];

export default function FloatingPlanSwitcher({
  activePlan,
  baseUrl,
}: {
  activePlan: EventPlan;
  baseUrl: string;
}) {
  const router = useRouter();

  return (
    <div
      data-plan-switcher
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(18,14,10,0.90)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '8px 10px 8px 14px',
        borderRadius: '100px',
        border: '1px solid rgba(184,150,90,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontSize: '9px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily: 'system-ui, sans-serif',
          marginRight: '4px',
          userSelect: 'none',
        }}
      >
        Plan
      </span>

      {PLANS.map(({ key, label, color }) => {
        const isActive = activePlan === key;
        return (
          <button
            key={key}
            onClick={() => router.push(`${baseUrl}?plan=${key}`)}
            style={{
              padding: '5px 14px',
              borderRadius: '100px',
              border: isActive ? `1px solid ${color}` : '1px solid transparent',
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: '0.06em',
              background: isActive ? `${color}22` : 'transparent',
              color: isActive ? color : 'rgba(255,255,255,0.45)',
              transition: 'background 0.18s, color 0.18s, border-color 0.18s',
              outline: 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
