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

export type Salesman = {
  id: string;
  name: string;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  date: string;
  salesmanName: string;
  customerName:string;
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

export type AppUser = {
  uid: string;
  email: string | null;
  createdAt: Date;
}
