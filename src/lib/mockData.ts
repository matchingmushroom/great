// Type Definitions and Mock Data Seed for Great Pickle Taste (GPT)

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  amountPaid: number;
  balanceDue: number;
  saleDate: number;
  recordedBy: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  vendorName: string;
  vendorPhone: string;
  items: {
    name: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  total: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  amountPaid: number;
  balanceDue: number;
  purchaseDate: number;
  recordedBy: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Raw Materials' | 'Packaging' | 'Rent' | 'Salaries' | 'Utilities' | 'Marketing' | 'Other';
  date: number;
  description: string;
  recordedBy: string;
}

export interface Debtor {
  id: string;
  customerName: string;
  customerPhone: string;
  totalDebt: number;
  payments: {
    amount: number;
    date: number;
    notes: string;
  }[];
  lastUpdated: number;
}

export interface Creditor {
  id: string;
  vendorName: string;
  vendorPhone: string;
  totalCredit: number;
  payments: {
    amount: number;
    date: number;
    notes: string;
  }[];
  lastUpdated: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Staff' | 'Manager' | 'Admin';
  salary: number;
  joinDate: number;
  status: 'Active' | 'Inactive';
  advances: {
    amount: number;
    date: number;
    reason: string;
  }[];
  attendance: {
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
  }[];
}

export interface DashboardUser {
  uid: string;
  name: string;
  email: string;
  role: 'Staff' | 'Manager' | 'Admin';
  isActive: boolean;
  createdAt: number;
}

// SEED MOCK DATA
export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Spicy Mango Pickle (Achar)',
    description: 'Authentic Nepalese style green mango pickle infused with mustard seeds, fenugreek, and aromatic spices. Perfectly spicy and tangy.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    category: 'Mango',
    stockQuantity: 45,
    minStockLevel: 10,
    isActive: true,
    createdAt: Date.now() - 30 * 86400000
  },
  {
    id: 'prod-2',
    name: 'Hot Garlic Pickle',
    description: 'Peeled garlic cloves cooked in cold-pressed mustard oil with red chili, turmeric, and local Himalayan spices. Bold flavor profile.',
    price: 400,
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&auto=format&fit=crop&q=80',
    category: 'Garlic',
    stockQuantity: 8, // Low stock warning trigger
    minStockLevel: 10,
    isActive: true,
    createdAt: Date.now() - 25 * 86400000
  },
  {
    id: 'prod-3',
    name: 'Tangy Lapsi Pickle',
    description: 'Made from fresh Nepalese hog plum (Lapsi), cooked with brown sugar, chili, and spices. Delightfully sweet, sour, and spicy.',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1544510807-2bc49009a052?w=600&auto=format&fit=crop&q=80',
    category: 'Lapsi',
    stockQuantity: 28,
    minStockLevel: 5,
    isActive: true,
    createdAt: Date.now() - 20 * 86400000
  },
  {
    id: 'prod-4',
    name: 'Fiery Akabare Chili Pickle',
    description: 'Extremely hot and flavorful round Akabare chilies preserved in lemon juice and salt. A staple for spicy food lovers.',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    category: 'Chilli',
    stockQuantity: 15,
    minStockLevel: 5,
    isActive: true,
    createdAt: Date.now() - 15 * 86400000
  },
  {
    id: 'prod-5',
    name: 'Mixed Vegetable Pickle',
    description: 'Crisp carrots, cauliflower, radish, and green peas marinated in a rich mustard paste. A versatile side dish.',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
    category: 'Mixed',
    stockQuantity: 50,
    minStockLevel: 10,
    isActive: true,
    createdAt: Date.now() - 10 * 86400000
  }
];

export const initialUsers: DashboardUser[] = [
  {
    uid: 'user-admin',
    name: 'Raju Sharma',
    email: 'admin@gpt.com',
    role: 'Admin',
    isActive: true,
    createdAt: Date.now() - 100 * 86400000
  },
  {
    uid: 'user-manager',
    name: 'Sita Thapa',
    email: 'manager@gpt.com',
    role: 'Manager',
    isActive: true,
    createdAt: Date.now() - 50 * 86400000
  },
  {
    uid: 'user-staff',
    name: 'Milan Shrestha',
    email: 'staff@gpt.com',
    role: 'Staff',
    isActive: true,
    createdAt: Date.now() - 20 * 86400000
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'GPT-SALE-1001',
    customerName: 'Aashish Adhikari',
    customerPhone: '9841234567',
    items: [
      { productId: 'prod-1', name: 'Spicy Mango Pickle (Achar)', price: 350, quantity: 2, total: 700 },
      { productId: 'prod-2', name: 'Hot Garlic Pickle', price: 400, quantity: 1, total: 400 }
    ],
    subtotal: 1100,
    discount: 50,
    total: 1050,
    paymentStatus: 'Paid',
    amountPaid: 1050,
    balanceDue: 0,
    saleDate: Date.now() - 5 * 86400000,
    recordedBy: 'staff@gpt.com'
  },
  {
    id: 'sale-2',
    invoiceNumber: 'GPT-SALE-1002',
    customerName: 'Pooja Karki',
    customerPhone: '9851122334',
    items: [
      { productId: 'prod-3', name: 'Tangy Lapsi Pickle', price: 320, quantity: 3, total: 960 },
      { productId: 'prod-5', name: 'Mixed Vegetable Pickle', price: 300, quantity: 2, total: 600 }
    ],
    subtotal: 1560,
    discount: 60,
    total: 1500,
    paymentStatus: 'Partially Paid',
    amountPaid: 1000,
    balanceDue: 500,
    saleDate: Date.now() - 3 * 86400000,
    recordedBy: 'manager@gpt.com'
  },
  {
    id: 'sale-3',
    invoiceNumber: 'GPT-SALE-1003',
    customerName: 'Binod Tamang',
    customerPhone: '9813998877',
    items: [
      { productId: 'prod-4', name: 'Fiery Akabare Chili Pickle', price: 450, quantity: 4, total: 1800 }
    ],
    subtotal: 1800,
    discount: 0,
    total: 1800,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    balanceDue: 1800,
    saleDate: Date.now() - 1 * 86400000,
    recordedBy: 'staff@gpt.com'
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'GPT-PUR-1001',
    vendorName: 'Janakpur Farm Wholesale',
    vendorPhone: '9844112233',
    items: [
      { name: 'Raw Green Mangoes (KG)', unitPrice: 80, quantity: 100, total: 8000 },
      { name: 'Cold Pressed Mustard Oil (Ltr)', unitPrice: 240, quantity: 50, total: 12000 }
    ],
    total: 20000,
    paymentStatus: 'Paid',
    amountPaid: 20000,
    balanceDue: 0,
    purchaseDate: Date.now() - 15 * 86400000,
    recordedBy: 'manager@gpt.com'
  },
  {
    id: 'pur-2',
    purchaseNumber: 'GPT-PUR-1002',
    vendorName: 'Bhaktapur Glass Factory',
    vendorPhone: '9803322114',
    items: [
      { name: 'Glass Jars 500ml (Pcs)', unitPrice: 35, quantity: 500, total: 17500 }
    ],
    total: 17500,
    paymentStatus: 'Partially Paid',
    amountPaid: 10000,
    balanceDue: 7500,
    purchaseDate: Date.now() - 8 * 86400000,
    recordedBy: 'admin@gpt.com'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Packaging Labels Printing',
    amount: 4500,
    category: 'Packaging',
    date: Date.now() - 12 * 86400000,
    description: 'Printed 1000 adhesive design labels for pickle bottles.',
    recordedBy: 'manager@gpt.com'
  },
  {
    id: 'exp-2',
    title: 'Electricity & Water Bill (May)',
    amount: 6200,
    category: 'Utilities',
    date: Date.now() - 10 * 86400000,
    description: 'Factory and office utility payments.',
    recordedBy: 'manager@gpt.com'
  },
  {
    id: 'exp-3',
    title: 'Purchase of Spices (Salt, Fenugreek, Turmeric)',
    amount: 8500,
    category: 'Raw Materials',
    date: Date.now() - 6 * 86400000,
    description: 'Bought spices in bulk from Asan market.',
    recordedBy: 'staff@gpt.com'
  },
  {
    id: 'exp-4',
    title: 'Rent for Kitchen Space',
    amount: 25000,
    category: 'Rent',
    date: Date.now() - 14 * 86400000,
    description: 'Monthly rent for the primary production kitchen.',
    recordedBy: 'admin@gpt.com'
  }
];

export const initialDebtors: Debtor[] = [
  {
    id: '9851122334',
    customerName: 'Pooja Karki',
    customerPhone: '9851122334',
    totalDebt: 500,
    payments: [
      { amount: 500, date: Date.now() - 2 * 86400000, notes: 'Paid partial for invoice GPT-SALE-1002' }
    ],
    lastUpdated: Date.now() - 2 * 86400000
  },
  {
    id: '9813998877',
    customerName: 'Binod Tamang',
    customerPhone: '9813998877',
    totalDebt: 1800,
    payments: [],
    lastUpdated: Date.now() - 1 * 86400000
  }
];

export const initialCreditors: Creditor[] = [
  {
    id: '9803322114',
    vendorName: 'Bhaktapur Glass Factory',
    vendorPhone: '9803322114',
    totalCredit: 7500,
    payments: [],
    lastUpdated: Date.now() - 8 * 86400000
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'GPT-ORD-2001',
    customerName: 'Niranjan Sen',
    customerPhone: '9841889900',
    deliveryAddress: 'Jwagal, Lalitpur (Near Kopundol)',
    notes: 'Please pack carefully. Ring bell upon arrival.',
    items: [
      { productId: 'prod-1', name: 'Spicy Mango Pickle (Achar)', price: 350, quantity: 2, total: 700 },
      { productId: 'prod-3', name: 'Tangy Lapsi Pickle', price: 320, quantity: 1, total: 320 }
    ],
    total: 1020,
    status: 'Pending',
    createdAt: Date.now() - 2 * 3600000 // 2 hours ago
  },
  {
    id: 'ord-2',
    orderNumber: 'GPT-ORD-2002',
    customerName: 'Sabina KC',
    customerPhone: '9851034455',
    deliveryAddress: 'Mid-Baneshwor, Kathmandu',
    notes: 'Need extra hot chili if possible.',
    items: [
      { productId: 'prod-4', name: 'Fiery Akabare Chili Pickle', price: 450, quantity: 2, total: 900 }
    ],
    total: 900,
    status: 'Confirmed',
    createdAt: Date.now() - 18 * 3600000 // 18 hours ago
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Milan Shrestha',
    email: 'staff@gpt.com',
    phone: '9841334455',
    role: 'Staff',
    salary: 22000,
    joinDate: Date.now() - 120 * 86400000,
    status: 'Active',
    advances: [
      { amount: 3000, date: Date.now() - 10 * 86400000, reason: 'Dashain Festival Shopping' }
    ],
    attendance: [
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-13', status: 'Present' },
      { date: '2026-06-14', status: 'Leave' },
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-16', status: 'Present' }
    ]
  },
  {
    id: 'emp-2',
    name: 'Sita Thapa',
    email: 'manager@gpt.com',
    phone: '9813556677',
    role: 'Manager',
    salary: 35000,
    joinDate: Date.now() - 200 * 86400000,
    status: 'Active',
    advances: [],
    attendance: [
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-13', status: 'Present' },
      { date: '2026-06-14', status: 'Present' },
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-16', status: 'Present' }
    ]
  },
  {
    id: 'emp-3',
    name: 'Gopal Bahadur',
    email: 'gopal@gpt.com',
    phone: '9808990011',
    role: 'Staff',
    salary: 18000,
    joinDate: Date.now() - 45 * 86400000,
    status: 'Active',
    advances: [],
    attendance: [
      { date: '2026-06-12', status: 'Present' },
      { date: '2026-06-13', status: 'Absent' },
      { date: '2026-06-14', status: 'Present' },
      { date: '2026-06-15', status: 'Present' },
      { date: '2026-06-16', status: 'Present' }
    ]
  }
];
