import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/plantillas/deluxe?plan=plus');
}
