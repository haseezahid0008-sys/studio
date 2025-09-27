
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, Users, Phone, MapPinIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCustomersBySalesman, addCustomer, getAppSettings, getCurrencySymbol, getUser } from "@/lib/firestore";
import type { AppUser, Customer, AppSettings } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function CustomersPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const [userData, appSettings] = await Promise.all([
                    getUser(user.uid),
                    getAppSettings()
                ]);
                setAppUser(userData);
                setSettings(appSettings);
                if (userData?.role === 'Salesman') {
                    const customerData = await getCustomersBySalesman(user.uid);
                    setCustomers(customerData);
                } else {
                    // TODO: Handle manager/admin view
                    setCustomers([]);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSubmit = async () => {
        if (!name || !phone || !user) {
            setError("Name and Phone are required.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const newCustomer = {
                name,
                phone,
                address,
                salesmanId: user.uid,
                totalDue: 0,
            };
            const ref = await addCustomer(newCustomer);
            setCustomers(prev => [...prev, {id: ref.id, ...newCustomer}]);
            toast({
                title: "Success",
                description: "Customer added successfully.",
            });
            setName('');
            setPhone('');
            setAddress('');
        } catch (e) {
            console.error("Failed to add customer:", e);
            setError("Failed to add customer. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const currencySymbol = getCurrencySymbol(settings?.currency);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <>
            <PageHeader
                title="Customers"
                description="Manage your customer list and track outstanding payments."
            />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Your Customers</CardTitle>
                            <CardDescription>A list of all your registered customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                {customers.length > 0 ? customers.map(customer => (
                                    <Link href={`/customers/${customer.id}`} key={customer.id} className="block hover:bg-muted/50 p-4 rounded-lg -m-4 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{customer.name}</p>
                                                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4"/> {customer.phone}</p>
                                                    {customer.address && <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4"/> {customer.address}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-sm text-muted-foreground">Total Due</p>
                                                <p className="font-bold text-lg text-destructive">{currencySymbol}{customer.totalDue.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="text-muted-foreground text-center py-8">No customers found. Add one to get started.</p>
                                )}
                           </div>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Add New Customer</CardTitle>
                        <CardDescription>Quickly add a new customer to your list.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Customer Name</Label>
                            <Input id="name" placeholder="e.g., John Doe" value={name} onChange={e => setName(e.target.value)} disabled={isSaving}/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" placeholder="e.g., 0300-1234567" value={phone} onChange={e => setPhone(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address (Optional)</Label>
                            <Input id="address" placeholder="e.g., Shop # 5, Main Market" value={address} onChange={e => setAddress(e.target.value)} disabled={isSaving}/>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
