
'use client'

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  ClipboardList,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Sale, Product, Expense, AppSettings, AppUser, Assignment, WorkerTask } from '@/lib/types';
import { getSales, getProducts, getExpenses, getAppSettings, getCurrencySymbol, getUser, getAssignments, getWorkerTasks } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';

function SalesmanDashboard({ assignments }: { assignments: Assignment[] }) {
    const today = new Date().toISOString().split('T')[0];
    const todaysAssignment = assignments.find(a => new Date(a.createdAt).toISOString().split('T')[0] === today);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold font-headline">Your Daily Plan</h1>
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><MapPin className="h-6 w-6"/> Today's Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    {todaysAssignment ? (
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-lg">{todaysAssignment.todayLocation}</p>
                                <p className="text-muted-foreground">Your destination for today.</p>
                            </div>
                            {todaysAssignment.itemsToTake && (
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Items to Take</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{todaysAssignment.itemsToTake}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No plan assigned for today.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function WorkerDashboard({ tasks }: { tasks: WorkerTask[] }) {
    const today = new Date().toISOString().split('T')[0];
    const todaysTask = tasks.find(t => new Date(t.createdAt).toISOString().split('T')[0] === today);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold font-headline">Your Daily Task</h1>
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Wrench className="h-6 w-6"/> Today's Task</CardTitle>
                </CardHeader>
                <CardContent>
                    {todaysTask ? (
                        <div className="space-y-2">
                           <p className="font-semibold text-lg">{todaysTask.taskDescription}</p>
                           <p className="text-muted-foreground">This is your assigned task for today.</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No task assigned for today.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


function AdminDashboard() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            setIsLoading(true);
            const [salesData, productsData, expensesData, appSettings] = await Promise.all([
            getSales(),
            getProducts(),
            getExpenses(),
            getAppSettings(),
            ]);
            setSales(salesData);
            setProducts(productsData);
            setExpenses(expensesData);
            setSettings(appSettings);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch dashboard data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
          </div>
        );
    }
    
    if (error) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <p className="text-destructive">{error}</p>
          </div>
        );
    }

    const currencySymbol = getCurrencySymbol(settings?.currency);
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalSalesCount = sales.length;
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const pendingPayments = sales.reduce(
        (acc, sale) => acc + (sale.total - sale.amountPaid),
        0
    );
    const stockAlerts = products.filter(
        (p) => p.stock < p.reorderLevel
    );
    const recentSales = sales.slice(0, 5);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {currencySymbol}{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {totalSalesCount} sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">+{totalSalesCount}</div>
              <p className="text-xs text-muted-foreground">
                Total sales recorded
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">
                {currencySymbol}{totalExpenses.toLocaleString()}
              </div>
               <p className="text-xs text-muted-foreground">
                Across {expenses.length} records
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{currencySymbol}{pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {sales.filter(s => s.total > s.amountPaid).length} invoices
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle className="font-headline">Recent Sales</CardTitle>
                <CardDescription>
                  You made {totalSalesCount} sales in total.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/sales">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-column">
                      Type
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.customerName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {sale.salesmanName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-column">
                        Sale
                      </TableCell>
                      <TableCell className="hidden xl:table-column">
                        <Badge className="text-xs" variant={sale.total > sale.amountPaid ? "destructive" : "default"}>
                          {sale.total > sale.amountPaid ? 'Pending' : 'Paid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                        {new Date(sale.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencySymbol}{sale.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Stock Alerts</CardTitle>
              <CardDescription>
                Products running low on inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {stockAlerts.length > 0 ? (
                stockAlerts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock} (Reorder at {product.reorderLevel})
                      </p>
                    </div>
                    <Button asChild size="sm" className="ml-auto">
                        <Link href="/inventory">Reorder</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">All products are well-stocked.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workerTasks, setWorkerTasks] = useState<WorkerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const userData = await getUser(user.uid);
            setAppUser(userData);

            if (userData?.role === 'Salesman') {
                const allAssignments = await getAssignments();
                const salesmanAssignments = allAssignments.filter(a => a.salesmanId === user.uid);
                setAssignments(salesmanAssignments);
            } else if (userData?.role === 'Worker') {
                const allTasks = await getWorkerTasks();
                const userTasks = allTasks.filter(t => t.workerId === user.uid);
                setWorkerTasks(userTasks);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to fetch user data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (appUser?.role === 'Salesman') {
      return <SalesmanDashboard assignments={assignments} />;
  }
  
  if (appUser?.role === 'Worker') {
      return <WorkerDashboard tasks={workerTasks} />;
  }

  return <AdminDashboard />;
}
