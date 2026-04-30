import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 animate-in fade-in duration-500">
      <Loader2 
        className="w-10 h-10 animate-spin" 
        style={{ color: '#C9A87C' }} 
      />
      <p className="mt-4 text-sm tracking-widest uppercase opacity-60" style={{ color: '#1C1611', fontFamily: 'var(--font-jost)' }}>
        Cargando...
      </p>
    </div>
  );
}
