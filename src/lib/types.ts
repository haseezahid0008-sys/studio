

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
  customerId: string;
  customerName: string;
  items: SaleItem[];
  discount: number;
  total: number;
  amountPaid: number;
  shopImageURL?: string;
};

export type Payment = {
    id: string;
    saleId: string;
    amount: number;
    date: string;
    recordedById: string;
    recordedByName: string;
}

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

export type Customer = {
    id: string;
    name: string;
    phone: string;
    address: string;
    salesmanId: string;
    totalDue: number;
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
    location: string;
    itemsToTake?: string;
    createdAt: string;
    status: 'Pending' | 'Visited';
    progressNotes?: string;
    assignedById: string;
    assignedByName: string;
}

export type WorkerTask = {
    id: string;
    workerId: string;
    workerName: string;
    taskDescription: string;
    createdAt: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Expired';
    progressNotes?: string;
}
