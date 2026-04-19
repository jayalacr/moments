'use client';

export default function Loading() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF7F2',
      color: '#1C1611',
    }}>
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
        }
        .loader-logo {
          font-family: var(--font-cormorant), serif;
          font-size: 24px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #B8965A;
          animation: fadeInOut 2s ease-in-out infinite;
          margin-bottom: 24px;
        }
        .loader-bar {
          width: 120px;
          height: 1px;
          background: #E6DDD2;
          position: relative;
          overflow: hidden;
        }
        .loader-bar::after {
          content: '';
          position: absolute;
          left: -100%;
          width: 100%;
          height: 100%;
          background: #B8965A;
          animation: slide 1.5s infinite;
        }
        @keyframes slide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      <div className="loader-logo">Moments</div>
      <div className="loader-bar" />
    </div>
  );
}
