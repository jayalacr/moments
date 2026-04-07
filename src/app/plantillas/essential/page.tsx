import EssentialTemplate from '@/components/templates/essential/EssentialTemplate';

export const metadata = {
  title: 'Plan Essential — Moments',
  description: 'Vista previa de la plantilla del plan Essential para invitaciones digitales.',
};

const DEMO = {
  heroLabel: 'Nuestro gran día',
  couple: { person1: 'Sofía', person2: 'Mateo' },
  fullNames: { person1: 'Sofía Herrera López', person2: 'Mateo Mendoza Ruiz' },
  date: { day: '18', month: 'Octubre', year: '2025' },
  location: 'Ciudad de México',
  images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1400&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
  ],
  quote: { text: 'Lo que Dios unió, que no lo separe el hombre.', reference: 'Marcos 10:9' },
  parents: {
    person1: 'Roberto Herrera &\nCarmen López de Herrera',
    person2: 'Jorge Mendoza &\nPatricia Ruiz de Mendoza',
  },
  itinerary: [
    { time: '16:00', name: 'Ceremonia Religiosa', venue: 'Parroquia de San Francisco de Asís', address: 'Av. Francisco I. Madero 12, Centro Histórico, CDMX' },
    { time: '18:30', name: 'Coctel de Bienvenida', venue: 'Jardín Las Palmas', address: 'Calle Palmas 340, Lomas de Chapultepec, CDMX' },
    { time: '20:00', name: 'Recepción', venue: 'Salón Grand Palais', address: 'Paseo de la Reforma 500, Cuauhtémoc, CDMX' },
  ],
  dressCode: {
    label: 'Formal',
    women: 'Vestido largo o midi en tonos de la paleta. Se agradece tacón o sandalia elegante.',
    men: 'Traje oscuro o guayabera formal. Corbata o moño en tonos de la paleta.',
    swatches: [
      { color: '#E8D5C4', name: 'Champagne' },
      { color: '#C9A87C', name: 'Dorado' },
      { color: '#8B9D77', name: 'Salvia' },
      { color: '#7B9AB2', name: 'Acero' },
      { color: '#D4C5B5', name: 'Perla' },
    ],
    avoid: [{ color: '#FFFFFF', name: 'Blanco' }, { color: '#F5F5DC', name: 'Crema' }],
  },
  notes: [
    'Evento para adultos — no se permiten niños.',
    'Puntualidad apreciada. Las puertas cierran a las 16:15 h.',
    'Estacionamiento gratuito disponible en el venue.',
  ],
  gifts: {
    bank: 'BBVA', holder: 'Sofía Herrera López',
    account: '4152 3140 7823 9012', clabe: '012 180 00412345678 9',
    giftListUrl: 'https://mesaderegalos.liverpool.com.mx/misregalos/12345',
    giftListLabel: 'Liverpool',
  },
  whatsapp: { number: '5215512345678', message: 'Hola, confirmo mi asistencia a la boda de Sofía & Mateo el 18 de octubre. 🤍' },
  noChildren: true,
  rsvpDeadline: '30 de septiembre',
};

export default function EssentialPreviewPage() {
  return <EssentialTemplate config={DEMO} />;
}
