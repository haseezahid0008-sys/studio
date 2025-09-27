import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import type { Product, Sale, Expense, Salesman, AppUser } from './types';

// Product functions
const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  return await addDoc(productsCollection, product);
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  return await updateDoc(docRef, product);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  return await deleteDoc(docRef);
};

// Sales functions
const salesCollection = collection(db, 'sales');

export const getSales = async (): Promise<Sale[]> => {
    const snapshot = await getDocs(salesCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            date: (data.date as Timestamp).toDate().toISOString().split('T')[0] // Convert timestamp to string
        } as Sale
    });
};

export const addSale = async (sale: Omit<Sale, 'id'>) => {
    const saleWithTimestamp = {
        ...sale,
        date: Timestamp.fromDate(new Date(sale.date))
    }
  return await addDoc(salesCollection, saleWithTimestamp);
};


// Expenses functions
const expensesCollection = collection(db, 'expenses');

export const getExpenses = async (): Promise<Expense[]> => {
    const snapshot = await getDocs(expensesCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            date: (data.date as Timestamp).toDate().toISOString().split('T')[0] // Convert timestamp to string
        } as Expense
    });
};

export const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const expenseWithTimestamp = {
        ...expense,
        date: Timestamp.fromDate(new Date(expense.date))
    }
  return await addDoc(expensesCollection, expenseWithTimestamp);
};

// Salesmen functions
const salesmenCollection = collection(db, 'salesmen');

export const getSalesmen = async (): Promise<Salesman[]> => {
    const snapshot = await getDocs(salesmenCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Salesman));
};

// User functions
export const addUser = async (user: AppUser) => {
    const userRef = doc(db, 'users', user.uid);
    return await setDoc(userRef, user);
}
