'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Props {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function LogoutButton({ style, children }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} style={style}>
      {children ?? 'Cerrar sesión'}
    </button>
  );
}
