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

export const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Audio', 'Accessories'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'X-Pro Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation, wireless Bluetooth 5.2, and up to 30 hours of battery life. Experience crystal clear sound in any environment.',
    price: 299.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
    ],
    rating: 4.8,
    reviewsCount: 324,
    stock: 45,
    specs: {
      'Form Factor': 'Over Ear',
      'Connectivity': 'Bluetooth 5.2, Wired',
      'Battery Life': '30 Hours',
      'Weight': '250g'
    }
  },
  {
    id: 'p2',
    name: 'ZenBook Ultra 14"',
    description: 'Ultra-slim lightweight laptop featuring a stunning OLED display, 16GB RAM, and a powerful M2 equivalent processor. Perfect for creators and professionals on the go.',
    price: 1299.00,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1531297122539-df3f53081220?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1531297122539-df3f53081220?w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 156,
    stock: 12,
    specs: {
      'Screen Size': '14.2 inches OLED',
      'Processor': 'Octa-core Ultra',
      'RAM': '16GB LPDDR5',
      'Storage': '512GB NVMe SSD'
    }
  },
  {
    id: 'p3',
    name: 'Quantum Phone Pro',
    description: 'The ultimate smartphone experience. Featuring a 120Hz LTPO display, 50MP triple camera system, and all-day battery life.',
    price: 899.00,
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80'
    ],
    rating: 4.7,
    reviewsCount: 892,
    stock: 124,
    specs: {
      'Display': '6.7" OLED 120Hz',
      'Camera': '50MP + 12MP + 10MP',
      'Battery': '4500mAh',
      'OS': 'Android 14'
    }
  },
  {
    id: 'p4',
    name: 'Aero Wireless Earbuds',
    description: 'Compact, comfortable, and powerful wireless earbuds with active noise cancellation and transparency mode.',
    price: 149.00,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&q=80'
    ],
    rating: 4.5,
    reviewsCount: 420,
    stock: 80,
    specs: {
      'Type': 'In-ear',
      'Connectivity': 'Bluetooth 5.3',
      'Battery': 'Up to 24h with case',
      'Water Resistance': 'IPX4'
    }
  },
  {
    id: 'p5',
    name: 'Minimalist Desk Mat',
    description: 'Premium vegan leather desk mat. Protects your desk while providing a smooth tracking surface for your mouse.',
    price: 35.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80'
    ],
    rating: 4.9,
    reviewsCount: 128,
    stock: 200,
    specs: {
      'Material': 'Vegan Leather',
      'Dimensions': '80cm x 40cm',
      'Color': 'Matte Black'
    }
  },
  {
    id: 'p6',
    name: 'Thunderbolt 4 Dock',
    description: 'Expand your connectivity with this 11-in-1 Thunderbolt 4 dock. Supports dual 4K monitors and 96W power delivery.',
    price: 249.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1662916664972-7473b64bc284?w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1662916664972-7473b64bc284?w=800&q=80'
    ],
    rating: 4.6,
    reviewsCount: 84,
    stock: 35,
    specs: {
      'Ports': '3x Thunderbolt 4, 4x USB-A, SD Card, Ethernet, Audio',
      'Power': '96W PD Charging',
      'Display': 'Up to 2x 4K @ 60Hz'
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
