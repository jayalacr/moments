'use client';

import { useEffect, useRef } from 'react';

interface Props {
  html: string;
}

export default function InvitacionRenderer({ html }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = html;

    // innerHTML no ejecuta scripts automáticamente — hay que recrearlos
    ref.current.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }, [html]);

  return <div ref={ref} suppressHydrationWarning />;
}
