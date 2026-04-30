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
    }}>
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(201,168,124,0.1);
          border-top-color: #C9A87C;
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
