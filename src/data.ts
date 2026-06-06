import { Product, LoyaltyMember } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Cafés
  {
    id: 'caf-1',
    cat: 'cafes',
    name: 'Espresso Simple',
    desc: 'Esencia pura de grano tostado premium, extracción perfecta de 30ml.',
    price: 1800,
    stock: true,
    icon: '☕',
    customizable: true
  },
  {
    id: 'caf-2',
    cat: 'cafes',
    name: 'Cappuccino Italiano',
    desc: 'Doble shot de espresso de especialidad, leche texturizada sedosa y un toque de cacao.',
    price: 2600,
    stock: true,
    icon: '🥛',
    customizable: true
  },
  {
    id: 'caf-3',
    cat: 'cafes',
    name: 'Latte Macchiato',
    desc: 'Leche emulsionada suave marcada con un delicioso espresso de la casa.',
    price: 2800,
    stock: true,
    icon: '☕',
    customizable: true
  },
  {
    id: 'caf-4',
    cat: 'cafes',
    name: 'Café Americano',
    desc: 'Espresso doble estirado con agua caliente, resaltando notas frutales y achocolatadas.',
    price: 2000,
    stock: true,
    icon: '☕',
    customizable: true
  },
  {
    id: 'caf-5',
    cat: 'cafes',
    name: 'Mocaccino Belga',
    desc: 'Unión perfecta de chocolate belga fundido, cappuccino regular y crema suave.',
    price: 3200,
    stock: true,
    icon: '🍫',
    customizable: true
  },

  // Bebidas Frías
  {
    id: 'cold-1',
    cat: 'frias',
    name: 'Iced Caramel Latte',
    desc: 'Espresso premium sobre leche fría, abundante hielo y un espiral de caramelo artesanal.',
    price: 3100,
    stock: true,
    icon: '🧊',
    customizable: true
  },
  {
    id: 'cold-2',
    cat: 'frias',
    name: 'Cold Brew Vainilla',
    desc: 'Extracción lenta en frío de 18 horas con sutil jarabe aromatizado con vainas de Madagascar.',
    price: 3300,
    stock: true,
    icon: '🥤',
    customizable: false
  },
  {
    id: 'cold-3',
    cat: 'frias',
    name: 'Frappé Oreo Delight',
    desc: 'Mezcla cremosa licuada con café, trozos crujientes de galleta Oreo, terminado con crema chantilly.',
    price: 3800,
    stock: true,
    icon: '🍪',
    customizable: true
  },
  {
    id: 'cold-4',
    cat: 'frias',
    name: 'Matcha Frappé Orgánico',
    desc: 'Té verde matcha premium ceremonial licuado con leche de almendras y un toque de vainilla.',
    price: 3600,
    stock: true,
    icon: '🍵',
    customizable: true
  },

  // Snacks
  {
    id: 'sna-1',
    cat: 'snacks',
    name: 'Medialuna Dulce',
    desc: 'Clásica medialuna hojaldrada, pincelada con un suave almíbar de cítricos.',
    price: 1200,
    stock: true,
    icon: '🥐',
    customizable: false
  },
  {
    id: 'sna-2',
    cat: 'snacks',
    name: 'Muffin de Arándanos',
    desc: 'Muffin de vainilla esponjoso rebosante de arándanos silvestres del sur de Chile.',
    price: 1800,
    stock: true,
    icon: '🧁',
    customizable: false
  },
  {
    id: 'sna-3',
    cat: 'snacks',
    name: 'Sandwich Jamón Serrano & Rúcula',
    desc: 'Baguette rústica untada con pesto genovés, jamón serrano y hojas frescas de rúcula.',
    price: 4200,
    stock: true,
    icon: '🥪',
    customizable: false
  },
  {
    id: 'sna-4',
    cat: 'snacks',
    name: 'Galleta Triple Chocolate',
    desc: 'Galleta horneada con corazón tierno y abundante cobertura de chocolate negro, de leche y blanco.',
    price: 1500,
    stock: true,
    icon: '🍪',
    customizable: false
  },

  // Combos
  {
    id: 'com-1',
    cat: 'combos',
    name: 'Combo Buenos Días',
    desc: 'Espresso o Americano regular + una Medialuna tibia hojaldrada.',
    price: 2700,
    stock: true,
    icon: '🍳',
    customizable: true
  },
  {
    id: 'com-2',
    cat: 'combos',
    name: 'Combo Conexión Dulce',
    desc: 'Cualquier Cappuccino o Iced Latte + un Muffin de Arándanos o Galleta a elección.',
    price: 3900,
    stock: true,
    icon: '🧁',
    customizable: true
  },
  {
    id: 'com-3',
    cat: 'combos',
    name: 'Combo Almuerzo Express',
    desc: 'Sandwich Jamón Serrano & Rúcula + Iced Latte o Matcha Frappé.',
    price: 6500,
    stock: true,
    icon: '🥪',
    customizable: true
  }
];

export const INITIAL_LOYALTY: LoyaltyMember[] = [
  { rut: '12.345.678-9', name: 'Daniela Silva', points: 2450 },
  { rut: '20.123.456-7', name: 'Carlos González', points: 840 },
  { rut: '18.987.654-3', name: 'Sofía Tapia', points: 4110 },
  { rut: '15.555.555-5', name: 'Barista Principal', points: 1200 }
];
