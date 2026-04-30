'use client';

import React from 'react';

interface Props {
  size?: number;
  color?: string;
  light?: boolean;
}

export default function Spinner({ size = 20, color = '#C9A87C', light = false }: Props) {
  const finalColor = light ? '#FFFFFF' : color;
  
  return (
    <div className="spinner-container">
      <style>{`
        .spinner-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: ${size}px;
          height: ${size}px;
          border: 2px solid ${finalColor}22;
          border-top-color: ${finalColor};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="spinner" />
    </div>
  );
}
