

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
  CheckCircle,
  Clock,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  CircleOff,
  User,
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
  CardFooter,
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
import { getSales, getProducts, getExpenses, getAppSettings, getCurrencySymbol, getUser, getAssignments, getWorkerTasks, updateAssignment, updateWorkerTask } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { analyzeFinancials, type AnalyzeFinancialsOutput } from '@/ai/flows/analyze-financials';

function SalesmanDashboard({ assignments, userId }: { assignments: Assignment[], userId: string }) {
    const { toast } = useToast();
    const todaysAssignment = assignments.find(a => a.status === 'Pending');
    
    const [progressNotes, setProgressNotes] = useState(todaysAssignment?.progressNotes || "");
    const [status, setStatus] = useState(todaysAssignment?.status || "Pending");
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdate = async () => {
        if (!todaysAssignment) return;
        setIsSaving(true);
        try {
            await updateAssignment(todaysAssignment.id, { status, progressNotes });
            toast({
                title: "Success",
                description: "Plan status updated successfully.",
            });
        } catch (error) {
            console.error("Failed to update plan status:", error);
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };


  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold font-headline">Your Daily Plan</h1>
        {todaysAssignment ? (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><MapPin className="h-6 w-6"/> Today's Plan</CardTitle>
                         <CardDescription>Your assigned destination and items for today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold text-lg">{todaysAssignment.location}</p>
                            <p className="text-muted-foreground">Your destination for today.</p>
                        </div>
                        {todaysAssignment.itemsToTake && (
                            <div>
                                <h3 className="font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Items to Take</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{todaysAssignment.itemsToTake}</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <User className="h-4 w-4" /> 
                            Assigned by: <span className="font-medium">{todaysAssignment.assignedByName}</span>
                        </p>
                         <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> 
                            Assigned on: {new Date(todaysAssignment.createdAt).toLocaleString()}
                        </p>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Update Progress</CardTitle>
                        <CardDescription>Update the status of your plan for today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <div className="flex gap-2">
                               <Button variant={status === 'Visited' ? 'default' : 'outline'} onClick={() => setStatus('Visited')}><CheckCircle className="mr-2" /> Visited</Button>
                               <Button variant={status === 'Pending' ? 'default' : 'outline'} onClick={() => setStatus('Pending')}><Clock className="mr-2" /> Pending</Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">Progress Notes (Optional)</Label>
                            <Textarea id="notes" placeholder="e.g., Visited location, met with client." value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} disabled={isSaving}/>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Status
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        ) : (
             <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No plan assigned for today.</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

function WorkerDashboard({ tasks, userId }: { tasks: WorkerTask[], userId: string }) {
    const { toast } = useToast();
    const today = new Date().toISOString().split('T')[0];
    const todaysTask = tasks.find(t => new Date(t.createdAt).toISOString().split('T')[0] === today && t.status !== 'Completed' && t.status !== 'Expired');
    
    const [progressNotes, setProgressNotes] = useState(todaysTask?.progressNotes || "");
    const [status, setStatus] = useState(todaysTask?.status || "Pending");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async () => {
        if (!todaysTask) return;
        if (!progressNotes) {
            setError("Please fill in the progress notes.");
            return;
        }

        let finalStatus = status;
        if (progressNotes.toLowerCase().includes('done')) {
            finalStatus = 'Completed';
        }

        setIsSaving(true);
        setError(null);
        try {
            await updateWorkerTask(todaysTask.id, { status: finalStatus, progressNotes });
            toast({
                title: "Success",
                description: "Task status updated successfully.",
            });
            if (finalStatus === 'Completed') {
                // Optionally refresh or hide the task immediately from the UI
                 window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update task status:", error);
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold font-headline">Your Daily Task</h1>
        {todaysTask ? (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Wrench className="h-6 w-6"/> Today's Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <p className="font-semibold text-lg">{todaysTask.taskDescription}</p>
                           <p className="text-muted-foreground">This is your assigned task for today.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Update Progress</CardTitle>
                        <CardDescription>Update the status of your task for today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                             <div className="flex gap-2">
                               <Button variant={status === 'Completed' ? 'default' : 'outline'} onClick={() => setStatus('Completed')}><CheckCircle className="mr-2" /> Completed</Button>
                               <Button variant={status === 'In Progress' ? 'default' : 'outline'} onClick={() => setStatus('In Progress')}><Clock className="mr-2" /> In Progress</Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">Progress Notes (e.g., '40 units packed' or 'done')</Label>
                            <Textarea id="notes" placeholder="e.g., Packed 50 units." value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} disabled={isSaving} required/>
                         </div>
                         {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                     <CardFooter>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Progress
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        ) : (
            <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <Wrench className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No task assigned for today.</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

function AIAnalysisCard({ totalRevenue, totalExpenses }: { totalRevenue: number, totalExpenses: number }) {
  const [analysis, setAnalysis] = useState<AnalyzeFinancialsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true);
      try {
        const result = await analyzeFinancials({ totalRevenue, totalExpenses });
        setAnalysis(result);
      } catch (e) {
        console.error("AI analysis failed", e);
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (totalRevenue > 0 || totalExpenses > 0) {
      runAnalysis();
    } else {
        setIsLoading(false);
    }
  }, [totalRevenue, totalExpenses]);
  
  const StatusIcon = () => {
      if (!analysis) return <BrainCircuit className="h-6 w-6 text-muted-foreground" />;
      switch (analysis.status) {
          case 'profit': return <TrendingUp className="h-6 w-6 text-green-500" />;
          case 'loss': return <TrendingDown className="h-6 w-6 text-red-500" />;
          case 'breakeven': return <CircleOff className="h-6 w-6 text-yellow-500" />;
          default: return <BrainCircuit className="h-6 w-6 text-muted-foreground" />;
      }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle className="font-headline">AI Financial Analyst</CardTitle>
            <CardDescription>
                An AI-powered summary of your financial status.
            </CardDescription>
          </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
            <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Analyzing your data...</p>
            </div>
        ) : analysis ? (
             <div className="flex items-start gap-4">
                <StatusIcon />
                <div className="grid gap-1">
                <p className="text-sm font-medium leading-none capitalize">
                    Status: {analysis.status}
                </p>
                <p className="text-sm text-muted-foreground">
                    {analysis.summary}
                </p>
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-4">
                <BrainCircuit className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Not enough data for analysis.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
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
        (acc, sale) => acc + (sale.total - (sale.amountPaid || 0)),
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
                From {sales.filter(s => s.total > (s.amountPaid || 0)).length} invoices
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
                        <Badge className="text-xs" variant={sale.total > (sale.amountPaid || 0) ? "destructive" : "default"}>
                          {sale.total > (sale.amountPaid || 0) ? 'Pending' : 'Paid'}
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
          <div className="flex flex-col gap-4">
            <AIAnalysisCard totalRevenue={totalRevenue} totalExpenses={totalExpenses} />
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

  if (appUser?.role === 'Salesman' && user) {
      return <SalesmanDashboard assignments={assignments} userId={user.uid} />;
  }
  
  if (appUser?.role === 'Worker' && user) {
      return <WorkerDashboard tasks={workerTasks} userId={user.uid} />;
  }

  return <AdminDashboard />;
}

    
