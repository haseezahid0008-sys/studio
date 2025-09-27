
'use client';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSalesmen, getSales, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import PageHeader from "@/components/page-header"
import type { AppUser, Sale, AppSettings } from "@/lib/types";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type SalesmanData = AppUser & {
  totalRevenue: number;
  totalSales: number;
  sales: Sale[];
};

export default function SalesmanActivityPage() {
  const [salesmanData, setSalesmanData] = useState<SalesmanData[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesmen, sales, appSettings] = await Promise.all([getSalesmen(), getSales(), getAppSettings()]);
        setSettings(appSettings);

        const data = salesmen.filter(s => s.name).map(salesman => {
          const salesmanSales = sales.filter(s => s.salesmanName === salesman.name);
          const totalRevenue = salesmanSales.reduce((acc, s) => acc + s.total, 0);
          const totalSales = salesmanSales.length;

          return {
              ...salesman,
              totalRevenue,
              totalSales,
              sales: salesmanSales,
          }
        });
        setSalesmanData(data);

      } catch(err) {
        setError("Failed to fetch salesman data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const currencySymbol = getCurrencySymbol(settings?.currency);

  return (
    <>
      <PageHeader
        title="Salesman Activity"
        description="Track sales and activity for each salesman."
      />
      <Card>
         <CardHeader>
            <CardTitle className="font-headline">Salesman Performance</CardTitle>
            <CardDescription>Review revenue and individual sales for each salesman.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
          <Accordion type="single" collapsible className="w-full">
            {salesmanData.map((sm) => (
                <AccordionItem value={sm.uid} key={sm.uid}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4 w-full pr-4">
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarFallback>{sm.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 text-left">
                                    <p className="text-sm font-medium leading-none">
                                    {sm.name}
                                    </p>
                                </div>
                            </div>
                             <div className="text-sm text-muted-foreground hidden sm:block">
                                Total Sales: <span className="font-bold">{sm.totalSales}</span>
                            </div>
                            <div className="text-sm text-muted-foreground text-right">
                                Total Revenue: <span className="font-bold">{currencySymbol}{sm.totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-lg">
                           <h4 className="font-semibold mb-2">Sales by {sm.name}</h4>
                            {sm.sales.length > 0 ? (
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sm.sales.map(sale => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.customerName}</TableCell>
                                        <TableCell className="text-right">{currencySymbol}{sale.total.toLocaleString()}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No sales recorded for this salesman.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </>
  )
}
