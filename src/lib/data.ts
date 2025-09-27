import type { Product, Salesman, Sale, Expense } from './types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Soap',
    sku: 'JS-SOAP-01',
    unit: 'piece',
    costPrice: 0.5,
    salePrice: 1.0,
    stock: 120,
    reorderLevel: 50,
  },
  {
    id: 'prod-002',
    name: 'Snow Powder',
    sku: 'JS-SNOW-01',
    unit: 'kg',
    costPrice: 2.0,
    salePrice: 3.5,
    stock: 80,
    reorderLevel: 30,
  },
  {
    id: 'prod-003',
    name: 'Bleach',
    sku: 'JS-BLCH-01',
    unit: 'liter',
    costPrice: 1.5,
    salePrice: 2.75,
    stock: 45,
    reorderLevel: 20,
  },
  {
    id: 'prod-004',
    name: 'Kampre (Laundry Powder)',
    sku: 'JS-KMPR-01',
    unit: 'kg',
    costPrice: 3.0,
    salePrice: 5.0,
    stock: 150,
    reorderLevel: 60,
  },
  {
    id: 'prod-005',
    name: 'Farniel (Toilet Cleaner)',
    sku: 'JS-FRNL-01',
    unit: 'bottle',
    costPrice: 1.2,
    salePrice: 2.5,
    stock: 70,
    reorderLevel: 25,
  },
];

export const salesmen: Salesman[] = [
  { id: 'sm-01', name: 'Ali Khan' },
  { id: 'sm-02', name: 'Bilal Ahmed' },
  { id: 'sm-03', name: 'Fahad Malik' },
];

export const sales: Sale[] = [
  {
    id: 'sale-001',
    date: '2024-07-28',
    salesmanName: 'Ali Khan',
    customerName: 'Super Mart',
    items: [
      { productId: 'prod-001', quantity: 50, unitPrice: 1.0 },
      { productId: 'prod-004', quantity: 20, unitPrice: 5.0 },
    ],
    discount: 5.0,
    total: 145.0,
    amountPaid: 145.0,
  },
  {
    id: 'sale-002',
    date: '2024-07-28',
    salesmanName: 'Bilal Ahmed',
    customerName: 'Corner Store',
    items: [{ productId: 'prod-002', quantity: 30, unitPrice: 3.5 }],
    discount: 0,
    total: 105.0,
    amountPaid: 50.0,
  },
  {
    id: 'sale-003',
    date: '2024-07-27',
    salesmanName: 'Ali Khan',
    customerName: 'Hyper Market',
    items: [
      { productId: 'prod-003', quantity: 10, unitPrice: 2.75 },
      { productId: 'prod-005', quantity: 15, unitPrice: 2.5 },
    ],
    discount: 2.5,
    total: 62.5,
    amountPaid: 62.5,
  },
  {
    id: 'sale-004',
    date: '2024-07-27',
    salesmanName: 'Fahad Malik',
    customerName: 'Quick Stop',
    items: [{ productId: 'prod-001', quantity: 100, unitPrice: 0.95 }],
    discount: 0,
    total: 95.0,
    amountPaid: 95.0,
  },
  {
    id: 'sale-005',
    date: '2024-07-26',
    salesmanName: 'Bilal Ahmed',
    customerName: 'Daily Needs',
    items: [
      { productId: 'prod-001', quantity: 20, unitPrice: 1.0 },
      { productId: 'prod-002', quantity: 10, unitPrice: 3.5 },
      { productId: 'prod-003', quantity: 5, unitPrice: 2.75 },
      { productId: 'prod-004', quantity: 8, unitPrice: 5.0 },
      { productId: 'prod-005', quantity: 12, unitPrice: 2.5 },
    ],
    discount: 10.0,
    total: 128.75,
    amountPaid: 100.0,
  },
];

export const expenses: Expense[] = [
    { id: 'exp-001', date: '2024-07-28', category: 'Fuel', amount: 50.0, notes: 'Van refueling' },
    { id: 'exp-002', date: '2024-07-28', category: 'Food', amount: 25.0, notes: 'Team lunch' },
    { id: 'exp-003', date: '2024-07-27', category: 'Salaries', amount: 1500.0, notes: 'Monthly salaries' },
    { id: 'exp-004', date: '2024-07-26', category: 'Packing', amount: 120.0, notes: 'New boxes' },
    { id: 'exp-005', date: '2024-07-25', category: 'Rent', amount: 1000.0, notes: 'Office rent' },
];
