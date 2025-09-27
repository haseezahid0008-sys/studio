

export type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  reorderLevel: number;
  expiryDate?: string;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  date: string;
  salesmanId: string;
  salesmanName: string;
  customerName:string;
  customerPhone: string;
  customerAddress: string;
  items: SaleItem[];
  discount: number;
  total: number;
  amountPaid: number;
};

export type Expense = {
    id: string;
    date: string;
    category: 'Fuel' | 'Rent' | 'Salaries' | 'Packing' | 'Food' | 'Miscellaneous';
    amount: number;
    notes?: string;
}

export const ROLES = ['Admin', 'Manager', 'Salesman', 'Worker', 'Cashier'] as const;
export type Role = (typeof ROLES)[number];

export type AppUser = {
  uid: string;
  email: string | null;
  name: string;
  createdAt: Date;
  role?: Role;
}

export type AppSettings = {
    appName: string;
    logoLight: string;
    logoDark: string;
    authLogoLight: string;
    authLogoDark: string;
    favicon: string;
    currency: 'pkr' | 'usd' | 'eur';
    signupVisible: boolean;
}

export type Assignment = {
    id: string;
    salesmanId: string;
    salesmanName: string;
    todayLocation: string;
    tomorrowLocation: string;
    itemsToTake?: string;
    createdAt: string;
    status: 'Pending' | 'Visited';
    progressNotes?: string;
}

export type WorkerTask = {
    id: string;
    workerId: string;
    workerName: string;
    taskDescription: string;
    createdAt: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    progressNotes?: string;
}
