// Centralización de datos de ejemplo para las previsualizaciones de plantillas

import { ClassicConfig } from '@/components/templates/classic/ClassicTemplate';
import { EleganceConfig } from '@/components/templates/elegance/EleganceTemplate';
import { CostaConfig } from '@/components/templates/costa/CostaTemplate';
import { JardinConfig } from '@/components/templates/jardin/JardinTemplate';


export const DELUXE_DEMO: ClassicConfig = {
  heroLabel: 'The Wedding of',
  couple: { person1: 'Isabella', person2: 'Alexander' },
  fullNames: { person1: 'Isabella Maria Rossi', person2: 'Alexander James Wright' },
  date: { day: '12', month: 'Septiembre', year: '2026' },
  location: 'Toscana, Italia',
  targetDate: '2026-09-12T16:00:00',
  music: {
    url: 'https://drive.google.com/uc?export=download&id=1fPImssW-Q_GTZj9AdQB3oweUYzxSgWlp',
    title: 'Perfect',
    artist: 'Ed Sheeran'
  },
  theme: {
    accentColor: '#B8965A',
    backgroundColor: '#FAF7F2',
    displayFont: 'playfair',
    bodyFont: 'montserrat'
  },
  quote: {
    text: 'El amor es paciente, es bondadoso; el amor no tiene envidia, no es jactancioso, no se envanece.',
    reference: '1 Corintios 13:4',
  },
  photos: [
    { role: 'hero', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85' },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', orderInBlock: 1 },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80', orderInBlock: 2 },
    { role: 'block', afterSection: 'hero', layout: 'trio', blockGroup: 1, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', orderInBlock: 3 },
    { role: 'block', afterSection: 'parents', layout: 'full', blockGroup: 2, url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1400&q=80', orderInBlock: 1 },
    { role: 'block', afterSection: 'itinerary', layout: 'duo', blockGroup: 3, url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80', orderInBlock: 1 },
    { role: 'block', afterSection: 'itinerary', layout: 'duo', blockGroup: 3, url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80', orderInBlock: 2 },
    { role: 'block', afterSection: 'dressCode', layout: 'full', blockGroup: 4, url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1400&q=80', orderInBlock: 1 },
    { role: 'block', afterSection: 'gifts', layout: 'carousel', blockGroup: 5, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85', orderInBlock: 1 },
    { role: 'block', afterSection: 'gifts', layout: 'carousel', blockGroup: 5, url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400&q=85', orderInBlock: 2 },
    { role: 'block', afterSection: 'gifts', layout: 'carousel', blockGroup: 5, url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1400&q=85', orderInBlock: 3 },
    { role: 'block', afterSection: 'gifts', layout: 'carousel', blockGroup: 5, url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1400&q=85', orderInBlock: 4 },
    { role: 'block', afterSection: 'gifts', layout: 'carousel', blockGroup: 5, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=85', orderInBlock: 5 },
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
      name: 'Coctel al Atardecer',
      venue: 'Terraza del Olivo',
      address: 'Villa La Foce',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    },
    {
      time: '20:00',
      name: 'Banquete Toscano',
      venue: 'Gran Salón Principal',
      address: 'Villa La Foce',
      image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80',
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
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#F5E6D3', name: 'Marfil' },
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
        note: 'Tarifa especial para invitados: código ISABELLA26',
        phone: '+39 0578 748311',
      },
    ],
    transport: {
      info: 'Servicio de shuttle privado desde los hoteles principales hacia la villa y de regreso.',
      schedule: [
        { time: '15:30', detail: 'Salida desde Hotel Val d\'Orcia' },
        { time: '01:30', detail: 'Retorno a los hoteles' },
      ],
    },
  },
  gifts: {
    giftListUrl: 'https://www.honeyfund.com/',
    giftListLabel: 'Luna de Miel en Japón',
    envelopeMessage: 'Su presencia es nuestro mayor regalo. Si desean hacernos un obsequio, pueden contribuir a nuestra luna de miel.',
  },
  parents: {
    person1: 'Marco Antonio Rossi &\nGiulia Ferrari de Rossi',
    person2: 'William James Wright &\nEleanor Grace Wright',
  },
  whatsapp: { number: '5215512345678', message: 'Hola, confirmo mi asistencia a la boda de Isabella & Alexander. 🤍' },
  rsvpDeadline: '30 de Junio de 2026',
  rsvp: {
    maxPlusOnes: 2,
    deadline: '30 de Junio de 2026',
  },
  dietary: { enabled: true, options: ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin mariscos', 'Otro'] },
  sections: { quote: true, parents: true, itinerary: true, dressCode: true, destination: true, gifts: true }
};

export const CLASSIC_ELEGANCE_DEMO: EleganceConfig = {
  heroLabel: 'Matrimonio',
  couple: { person1: 'Xavier', person2: 'Nayely' },
  fullNames: { person1: 'Xavier Muñoz', person2: 'Nayely Castillo Ramos' },
  date: { day: '19', month: 'Septiembre', year: '2026' },
  location: 'Porterville, California',
  targetDate: '2026-09-19T13:30:00',
  monogram: 'X & N',
  music: {
    url: 'https://drive.google.com/uc?export=download&id=1fPImssW-Q_GTZj9AdQB3oweUYzxSgWlp',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
  },
  quote: {
    text: '”La música es la mediación entre la vida sensorial y la espiritual.”',
    reference: 'Ludwig van Beethoven',
  },
  photos: [
    { role: 'hero', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&q=85', objectPosition: 'center 40%' },
    { role: 'block', afterSection: 'parents', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80' },
    { role: 'block', afterSection: 'itinerary', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1400&q=80' },
  ],
  parents: {
    person1: 'Paul Castillo Landin & Bertha Ramos Espindola',
    person2: 'Juan Muñoz & Bianca Muñoz',
  },
  itinerary: [
    {
      time: '1:30 PM',
      name: 'Ceremonia Religiosa',
      venue: 'Holy Cross Catholic Church',
      address: '1765 N Newcomb St, Porterville, CA 93257',
      mapsUrl: 'https://maps.google.com/?q=1765+N+Newcomb+St+Porterville+CA',
    },
    {
      time: '3:20 PM',
      name: 'Recepción',
      venue: 'Loya Ranch',
      address: '1121 Maple Ave, Lindsay, CA 93247',
      mapsUrl: 'https://maps.google.com/?q=1121+Maple+Ave+Lindsay+CA',
    },
  ],
  dressCode: {
    label: 'Formal',
    women: 'Vestido largo o midi en negro o dorado.',
    men: 'Traje oscuro con corbata o smoking.',
    swatches: [
      { color: '#000000', name: 'Negro' },
      { color: '#D4AF37', name: 'Dorado' },
      { color: '#1A1A1A', name: 'Ónix' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
    ],
  },
  gifts: {
    bank: 'Wells Fargo',
    holder: 'Xavier Muñoz',
    clabe: '062 000 00412345678 9',
    giftListUrl: 'https://www.amazon.com/wedding',
    giftListLabel: 'Mesa de Regalos Amazon',
    envelopeMessage: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, agradecemos el sobre.',
  },
  whatsapp: { number: '5215512345678', message: 'Hola, confirmo mi asistencia a la boda de Xavier & Nayely. 🤍' },
  rsvpDeadline: '1 de Agosto de 2026',
  rsvp: {
    maxPlusOnes: 2,
  },
  dietary: { enabled: true, options: ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin mariscos', 'Otro'] },
  destination: {
    hotels: [
      {
        name: 'Hampton Inn Porterville',
        category: 'Hotel recomendado · 3 estrellas',
        address: '1 W. Montgomery Ave, Porterville, CA',
        note: 'Menciona la boda de Xavier & Nayely para tarifa especial.',
        phone: '+1 559 782 2900',
      },
      {
        name: 'SpringHill Suites Visalia',
        category: 'Suite familiar · 3 estrellas',
        address: '4701 W Mineral King Ave, Visalia, CA',
        note: 'A 30 min del evento. Desayuno incluido.',
        phone: '+1 559 739 5555',
      },
    ],
    transport: {
      info: 'Habrá servicio de transporte gratuito desde Hampton Inn hacia los venues del día.',
      schedule: [
        { time: '1:00 PM', detail: 'Salida hacia Holy Cross Catholic Church' },
        { time: '3:00 PM', detail: 'Traslado a Loya Ranch' },
        { time: '12:00 AM', detail: 'Retorno al hotel' },
      ],
    },
  },
  sections: {
    quote: true,
    parents: true,
    itinerary: true,
    dressCode: true,
    destination: true,
    gifts: true,
  },
};

export const COSTA_DEMO: CostaConfig = {
  heroLabel: 'Nuestra Boda en la Playa',
  couple: { person1: 'Camila', person2: 'Diego' },
  fullNames: { person1: 'Camila Torres Vega', person2: 'Diego Fernández Luna' },
  date: { day: '14', month: 'Marzo', year: '2027' },
  location: 'Riviera Maya, México',
  targetDate: '2027-03-14T17:00:00',
  monogram: 'C & D',
  theme: {
    accentColor: '#1F9B9B',
    displayFont: 'cormorant',
    bodyFont: 'jost',
  },
  music: {
    url: 'https://drive.google.com/uc?export=download&id=1fPImssW-Q_GTZj9AdQB3oweUYzxSgWlp',
    title: 'Can\'t Help Falling in Love',
    artist: 'Kina Grannis',
  },
  quote: {
    text: 'Como las olas vuelven siempre a la orilla, así vuelvo yo siempre a ti.',
    reference: 'Pablo Neruda',
  },
  photos: [
    { role: 'hero', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85' },
    { role: 'block', afterSection: 'parents', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1400&q=80' },
    { role: 'block', afterSection: 'itinerary', url: 'https://images.unsplash.com/photo-1544378730-8b5104b18790?w=1400&q=80' },
  ],
  parents: {
    person1: 'Roberto Torres & Marisol Vega de Torres',
    person2: 'Fernando Fernández & Adriana Luna de Fernández',
  },
  itinerary: [
    {
      time: '5:00 PM',
      name: 'Ceremonia Frente al Mar',
      venue: 'Playa Las Palmas',
      address: 'Riviera Maya, Q. Roo',
      mapsUrl: 'https://maps.google.com/?q=Riviera+Maya',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    },
    {
      time: '6:30 PM',
      name: 'Cóctel de Bienvenida',
      venue: 'Jardín Oceanfront',
      address: 'Hotel Las Palmas Resort',
      mapsUrl: 'https://maps.google.com/?q=Riviera+Maya',
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    },
    {
      time: '8:00 PM',
      name: 'Recepción bajo las Estrellas',
      venue: 'Terraza Oceanfront',
      address: 'Hotel Las Palmas Resort',
      mapsUrl: 'https://maps.google.com/?q=Riviera+Maya',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
    },
    {
      time: '11:00 PM',
      name: 'Barra de Postres y Café',
      venue: 'Terraza Oceanfront',
      address: 'Hotel Las Palmas Resort',
      mapsUrl: 'https://maps.google.com/?q=Riviera+Maya',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    },
  ],
  dressCode: {
    label: 'Elegante de Playa',
    women: 'Vestido ligero y fresco, tonos claros. Evitar tacones finos por la arena.',
    men: 'Guayabera o camisa de lino, pantalón claro. Sin corbata.',
    swatches: [
      { color: '#F4EADA', name: 'Arena' },
      { color: '#1F9B9B', name: 'Turquesa' },
      { color: '#E2725B', name: 'Coral' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#000000', name: 'Negro' },
    ],
  },
  gifts: {
    bank: 'BBVA',
    holder: 'Camila Torres Vega',
    clabe: '012 180 00412345678 3',
    giftListUrl: 'https://www.amazon.com/wedding',
    giftListLabel: 'Mesa de Regalos Amazon',
    envelopeMessage: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, agradecemos el sobre.',
  },
  notes: [
    'La ceremonia y recepción son al aire libre, frente al mar: te recomendamos calzado cómodo para arena.',
    'Habrá servicio de shuttle desde los hoteles recomendados; horarios en la sección de transporte.',
    'La celebración continúa hasta la 1:00 AM. ¡Ven con energía para bailar toda la noche!',
  ],
  noChildren: true,
  noChildrenMessage: 'Con todo nuestro cariño, les pedimos que esta celebración frente al mar sea exclusiva para adultos. Agradecemos mucho su comprensión.',
  whatsapp: { number: '5215512345678', message: 'Hola, confirmo mi asistencia a la boda de Camila & Diego. 🌊' },
  rsvpDeadline: '1 de Febrero de 2027',
  rsvp: {
    maxPlusOnes: 2,
  },
  dietary: { enabled: true, options: ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin mariscos', 'Otro'] },
  destination: {
    hotels: [
      {
        name: 'Las Palmas Resort & Spa',
        category: 'Sede del evento · Todo incluido',
        address: 'Riviera Maya, Q. Roo',
        note: 'Tarifa especial para invitados: código CAMIDIEGO27',
        phone: '+52 984 123 4567',
      },
      {
        name: 'Hotel Costa Azul',
        category: 'Boutique · Recomendado',
        address: 'Playa del Carmen, Q. Roo',
        note: 'A 10 min de la sede. Desayuno incluido.',
        phone: '+52 984 765 4321',
      },
    ],
    transport: {
      info: 'Servicio de shuttle desde el aeropuerto de Cancún y traslados diarios a la sede del evento.',
      schedule: [
        { time: '4:00 PM', detail: 'Salida hacia Playa Las Palmas' },
        { time: '1:00 AM', detail: 'Retorno a los hoteles' },
      ],
    },
  },
  sections: {
    quote: true,
    parents: true,
    itinerary: true,
    dressCode: true,
    destination: true,
    gifts: true,
  },
};

export const JARDIN_DEMO: JardinConfig = {
  heroLabel: 'Boda de Jardín',
  couple: { person1: 'Valentina', person2: 'Mateo' },
  fullNames: { person1: 'Valentina Reyes Molina', person2: 'Mateo Salas Herrera' },
  date: { day: '9', month: 'Mayo', year: '2027' },
  location: 'Hacienda Los Laureles, Morelos',
  targetDate: '2027-05-09T16:00:00',
  monogram: 'V & M',
  theme: {
    accentColor: '#7C8B6F',
    displayFont: 'playfair',
    bodyFont: 'raleway',
  },
  music: {
    url: 'https://drive.google.com/uc?export=download&id=1fPImssW-Q_GTZj9AdQB3oweUYzxSgWlp',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
  },
  quote: {
    text: 'El amor es la única cosecha que crece más cuando se comparte.',
    reference: 'Anónimo',
  },
  photos: [
    { role: 'hero', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85' },
    { role: 'block', afterSection: 'parents', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1400&q=80' },
    { role: 'block', afterSection: 'itinerary', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1400&q=80' },
  ],
  parents: {
    person1: 'Ernesto Reyes & Guadalupe Molina de Reyes',
    person2: 'Javier Salas & Beatriz Herrera de Salas',
  },
  itinerary: [
    {
      time: '4:00 PM',
      name: 'Ceremonia en el Jardín',
      venue: 'Jardín Principal',
      address: 'Hacienda Los Laureles, Morelos',
      mapsUrl: 'https://maps.google.com/?q=Hacienda+Los+Laureles',
      image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    },
    {
      time: '5:30 PM',
      name: 'Cóctel entre Rosales',
      venue: 'Terraza del Jardín',
      address: 'Hacienda Los Laureles, Morelos',
      mapsUrl: 'https://maps.google.com/?q=Hacienda+Los+Laureles',
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    },
    {
      time: '7:30 PM',
      name: 'Cena bajo las Luces',
      venue: 'Salón de Cristal',
      address: 'Hacienda Los Laureles, Morelos',
      mapsUrl: 'https://maps.google.com/?q=Hacienda+Los+Laureles',
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
    },
    {
      time: '10:00 PM',
      name: 'Fiesta y Baile',
      venue: 'Pista al Aire Libre',
      address: 'Hacienda Los Laureles, Morelos',
      mapsUrl: 'https://maps.google.com/?q=Hacienda+Los+Laureles',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    },
  ],
  dressCode: {
    label: 'Elegante Campestre',
    women: 'Vestido midi o largo en tonos tierra o pastel. Evitar tacones de aguja por el pasto.',
    men: 'Traje claro o guayabera formal, sin corbata.',
    swatches: [
      { color: '#EEF1E6', name: 'Marfil' },
      { color: '#7C8B6F', name: 'Salvia' },
      { color: '#C77B58', name: 'Terracota' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#3A3A3A', name: 'Negro noche' },
    ],
  },
  gifts: {
    bank: 'Santander',
    holder: 'Valentina Reyes Molina',
    clabe: '014 180 00512345678 9',
    giftListUrl: 'https://www.liverpool.com.mx/tienda/wedding-registry',
    giftListLabel: 'Mesa de Regalos Liverpool',
    envelopeMessage: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, agradecemos el sobre.',
  },
  notes: [
    'La ceremonia y recepción son al aire libre, sobre pasto: te recomendamos calzado bajo o cuñas.',
    'El clima en mayo puede ser soleado, trae protector solar y, si gustas, un abanico.',
    'Al anochecer refresca — un chal o saco ligero no está de más.',
  ],
  noChildren: true,
  noChildrenMessage: 'Con todo nuestro cariño, les pedimos que esta celebración entre jardines sea exclusiva para adultos. Agradecemos mucho su comprensión.',
  whatsapp: { number: '5215587654321', message: 'Hola, confirmo mi asistencia a la boda de Valentina & Mateo. 🌿' },
  rsvpDeadline: '15 de Marzo de 2027',
  rsvp: {
    maxPlusOnes: 2,
  },
  dietary: { enabled: true, options: ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Otro'] },
  destination: {
    hotels: [
      {
        name: 'Hacienda Los Laureles',
        category: 'Sede del evento · Habitaciones disponibles',
        address: 'Morelos, México',
        note: 'Tarifa especial para invitados: código VALYMATEO27',
        phone: '+52 777 123 4567',
      },
      {
        name: 'Hotel Jardines de Cuernavaca',
        category: 'Boutique · Recomendado',
        address: 'Cuernavaca, Morelos',
        note: 'A 15 min de la sede. Desayuno incluido.',
        phone: '+52 777 765 4321',
      },
    ],
    transport: {
      info: 'Servicio de shuttle desde los hoteles recomendados hacia la hacienda.',
      schedule: [
        { time: '3:15 PM', detail: 'Salida hacia Hacienda Los Laureles' },
        { time: '11:30 PM', detail: 'Retorno a los hoteles' },
      ],
    },
  },
  sections: {
    quote: true,
    parents: true,
    itinerary: true,
    dressCode: true,
    destination: true,
    gifts: true,
  },
};
