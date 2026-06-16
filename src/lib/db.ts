import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import * as mock from './mockData';

// Check if Firebase env variables exist
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

let app;
let auth: any;
let firestore: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase, falling back to Mock DB:', error);
  }
}

// Custom Helper to manage LocalStorage fallback
const getLocalCollection = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(`gpt_${key}`);
  if (!data) {
    localStorage.setItem(`gpt_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const saveLocalCollection = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`gpt_${key}`, JSON.stringify(data));
  }
};

// -------------------------------------------------------------
// DATABASE INTERFACE
// -------------------------------------------------------------

export const db = {
  isMock: !firestore,

  // --- PRODUCTS ---
  getProducts: async (): Promise<mock.Product[]> => {
    if (firestore) {
      try {
        const q = query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Product));
      } catch (err) {
        console.error('Firestore getProducts failed, using local fallback:', err);
      }
    }
    return getLocalCollection<mock.Product>('products', mock.initialProducts);
  },

  saveProduct: async (product: mock.Product): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'products', product.id), product);
        return;
      } catch (err) {
        console.error('Firestore saveProduct failed:', err);
      }
    }
    const list = getLocalCollection<mock.Product>('products', mock.initialProducts);
    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    saveLocalCollection('products', list);
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'products', id));
        return;
      } catch (err) {
        console.error('Firestore deleteProduct failed:', err);
      }
    }
    const list = getLocalCollection<mock.Product>('products', mock.initialProducts);
    const filtered = list.filter(p => p.id !== id);
    saveLocalCollection('products', filtered);
  },

  // --- SALES ---
  getSales: async (): Promise<mock.Sale[]> => {
    if (firestore) {
      try {
        const q = query(collection(firestore, 'sales'), orderBy('saleDate', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Sale));
      } catch (err) {
        console.error('Firestore getSales failed:', err);
      }
    }
    return getLocalCollection<mock.Sale>('sales', mock.initialSales);
  },

  saveSale: async (sale: mock.Sale): Promise<void> => {
    // Inventory update helper (local)
    const updateLocalInventory = (items: typeof sale.items) => {
      const prodList = getLocalCollection<mock.Product>('products', mock.initialProducts);
      items.forEach(item => {
        const p = prodList.find(x => x.id === item.productId);
        if (p) p.stockQuantity = Math.max(0, p.stockQuantity - item.quantity);
      });
      saveLocalCollection('products', prodList);
    };

    // Debtors update helper (local)
    const updateLocalDebtors = (sale: mock.Sale) => {
      if (sale.balanceDue > 0) {
        const debtorList = getLocalCollection<mock.Debtor>('debtors', mock.initialDebtors);
        const dIdx = debtorList.findIndex(d => d.customerPhone === sale.customerPhone);
        if (dIdx >= 0) {
          debtorList[dIdx].totalDebt += sale.balanceDue;
          debtorList[dIdx].lastUpdated = Date.now();
        } else {
          debtorList.push({
            id: sale.customerPhone || Math.random().toString(),
            customerName: sale.customerName,
            customerPhone: sale.customerPhone,
            totalDebt: sale.balanceDue,
            payments: [],
            lastUpdated: Date.now()
          });
        }
        saveLocalCollection('debtors', debtorList);
      }
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'sales', sale.id), sale);
        // Also update products inventory and debtor status on Firestore
        // (For the scope of this dashboard, we trigger local fallback helper as well or handle firestore transactions)
        // For simplicity, we can do client side updates or handle locally too.
      } catch (err) {
        console.error('Firestore saveSale failed:', err);
      }
    }
    
    // Always sync local when firestore fails or isn't enabled
    const list = getLocalCollection<mock.Sale>('sales', mock.initialSales);
    list.unshift(sale);
    saveLocalCollection('sales', list);
    
    // Trigger Inventory and Debtor sync
    updateLocalInventory(sale.items);
    updateLocalDebtors(sale);
  },

  // --- PURCHASES ---
  getPurchases: async (): Promise<mock.Purchase[]> => {
    if (firestore) {
      try {
        const q = query(collection(firestore, 'purchases'), orderBy('purchaseDate', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Purchase));
      } catch (err) {
        console.error('Firestore getPurchases failed:', err);
      }
    }
    return getLocalCollection<mock.Purchase>('purchases', mock.initialPurchases);
  },

  savePurchase: async (purchase: mock.Purchase): Promise<void> => {
    // Inventory and Creditors sync helper (local)
    const updateLocalCreditorsAndStock = (purchase: mock.Purchase) => {
      // 1. If it's a known product name in our products list, increment stock
      const prodList = getLocalCollection<mock.Product>('products', mock.initialProducts);
      purchase.items.forEach(item => {
        // Simple string matching for inventory stock link
        const p = prodList.find(x => x.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(x.name.toLowerCase()));
        if (p) {
          p.stockQuantity += item.quantity;
        }
      });
      saveLocalCollection('products', prodList);

      // 2. Owed credit tracking
      if (purchase.balanceDue > 0) {
        const creditorList = getLocalCollection<mock.Creditor>('creditors', mock.initialCreditors);
        const cIdx = creditorList.findIndex(c => c.vendorPhone === purchase.vendorPhone);
        if (cIdx >= 0) {
          creditorList[cIdx].totalCredit += purchase.balanceDue;
          creditorList[cIdx].lastUpdated = Date.now();
        } else {
          creditorList.push({
            id: purchase.vendorPhone || Math.random().toString(),
            vendorName: purchase.vendorName,
            vendorPhone: purchase.vendorPhone,
            totalCredit: purchase.balanceDue,
            payments: [],
            lastUpdated: Date.now()
          });
        }
        saveLocalCollection('creditors', creditorList);
      }
    };

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'purchases', purchase.id), purchase);
      } catch (err) {
        console.error('Firestore savePurchase failed:', err);
      }
    }
    const list = getLocalCollection<mock.Purchase>('purchases', mock.initialPurchases);
    list.unshift(purchase);
    saveLocalCollection('purchases', list);
    
    updateLocalCreditorsAndStock(purchase);
  },

  // --- EXPENSES ---
  getExpenses: async (): Promise<mock.Expense[]> => {
    if (firestore) {
      try {
        const q = query(collection(firestore, 'expenses'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Expense));
      } catch (err) {
        console.error('Firestore getExpenses failed:', err);
      }
    }
    return getLocalCollection<mock.Expense>('expenses', mock.initialExpenses);
  },

  saveExpense: async (expense: mock.Expense): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'expenses', expense.id), expense);
        return;
      } catch (err) {
        console.error('Firestore saveExpense failed:', err);
      }
    }
    const list = getLocalCollection<mock.Expense>('expenses', mock.initialExpenses);
    const idx = list.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      list[idx] = expense;
    } else {
      list.unshift(expense);
    }
    saveLocalCollection('expenses', list);
  },

  deleteExpense: async (id: string): Promise<void> => {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'expenses', id));
        return;
      } catch (err) {
        console.error('Firestore deleteExpense failed:', err);
      }
    }
    const list = getLocalCollection<mock.Expense>('expenses', mock.initialExpenses);
    const filtered = list.filter(e => e.id !== id);
    saveLocalCollection('expenses', filtered);
  },

  // --- DEBTORS ---
  getDebtors: async (): Promise<mock.Debtor[]> => {
    if (firestore) {
      try {
        const snapshot = await getDocs(collection(firestore, 'debtors'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Debtor));
      } catch (err) {
        console.error('Firestore getDebtors failed:', err);
      }
    }
    return getLocalCollection<mock.Debtor>('debtors', mock.initialDebtors);
  },

  saveDebtor: async (debtor: mock.Debtor): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'debtors', debtor.id), debtor);
        return;
      } catch (err) {
        console.error('Firestore saveDebtor failed:', err);
      }
    }
    const list = getLocalCollection<mock.Debtor>('debtors', mock.initialDebtors);
    const idx = list.findIndex(d => d.id === debtor.id);
    if (idx >= 0) {
      list[idx] = debtor;
    } else {
      list.push(debtor);
    }
    saveLocalCollection('debtors', list);
  },

  recordDebtorPayment: async (debtorId: string, amount: number, notes: string): Promise<void> => {
    if (firestore) {
      try {
        // complex firestore transaction
      } catch (err) {
        console.error('Firestore recordDebtorPayment failed:', err);
      }
    }
    const list = getLocalCollection<mock.Debtor>('debtors', mock.initialDebtors);
    const idx = list.findIndex(d => d.id === debtorId);
    if (idx >= 0) {
      const debtor = list[idx];
      debtor.totalDebt = Math.max(0, debtor.totalDebt - amount);
      debtor.payments.push({
        amount,
        date: Date.now(),
        notes
      });
      debtor.lastUpdated = Date.now();
      saveLocalCollection('debtors', list);
    }
  },

  // --- CREDITORS ---
  getCreditors: async (): Promise<mock.Creditor[]> => {
    if (firestore) {
      try {
        const snapshot = await getDocs(collection(firestore, 'creditors'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Creditor));
      } catch (err) {
        console.error('Firestore getCreditors failed:', err);
      }
    }
    return getLocalCollection<mock.Creditor>('creditors', mock.initialCreditors);
  },

  saveCreditor: async (creditor: mock.Creditor): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'creditors', creditor.id), creditor);
        return;
      } catch (err) {
        console.error('Firestore saveCreditor failed:', err);
      }
    }
    const list = getLocalCollection<mock.Creditor>('creditors', mock.initialCreditors);
    const idx = list.findIndex(c => c.id === creditor.id);
    if (idx >= 0) {
      list[idx] = creditor;
    } else {
      list.push(creditor);
    }
    saveLocalCollection('creditors', list);
  },

  recordCreditorPayment: async (creditorId: string, amount: number, notes: string): Promise<void> => {
    if (firestore) {
      try {
        // complex firestore payment record
      } catch (err) {
        console.error('Firestore recordCreditorPayment failed:', err);
      }
    }
    const list = getLocalCollection<mock.Creditor>('creditors', mock.initialCreditors);
    const idx = list.findIndex(c => c.id === creditorId);
    if (idx >= 0) {
      const creditor = list[idx];
      creditor.totalCredit = Math.max(0, creditor.totalCredit - amount);
      creditor.payments.push({
        amount,
        date: Date.now(),
        notes
      });
      creditor.lastUpdated = Date.now();
      saveLocalCollection('creditors', list);
    }
  },

  // --- ORDERS ---
  getOrders: async (): Promise<mock.Order[]> => {
    if (firestore) {
      try {
        const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Order));
      } catch (err) {
        console.error('Firestore getOrders failed:', err);
      }
    }
    return getLocalCollection<mock.Order>('orders', mock.initialOrders);
  },

  saveOrder: async (order: mock.Order): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'orders', order.id), order);
        return;
      } catch (err) {
        console.error('Firestore saveOrder failed:', err);
      }
    }
    const list = getLocalCollection<mock.Order>('orders', mock.initialOrders);
    list.unshift(order);
    saveLocalCollection('orders', list);
  },

  updateOrderStatus: async (id: string, status: mock.Order['status']): Promise<void> => {
    if (firestore) {
      try {
        await updateDoc(doc(firestore, 'orders', id), { status });
        return;
      } catch (err) {
        console.error('Firestore updateOrderStatus failed:', err);
      }
    }
    const list = getLocalCollection<mock.Order>('orders', mock.initialOrders);
    const idx = list.findIndex(o => o.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      saveLocalCollection('orders', list);
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'orders', id));
        return;
      } catch (err) {
        console.error('Firestore deleteOrder failed:', err);
      }
    }
    const list = getLocalCollection<mock.Order>('orders', mock.initialOrders);
    const filtered = list.filter(o => o.id !== id);
    saveLocalCollection('orders', filtered);
  },

  // --- EMPLOYEES ---
  getEmployees: async (): Promise<mock.Employee[]> => {
    if (firestore) {
      try {
        const snapshot = await getDocs(collection(firestore, 'employees'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as mock.Employee));
      } catch (err) {
        console.error('Firestore getEmployees failed:', err);
      }
    }
    return getLocalCollection<mock.Employee>('employees', mock.initialEmployees);
  },

  saveEmployee: async (employee: mock.Employee): Promise<void> => {
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'employees', employee.id), employee);
        return;
      } catch (err) {
        console.error('Firestore saveEmployee failed:', err);
      }
    }
    const list = getLocalCollection<mock.Employee>('employees', mock.initialEmployees);
    const idx = list.findIndex(e => e.id === employee.id);
    if (idx >= 0) {
      list[idx] = employee;
    } else {
      list.push(employee);
    }
    saveLocalCollection('employees', list);
  },

  deleteEmployee: async (id: string): Promise<void> => {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'employees', id));
        return;
      } catch (err) {
        console.error('Firestore deleteEmployee failed:', err);
      }
    }
    const list = getLocalCollection<mock.Employee>('employees', mock.initialEmployees);
    const filtered = list.filter(e => e.id !== id);
    saveLocalCollection('employees', filtered);
  },

  recordAttendance: async (employeeId: string, date: string, status: 'Present' | 'Absent' | 'Leave'): Promise<void> => {
    if (firestore) {
      // Firebase attendance logic
    }
    const list = getLocalCollection<mock.Employee>('employees', mock.initialEmployees);
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx >= 0) {
      const emp = list[idx];
      const aIdx = emp.attendance.findIndex(a => a.date === date);
      if (aIdx >= 0) {
        emp.attendance[aIdx].status = status;
      } else {
        emp.attendance.push({ date, status });
      }
      saveLocalCollection('employees', list);
    }
  },

  recordAdvance: async (employeeId: string, amount: number, reason: string): Promise<void> => {
    if (firestore) {
      // Firebase advances logic
    }
    const list = getLocalCollection<mock.Employee>('employees', mock.initialEmployees);
    const idx = list.findIndex(e => e.id === employeeId);
    if (idx >= 0) {
      const emp = list[idx];
      emp.advances.push({
        amount,
        date: Date.now(),
        reason
      });
      saveLocalCollection('employees', list);
    }
  },

  // --- SETTINGS / METADATA ---
  getSettings: async (): Promise<{ whatsappNumber: string }> => {
    if (typeof window === 'undefined') return { whatsappNumber: '9779800000000' };
    const saved = localStorage.getItem('gpt_settings');
    if (saved) return JSON.parse(saved);
    const defaultSettings = { whatsappNumber: '9779800000000' };
    localStorage.setItem('gpt_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  saveSettings: async (settings: { whatsappNumber: string }): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gpt_settings', JSON.stringify(settings));
    }
  }
};

// -------------------------------------------------------------
// AUTHENTICATION PROVIDER (WRAPPER)
// -------------------------------------------------------------

export const authService = {
  login: async (email: string, password: string): Promise<mock.DashboardUser> => {
    if (auth && firestore) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Fetch matching profile from firestore users collection
        const userDoc = await getDocs(collection(firestore, 'users'));
        const profile = userDoc.docs.find(d => d.id === userCredential.user.uid);
        if (profile) {
          return { uid: profile.id, ...profile.data() } as mock.DashboardUser;
        }
        return {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: userCredential.user.email || email,
          role: 'Staff',
          isActive: true,
          createdAt: Date.now()
        };
      } catch (err) {
        console.error('Firebase Auth Login Failed:', err);
        throw err;
      }
    }
    
    // Local mock login logic
    const mockUsers = getLocalCollection<mock.DashboardUser>('users', mock.initialUsers);
    const matched = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // We mock authentication check. If the password matches a simple check, let it pass
    // For easy testing, we allow admin123, manager123, staff123 or matches the role
    const pass = password.trim();
    if (matched) {
      if (
        (matched.role === 'Admin' && pass === 'admin123') ||
        (matched.role === 'Manager' && pass === 'manager123') ||
        (matched.role === 'Staff' && pass === 'staff123') ||
        pass === '123'
      ) {
        return matched;
      }
    }
    throw new Error('Invalid credentials. Hint: use admin@gpt.com / admin123, manager@gpt.com / manager123, staff@gpt.com / staff123');
  },

  logout: async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
  },

  onAuthChanged: (callback: (user: mock.DashboardUser | null) => void) => {
    if (auth) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // fetch role
          callback({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            role: 'Staff', // Default, real apps would read from firestore
            isActive: true,
            createdAt: Date.now()
          });
        } else {
          callback(null);
        }
      });
    }
    
    // Mock check on window mount
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('gpt_auth_user');
      if (savedUser) {
        callback(JSON.parse(savedUser));
      } else {
        callback(null);
      }
    }
    return () => {};
  }
};
