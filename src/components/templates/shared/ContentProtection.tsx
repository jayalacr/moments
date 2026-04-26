'use client';

import { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function ContentProtection({ children, enabled = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    const blockDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault();
    };

    const blockShortcuts = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        (ctrl && e.key === 's') ||
        (ctrl && e.key === 'u') ||
        (ctrl && e.shiftKey && e.key === 'i')
      ) {
        e.preventDefault();
      }
    };

    el.addEventListener('contextmenu', blockContextMenu);
    el.addEventListener('dragstart', blockDragStart);
    document.addEventListener('keydown', blockShortcuts);

    return () => {
      el.removeEventListener('contextmenu', blockContextMenu);
      el.removeEventListener('dragstart', blockDragStart);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <div
      ref={ref}
      className="select-none [&_input]:select-text [&_textarea]:select-text [&_select]:select-text"
    >
      {children}
    </div>
  );
}
