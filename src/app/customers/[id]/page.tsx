
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import { notFound, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Customer, Sale, Payment, AppSettings } from "@/lib/types"
import { getCustomer, getSalesByCustomer, getPaymentsForSale, addPayment, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import { Loader2, DollarSign, Receipt, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function AddPaymentModal({ sale, onPaymentAdded }: { sale: Sale, onPaymentAdded: () => void }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [amount, setAmount] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const maxAmount = sale.total - sale.amountPaid;

    const handleAddPayment = async () => {
        if (!amount || amount <= 0 || !user?.displayName) {
            toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
            return;
        }
        if (amount > maxAmount) {
            toast({ title: "Error", description: `Amount cannot be greater than the pending amount of ${maxAmount}.`, variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            await addPayment({
                saleId: sale.id,
                amount: Number(amount),
                recordedById: user.uid,
                recordedByName: user.displayName,
            });
            toast({ title: "Success", description: "Payment recorded successfully." });
            onPaymentAdded(); // This will trigger a refresh
            setIsOpen(false);
            setAmount('');
        } catch (error) {
            console.error("Failed to add payment:", error);
            toast({ title: "Error", description: "Failed to record payment.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={maxAmount <= 0}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Payment for Sale #{sale.id.slice(0,6)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="payment-amount">Payment Amount</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          placeholder={`Max: ${maxAmount}`}
                          disabled={isSaving}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddPayment} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function SaleItemWithPayments({ sale, currencySymbol }: { sale: Sale, currencySymbol: string, onRefresh: () => void }) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPaymentsForSale(sale.id).then(data => {
            setPayments(data);
            setIsLoading(false);
        });
    }, [sale.id]);

    const handleRefresh = () => {
        setIsLoading(true);
         getPaymentsForSale(sale.id).then(data => {
            setPayments(data);
            setIsLoading(false);
        });
    }

    const pendingAmount = sale.total - sale.amountPaid;

    return (
        <AccordionItem value={sale.id}>
            <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                    <div className="text-left">
                        <p className="font-medium">Sale on {new Date(sale.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Sale ID: ...{sale.id.slice(-6)}</p>
                    </div>
                     <div className="text-right">
                         <p className="font-bold text-lg">{currencySymbol}{sale.total.toLocaleString()}</p>
                        <Badge variant={pendingAmount > 0 ? 'destructive' : 'outline'}>
                            {pendingAmount > 0 ? `Pending: ${currencySymbol}${pendingAmount.toLocaleString()}` : 'Paid'}
                        </Badge>
                     </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Payment History</h4>
                        <AddPaymentModal sale={sale} onPaymentAdded={() => { handleRefresh(); }} />
                    </div>
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        payments.length > 0 ? (
                             <ul className="space-y-2">
                                {payments.map(payment => (
                                    <li key={payment.id} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                                        <div>
                                            <p>Paid on {new Date(payment.date).toLocaleDateString()}</p>
                                            <p className="text-xs text-muted-foreground">by {payment.recordedByName}</p>
                                        </div>
                                        <p className="font-medium">{currencySymbol}{payment.amount.toLocaleString()}</p>
                                    </li>
                                ))}
                             </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No payment history for this sale yet.</p>
                        )
                    )}
                     <div className="mt-4 pt-4 border-t flex flex-col gap-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal:</span> <span>{currencySymbol}{sale.total + sale.discount}</span></div>
                        <div className="flex justify-between"><span>Discount:</span> <span>-{currencySymbol}{sale.discount}</span></div>
                        <div className="flex justify-between font-bold"><span>Total:</span> <span>{currencySymbol}{sale.total}</span></div>
                        <div className="flex justify-between"><span>Amount Paid:</span> <span>{currencySymbol}{sale.amountPaid}</span></div>
                        <div className="flex justify-between font-bold text-destructive"><span>Pending:</span> <span>{currencySymbol}{pendingAmount}</span></div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )

}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
      try {
        setIsLoading(true);
        const [customerData, salesData, appSettings] = await Promise.all([
          getCustomer(params.id),
          getSalesByCustomer(params.id),
          getAppSettings()
        ]);
        
        if (customerData) {
          setCustomer(customerData);
          setSales(salesData);
          setSettings(appSettings);
        } else {
          notFound();
        }
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [params.id]);
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }
  
  if (!customer) {
    notFound();
  }

  const currencySymbol = getCurrencySymbol(settings?.currency);

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Manage sales and payments for ${customer.name}`}
        showBackButton
      />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center justify-between">
                        Sales History
                        <Button asChild>
                            <Link href="/sales/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Sale
                            </Link>
                        </Button>
                    </CardTitle>
                    <CardDescription>A record of all sales and payments for this customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sales.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                           {sales.map(sale => (
                               <SaleItemWithPayments key={sale.id} sale={sale} currencySymbol={currencySymbol} onRefresh={fetchData} />
                           ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="mx-auto h-12 w-12" />
                            <p className="mt-4">No sales recorded for this customer yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
                </CardContent>
            </Card>
             <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline text-destructive">Total Outstanding</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-destructive">{currencySymbol}{customer.totalDue.toLocaleString()}</p>
                    <p className="text-sm text-destructive/80">Total pending amount across all sales.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  )
}
