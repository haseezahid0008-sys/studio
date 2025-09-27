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
import type { Product, Sale, Expense, Salesman, AppUser, AppSettings, Assignment } from './types';

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
            date: (data.date as Timestamp)?.toDate().toISOString().split('T')[0] // Convert timestamp to string
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
            date: (data.date as Timestamp)?.toDate().toISOString().split('T')[0] // Convert timestamp to string
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
    return await setDoc(userRef, user, { merge: true });
}

export const getUser = async (uid: string): Promise<AppUser | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppUser;
    }
    return null;
}


// App Settings functions
const settingsDocRef = doc(db, 'settings', 'appSettings');

let cachedSettings: AppSettings | null = null;

export const getAppSettings = async (forceRefresh = false): Promise<AppSettings> => {
    if (cachedSettings && !forceRefresh) {
        return cachedSettings;
    }

    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        cachedSettings = docSnap.data() as AppSettings;
        return cachedSettings;
    }
    // Return default settings if they don't exist
    const defaultSettings: AppSettings = {
        appName: 'GLOW',
        logoLight: 'https://iili.io/KYqQC1R.png',
        logoDark: 'https://iili.io/KYkW0NV.png',
        authLogoLight: 'https://iili.io/KYqQC1R.png',
        authLogoDark: 'https://iili.io/KYkW0NV.png',
        favicon: 'https://iili.io/KYqQC1R.png',
        currency: 'pkr',
        signupVisible: true,
    };
    cachedSettings = defaultSettings;
    return defaultSettings;
};

export const updateAppSettings = async (settings: Partial<AppSettings>) => {
    cachedSettings = null; // Invalidate cache
    return await setDoc(settingsDocRef, settings, { merge: true });
};

export const getCurrencySymbol = (currencyCode?: string): string => {
    switch (currencyCode) {
        case 'pkr': return '₨';
        case 'usd': return '$';
        case 'eur': return '€';
        default: return '$';
    }
}

// Assignments functions
const assignmentsCollection = collection(db, 'assignments');

export const getAssignments = async (): Promise<Assignment[]> => {
    const snapshot = await getDocs(assignmentsCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString()
        } as Assignment;
    });
};

export const addAssignment = async (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const assignmentWithTimestamp = {
        ...assignment,
        createdAt: Timestamp.now()
    }
  return await addDoc(assignmentsCollection, assignmentWithTimestamp);
};
