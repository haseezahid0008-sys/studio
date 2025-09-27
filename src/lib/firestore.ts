

import { db, storage } from './firebase';
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
  orderBy,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product, Sale, Expense, AppUser, AppSettings, Assignment, WorkerTask, Customer, Payment } from './types';

// Image Upload function (Firebase Storage - kept for other potential uses)
export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};


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
    const productWithStock = {
        ...product,
        stock: product.stock || 0
    };
  return await addDoc(productsCollection, productWithStock);
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
const paymentsCollection = collection(db, 'payments');

export const getSales = async (): Promise<Sale[]> => {
    const snapshot = await getDocs(query(salesCollection, orderBy('date', 'desc')));
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            date: (data.date as Timestamp)?.toDate().toISOString().split('T')[0] // Convert timestamp to string
        } as Sale
    });
};

export const getSalesByCustomer = async (customerId: string): Promise<Sale[]> => {
    const q = query(salesCollection, where("customerId", "==", customerId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            date: (data.date as Timestamp)?.toDate().toISOString().split('T')[0]
        } as Sale
    });
}

export const addSale = async (sale: Omit<Sale, 'id' | 'salesmanName' | 'customerName'>, salesmanId: string) => {
    return await runTransaction(db, async (transaction) => {
        // 1. Get Salesman and Customer Info
        const salesmanDoc = await getUser(salesmanId);
        const salesmanName = salesmanDoc?.name || salesmanDoc?.email || 'N/A';
        const customerRef = doc(db, 'customers', sale.customerId);
        const customerSnap = await transaction.get(customerRef);
        if (!customerSnap.exists()) {
            throw new Error("Customer not found!");
        }
        const customerName = customerSnap.data().name;
        const customerPhone = customerSnap.data().phone;


        // 2. Prepare Sale Document
        const newSaleRef = doc(salesCollection);
        const saleWithTimestamp = {
            ...sale,
            salesmanId,
            salesmanName,
            customerName,
            customerPhone,
            date: Timestamp.fromDate(new Date(sale.date)),
        };
        transaction.set(newSaleRef, saleWithTimestamp);

        // 3. Update stock for each item in the sale
        for (const item of sale.items) {
            if (item.productId && item.quantity > 0) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);

                if (productDoc.exists()) {
                    const currentStock = productDoc.data().stock as number;
                    const newStock = currentStock - item.quantity;
                    transaction.update(productRef, { stock: newStock });
                } else {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }
            }
        }
        
        // 4. Update customer's total due amount
        const pendingAmount = sale.total - sale.amountPaid;
        if (pendingAmount !== 0) {
            const currentDue = customerSnap.data().totalDue || 0;
            transaction.update(customerRef, { totalDue: currentDue + pendingAmount });
        }

        // 5. If initial payment exists, add it to payments collection
        if (sale.amountPaid > 0) {
            const newPaymentRef = doc(paymentsCollection);
            transaction.set(newPaymentRef, {
                saleId: newSaleRef.id,
                amount: sale.amountPaid,
                date: Timestamp.fromDate(new Date(sale.date)),
                recordedById: salesmanId,
                recordedByName: salesmanName,
            });
        }
        
        return newSaleRef;
    });
};

export const getPaymentsForSale = async (saleId: string): Promise<Payment[]> => {
    const q = query(paymentsCollection, where("saleId", "==", saleId), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp)?.toDate().toISOString().split('T')[0]
        } as Payment;
    });
};

export const addPayment = async (paymentData: Omit<Payment, 'id' | 'date'>) => {
    return await runTransaction(db, async (transaction) => {
        const { saleId, amount, recordedById, recordedByName } = paymentData;

        // 1. Get Sale and Customer
        const saleRef = doc(db, 'sales', saleId);
        const saleSnap = await transaction.get(saleRef);
        if (!saleSnap.exists()) throw new Error("Sale not found");
        const sale = saleSnap.data() as Sale;

        const customerRef = doc(db, 'customers', sale.customerId);
        const customerSnap = await transaction.get(customerRef);
        if (!customerSnap.exists()) throw new Error("Customer not found");
        
        // 2. Add payment record
        const newPaymentRef = doc(paymentsCollection);
        const paymentWithTimestamp = {
            ...paymentData,
            date: Timestamp.now(),
        }
        transaction.set(newPaymentRef, paymentWithTimestamp);

        // 3. Update sale's amountPaid
        const newAmountPaid = (sale.amountPaid || 0) + amount;
        transaction.update(saleRef, { amountPaid: newAmountPaid });

        // 4. Update customer's totalDue
        const currentDue = customerSnap.data().totalDue || 0;
        transaction.update(customerRef, { totalDue: currentDue - amount });

        return newPaymentRef;
    });
}


// Expenses functions
const expensesCollection = collection(db, 'expenses');

export const getExpenses = async (): Promise<Expense[]> => {
    const snapshot = await getDocs(query(expensesCollection, orderBy('date', 'desc')));
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

// Salesmen functions (now replaced by users with 'Salesman' role)
export const getSalesmen = async (): Promise<AppUser[]> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "Salesman"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
};

// Worker functions
export const getWorkers = async (): Promise<AppUser[]> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "Worker"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
}

// User functions
export const addUser = async (user: AppUser) => {
    const userRef = doc(db, 'users', user.uid);
    return await setDoc(userRef, user, { merge: true });
}

export const getUser = async (uid: string): Promise<AppUser | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { ...data, uid: docSnap.id } as AppUser;
    }
    return null;
}

// Customer Functions
const customersCollection = collection(db, 'customers');

export const getCustomersBySalesman = async(salesmanId: string): Promise<Customer[]> => {
    const q = query(customersCollection, where("salesmanId", "==", salesmanId));
    const snapshot = await getDocs(q);
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    // Sort by name in the code instead of in the query
    return customers.sort((a, b) => a.name.localeCompare(b.name));
}

export const getCustomer = async (id: string): Promise<Customer | null> => {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
};

export const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    return await addDoc(customersCollection, customer);
}

// App Settings functions
const settingsDocRef = doc(db, 'settings', 'appSettings');

let cachedSettings: AppSettings | null = null;

export const getAppSettings = async (forceRefresh = false): Promise<AppSettings> => {
    if (cachedSettings && !forceRefresh) {
        return cachedSettings;
    }

    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            cachedSettings = docSnap.data() as AppSettings;
            return cachedSettings;
        }
    } catch (e) {
        console.error("Could not fetch app settings from Firestore.", e);
    }
    
    // Return default settings if they don't exist or if there's an error
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
    const snapshot = await getDocs(query(assignmentsCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString()
        } as Assignment;
    });
};

export const getAssignment = async (id: string): Promise<Assignment | null> => {
    const docRef = doc(db, 'assignments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString()
        } as Assignment;
    }
    return null;
};

export const addAssignment = async (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const batch = writeBatch(db);

    // Find and archive the current pending assignment for the same salesman
    const q = query(assignmentsCollection, where("salesmanId", "==", assignment.salesmanId), where("status", "==", "Pending"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(document => {
        const assignmentRef = doc(db, 'assignments', document.id);
        batch.update(assignmentRef, { status: "Visited" }); // Mark old assignment as visited
    });

    // Add the new assignment
    const newAssignmentRef = doc(collection(db, 'assignments'));
    const assignmentWithTimestamp = {
        ...assignment,
        createdAt: Timestamp.now()
    };
    batch.set(newAssignmentRef, assignmentWithTimestamp);

    // Commit the batch
    await batch.commit();

    return newAssignmentRef;
};

export const updateAssignment = async (id: string, assignment: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => {
    const docRef = doc(db, 'assignments', id);
    return await updateDoc(docRef, assignment);
};

// Worker Task functions
const workerTasksCollection = collection(db, 'workerTasks');

export const getWorkerTasks = async (): Promise<WorkerTask[]> => {
    const snapshot = await getDocs(query(workerTasksCollection, orderBy('createdAt', 'desc')));
    const now = new Date();
    const isAfter1PM = now.getHours() >= 13;

    const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
        const task: WorkerTask = {
            id: doc.id,
            ...data,
            createdAt: createdAt.toISOString()
        } as WorkerTask;

        const taskDate = new Date(createdAt);
        const isOld = now.toDateString() !== taskDate.toDateString();

        if (isOld && isAfter1PM && task.status === 'Pending') {
             const updatedTask = {
                ...task,
                status: 'Expired' as 'Expired',
            };
            const docRef = doc(db, 'workerTasks', task.id);
            updateDoc(docRef, { status: 'Expired' });
            return updatedTask;
        }
        return task;
    });
    return tasks;
};

export const getWorkerTask = async (id: string): Promise<WorkerTask | null> => {
    const docRef = doc(db, 'workerTasks', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString()
        } as WorkerTask;
    }
    return null;
};

export const addWorkerTask = async (task: Omit<WorkerTask, 'id' | 'createdAt'>) => {
    const taskWithTimestamp = {
        ...task,
        createdAt: Timestamp.now()
    }
    return await addDoc(workerTasksCollection, taskWithTimestamp);
};

export const updateWorkerTask = async (id: string, task: Partial<Omit<WorkerTask, 'id' | 'createdAt'>>) => {
    const docRef = doc(db, 'workerTasks', id);
    return await updateDoc(docRef, task);
};

export const getAppSettingsWithDefaults = async (): Promise<AppSettings> => {
    const settings = await getAppSettings();
    return settings || {
        appName: 'GLOW',
        logoLight: 'https://iili.io/KYqQC1R.png',
        logoDark: 'https://iili.io/KYkW0NV.png',
        authLogoLight: 'https://iili.io/KYqQC1R.png',
        authLogoDark: 'https://iili.io/KYkW0NV.png',
        favicon: 'https://iili.io/KYqQC1R.png',
        currency: 'pkr',
        signupVisible: true,
    };
};
