// Centralización de datos de ejemplo para las previsualizaciones de plantillas

import { EssentialConfig } from '@/components/templates/essential/EssentialTemplate';
import { PlusConfig } from '@/components/templates/plus/PlusTemplate';
import { DeluxeConfig } from '@/components/templates/deluxe/DeluxeTemplate';

export const ESSENTIAL_DEMO: EssentialConfig = {
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
    { time: '16:00', name: 'Ceremonia Religiosa', venue: 'Parroquia de San Francisco de Asís', address: 'Centro Histórico, CDMX' },
    { time: '18:30', name: 'Coctel de Bienvenida', venue: 'Jardín Las Palmas', address: 'Lomas de Chapultepec, CDMX' },
    { time: '20:00', name: 'Recepción', venue: 'Salón Grand Palais', address: 'Paseo de la Reforma, CDMX' },
  ],
  dressCode: {
    label: 'Formal',
    women: 'Vestido largo o midi en tonos de la paleta.',
    men: 'Traje oscuro o guayabera formal.',
    swatches: [
      { color: '#E8D5C4', name: 'Champagne' },
      { color: '#C9A87C', name: 'Dorado' },
      { color: '#8B9D77', name: 'Salvia' },
    ],
  },
  gifts: {
    bank: 'BBVA', holder: 'Sofía Herrera López',
    account: '4152 3140 7823 9012', clabe: '012 180 00412345678 9',
    giftListUrl: 'https://mesaderegalos.liverpool.com.mx/',
    giftListLabel: 'Mesa de Regalos',
  },
  whatsapp: { number: '5215512345678', message: 'Hola, confirmo mi asistencia a la boda de Sofía & Mateo. 🤍' },
  noChildren: true,
  rsvpDeadline: '30 de Septiembre',
  sections: { quote: true, parents: true, dressCode: true, gifts: true }
};

export const PLUS_DEMO: PlusConfig = {
  heroLabel: 'Matrimonio',
  couple: { person1: 'Valentina', person2: 'Sebastián' },
  fullNames: { person1: 'Valentina Ríos Castillo', person2: 'Sebastián Mora Vega' },
  date: { day: '01', month: 'Agosto', year: '2026' },
  location: 'Cartagena, Colombia',
  targetDate: '2026-08-01T17:00:00',
  quote: {
    text: 'El amor es paciente, es bondadoso; el amor no tiene envidia.',
    reference: '1 Corintios 13:4',
  },
  parents: {
    person1: 'Andrés Ríos &\nMaría Castillo de Ríos',
    person2: 'Carlos Mora &\nLucia Vega de Mora',
  },
  images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',
  ],
  itinerary: [
    {
      time: '17:00',
      name: 'Ceremonia Civil',
      venue: 'Hotel Santa Clara',
      address: 'Centro Histórico, Cartagena',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80',
    },
    {
      time: '19:00',
      name: 'Coctel',
      venue: 'Terraza del Baluarte',
      address: 'Murallas de Cartagena',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    },
    {
      time: '21:00',
      name: 'Recepción',
      venue: 'Salón Principal',
      address: 'Hotel Santa Clara',
      image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80',
    },
  ],
  dressCode: {
    label: 'Guayabera Formal',
    women: 'Vestido largo o midi. Colores claros recomendados.',
    men: 'Guayabera de lino blanca y pantalón de vestir claro.',
    swatches: [
      { color: '#F2E8D9', name: 'Arena' },
      { color: '#6B8FA3', name: 'Azul Mar' },
      { color: '#9DB88A', name: 'Oliva' },
    ],
  },
  destination: {
    hotels: [
      {
        name: 'Hotel Santa Clara',
        category: 'Sede del evento · 5 estrellas',
        address: 'Centro Histórico',
        note: 'Código de descuento: VALYSEB',
        phone: '+57 5 664 6070',
      },
      {
        name: 'Sofitel Legend',
        category: '5 estrellas · Recomendado',
        address: 'Barrio San Diego',
        note: 'Tarifa preferencial',
        phone: '+57 5 650 4444',
      },
    ],
    transport: {
      info: 'Habrá servicio de transporte desde los hoteles principales.',
      schedule: [
        { time: '16:30', detail: 'Recogida en Hoteles' },
        { time: '02:00', detail: 'Retorno a Hoteles' },
      ],
    },
  },
  gifts: {
    giftListUrl: 'https://www.zola.com/',
    giftListLabel: 'Mesa de Regalos Digital',
    envelopeMessage: 'Su presencia es nuestro mejor regalo, pero si desean tener un detalle, tendremos lluvia de sobres.',
  },
  rsvp: {
    deadline: '15 de Mayo de 2026',
    dietaryOptions: ['Sin restricción', 'Vegetariano', 'Vegano', 'Sin gluten'],
  },
  sections: { quote: true, parents: true, itinerary: true, dressCode: true, destination: true, gifts: true }
};

export const DELUXE_DEMO: DeluxeConfig = {
  heroLabel: 'The Wedding of',
  couple: { person1: 'Isabella', person2: 'Alexander' },
  fullNames: { person1: 'Isabella Maria Rossi', person2: 'Alexander James Wright' },
  date: { day: '12', month: 'Septiembre', year: '2026' },
  location: 'Toscana, Italia',
  targetDate: '2026-09-12T16:00:00',
  music: {
    url: 'https://res.cloudinary.com/demo/video/upload/v1625587778/sample_audio.mp3',
    title: 'A Thousand Years',
    artist: 'Christina Perri (Piano Cover)'
  },
  theme: {
    accentColor: '#B8965A',
    backgroundColor: '#FAF7F2',
    displayFont: 'playfair',
    bodyFont: 'montserrat'
  },
  photos: [
    { role: 'hero', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85' },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', orderInBlock: 1 },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80', orderInBlock: 2 },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', orderInBlock: 3 },
  ],
  itinerary: [
    {
      time: '16:00',
      name: 'Ceremonia en el Olivar',
      venue: 'Villa La Foce',
      address: 'Val d\'Orcia, Toscana',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80',
    },
    {
      time: '18:00',
      name: 'Banquete Toscano',
      venue: 'Terraza Principal',
      address: 'Villa La Foce',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    },
  ],
  dressCode: {
    label: 'Black Tie Creative',
    women: 'Vestido de gala largo. Se permiten colores vibrantes.',
    men: 'Tuxedo o traje formal oscuro con un toque personal.',
    swatches: [
      { color: '#1C1611', name: 'Negro' },
      { color: '#B8965A', name: 'Dorado' },
      { color: '#4A0E0E', name: 'Vino' },
    ],
  },
  destination: {
    hotels: [
      {
        name: 'Villa La Foce',
        category: 'Sede del evento',
        address: 'Val d\'Orcia',
        note: 'Habitaciones reservadas para familia directa.',
        phone: '+39 0578 69101',
      },
      {
        name: 'Hotel Val d\'Orcia',
        category: 'Boutique · Recomendado',
        address: 'Pienza',
        note: 'Transporte incluido a la villa.',
        phone: '+39 0578 748311',
      },
    ],
  },
  gifts: {
    giftListUrl: 'https://www.honeyfund.com/',
    giftListLabel: 'Luna de Miel en Japón',
    envelopeMessage: 'Su presencia es nuestro mayor regalo. Si desean hacernos un obsequio, pueden contribuir a nuestra luna de miel.',
  },
  sections: { quote: true, parents: true, itinerary: true, dressCode: true, destination: true, gifts: true }
};
