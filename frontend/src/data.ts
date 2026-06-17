export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  thumbnails: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  specs: Record<string, string>;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  total: number;
  items: CartItem[];
  shipping: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export const CATEGORIES = ['All', 'Arduino', 'IC', 'Sensor', 'Resistor', 'Kapasitor', 'LED'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Arduino Uno R3',
    description: 'Board mikrokontroler Arduino Uno R3 menggunakan chip ATmega328P. Standar industri untuk belajar mikrokontroler dan purwarupa IoT.',
    price: 250000.00,
    category: 'Arduino',
    image: '/uploads/products/arduino_uno.png',
    thumbnails: [
      '/uploads/products/arduino_uno.png'
    ],
    rating: 4.9,
    reviewsCount: 124,
    stock: 10,
    specs: {
      'Mikrokontroler': 'ATmega328P',
      'Tegangan Operasi': '5V',
      'Input Voltage': '7-12V',
      'Digital I/O Pins': '14'
    }
  },
  {
    id: 'p2',
    name: 'IC 555 Timer',
    description: 'IC timer/oscillator NE555 kemasan DIP-8 untuk berbagai proyek pewaktu, generator pulsa, dan osilator.',
    price: 15000.00,
    category: 'IC',
    image: '/uploads/products/ic_chip.png',
    thumbnails: [
      '/uploads/products/ic_chip.png'
    ],
    rating: 4.8,
    reviewsCount: 45,
    stock: 25,
    specs: {
      'Kemasan': 'DIP-8',
      'Fungsi': 'Timer / Oscillator',
      'Tegangan Supply': '4.5V - 16V'
    }
  },
  {
    id: 'p3',
    name: 'Sensor Suhu DHT22',
    description: 'Sensor pengukur suhu dan kelembaban udara digital dengan presisi tinggi dan output sinyal digital terkalibrasi.',
    price: 45000.00,
    category: 'Sensor',
    image: '/uploads/products/sensor_dht22.png',
    thumbnails: [
      '/uploads/products/sensor_dht22.png'
    ],
    rating: 4.7,
    reviewsCount: 89,
    stock: 15,
    specs: {
      'Resolusi Pengukuran': '0.1',
      'Range Kelembaban': '0-100% RH',
      'Range Suhu': '-40 sampai 80 C',
      'Akurasi': '+/- 2% RH, +/- 0.5 C'
    }
  },
  {
    id: 'p4',
    name: 'Resistor 10K Ohm',
    description: 'Resistor film karbon 1/4 watt dengan toleransi 5%, nilai hambatan 10K Ohm. Sangat penting untuk pull-up/pull-down resistor.',
    price: 500.00,
    category: 'Resistor',
    image: '/uploads/products/resistor.png',
    thumbnails: [
      '/uploads/products/resistor.png'
    ],
    rating: 4.9,
    reviewsCount: 200,
    stock: 150,
    specs: {
      'Hambatan': '10K Ohm',
      'Daya': '1/4 Watt',
      'Toleransi': '5%'
    }
  },
  {
    id: 'p5',
    name: 'Kapasitor 100uF',
    description: 'Kapasitor elektrolit (Elco) nilai 100uF dengan tegangan maksimum 25V untuk filter noise tegangan.',
    price: 2000.00,
    category: 'Kapasitor',
    image: '/uploads/products/kapasitor.png',
    thumbnails: [
      '/uploads/products/kapasitor.png'
    ],
    rating: 4.6,
    reviewsCount: 30,
    stock: 50,
    specs: {
      'Kapasitansi': '100uF',
      'Tegangan Maksimum': '25V',
      'Tipe': 'Elektrolit (Polar)'
    }
  },
  {
    id: 'p6',
    name: 'LED 5mm Merah',
    description: 'Lampu LED indikator 5mm warna merah terang (Clear red) untuk indikator status sirkuit.',
    price: 1000.00,
    category: 'LED',
    image: '/uploads/products/led.png',
    thumbnails: [
      '/uploads/products/led.png'
    ],
    rating: 4.8,
    reviewsCount: 150,
    stock: 200,
    specs: {
      'Warna': 'Merah',
      'Diameter': '5mm',
      'Forward Voltage': '1.8V - 2.2V'
    }
  }
];

export const MOCK_REVIEWS: Record<string, Review[]> = MOCK_PRODUCTS.reduce((acc, product) => {
  acc[product.id] = [
    {
      id: `r1-${product.id}`,
      productId: product.id,
      author: 'Alex Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=1A1A2E&color=fff',
      rating: 5,
      comment: 'Absolutely love this product! The quality is outstanding and exactly as described.',
      date: '2023-11-15'
    },
    {
      id: `r2-${product.id}`,
      productId: product.id,
      author: 'Sarah Chen',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=1A1A2E&color=fff',
      rating: 4,
      comment: 'Really good, but delivery took a bit longer than expected. Overall satisfied.',
      date: '2023-10-02'
    }
  ];
  return acc;
}, {} as Record<string, Review[]>);

export const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ORD-84AD2',
    date: '2023-12-05',
    status: 'Delivered',
    total: 334.00,
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 1 },
      { product: MOCK_PRODUCTS[4], quantity: 1 }
    ],
    shipping: {
      fullName: 'John Doe',
      address: '123 Fake Street',
      city: 'Seattle',
      postalCode: '98109'
    }
  },
  {
    id: 'ORD-9B561',
    date: '2024-01-12',
    status: 'Processing',
    total: 1299.00,
    items: [
      { product: MOCK_PRODUCTS[1], quantity: 1 }
    ],
    shipping: {
      fullName: 'John Doe',
      address: '123 Fake Street',
      city: 'Seattle',
      postalCode: '98109'
    }
  }
];

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer'
  },
  {
    id: 'u2',
    name: 'Admin User',
    email: 'admin@electroshop.com',
    role: 'admin'
  }
];
