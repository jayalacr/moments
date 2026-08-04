'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export default function VideoPreview({ src, poster, label, priority }: { src: string; poster: string; label: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onMouseEnter={() => { setHovering(true); ref.current?.play().catch(() => {}); }}
      onMouseLeave={() => {
        setHovering(false);
        const v = ref.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
    >
      <Image
        src={poster}
        alt={label}
        fill
        sizes="(max-width: 720px) 100vw, 50vw"
        priority={priority}
        style={{ opacity: hovering ? 0 : 1, transition: 'opacity 0.2s ease' }}
      />
      <video
        ref={ref}
        src={src}
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={label}
        style={{ opacity: hovering ? 1 : 0, transition: 'opacity 0.2s ease' }}
      />
    </div>
  );
}
