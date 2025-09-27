
'use client';

import Link from "next/link"
import Image from "next/image"
import { PlusCircle, File, Loader2, Camera } from "lucide-react"
import * as XLSX from 'xlsx';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getSales, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import PageHeader from "@/components/page-header"
import type { Sale, AppSettings } from "@/lib/types";
import { useEffect, useState } from "react";
import { saveAs } from 'file-saver';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export default function SalesPage() {
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const [salesData, appSettings] = await Promise.all([
            getSales(),
            getAppSettings()
        ]);
        setAllSales(salesData);
        setSettings(appSettings);
      } catch (err) {
        setError("Failed to fetch sales. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);
  
  const pendingSales = allSales.filter(s => s.total > s.amountPaid);
  const currencySymbol = getCurrencySymbol(settings?.currency);

  const handleExport = () => {
    const dataToExport = activeTab === 'all' ? allSales : pendingSales;
    const formattedData = dataToExport.map(sale => ({
        'Date': new Date(sale.date).toLocaleDateString(),
        'Customer Name': sale.customerName,
        'Customer Phone': sale.customerPhone,
        'Salesman': sale.salesmanName,
        'Total Amount': sale.total,
        'Amount Paid': sale.amountPaid,
        'Pending Amount': sale.total - sale.amountPaid,
        'Status': sale.total > sale.amountPaid ? "Pending" : "Paid",
        'Image URL': sale.shopImageURL || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-T'});
    saveAs(data, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
  }

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
            <div className="flex-1">
                 <PageHeader title="Sales" description="Manage and view all customer sales." />
            </div>
            <div className="flex items-center gap-2">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                    </span>
                </Button>
                <Button size="sm" asChild className="h-8 gap-1">
                    <Link href="/sales/new">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Sale
                        </span>
                    </Link>
                </Button>
            </div>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
             <div className="flex justify-center items-center h-96">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <>
                <TabsContent value="all">
                    <SalesTable title="All Sales" description="A list of all sales transactions." salesData={allSales} currencySymbol={currencySymbol} />
                </TabsContent>
                <TabsContent value="pending">
                    <SalesTable title="Pending Payments" description="A list of sales with outstanding payments." salesData={pendingSales} currencySymbol={currencySymbol} />
                </TabsContent>
            </>
        )}
    </Tabs>
  )
}


function SalesTable({ title, description, salesData, currencySymbol }: { title: string, description: string, salesData: Sale[], currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">
                Salesman
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Shop Photo</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <div className="font-medium">{sale.customerName}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {sale.customerPhone}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{sale.salesmanName}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={sale.total > sale.amountPaid ? "destructive" : "outline"}>
                    {sale.total > sale.amountPaid ? "Pending" : "Paid"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(sale.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                    {sale.shopImageURL ? (
                       <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Shop Photo for {sale.customerName}</DialogTitle>
                                </DialogHeader>
                                <div className="relative h-96 w-full mt-4">
                                     <Image src={sale.shopImageURL} alt={`Shop photo for ${sale.customerName}`} fill style={{ objectFit: 'contain' }} />
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </TableCell>
                <TableCell className="text-right">{currencySymbol}{sale.total.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  {currencySymbol}{(sale.total - sale.amountPaid).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{salesData.length}</strong> of <strong>{salesData.length}</strong> sales
        </div>
      </CardFooter>
    </Card>
  )
}
