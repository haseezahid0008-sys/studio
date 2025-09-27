
'use client'

import { useState, useEffect } from "react"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { File, Loader2 } from "lucide-react"
import PageHeader from "@/components/page-header"
import { getSales, getExpenses, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import type { Sale, Expense, AppSettings } from "@/lib/types"

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesData, expensesData, appSettings] = await Promise.all([getSales(), getExpenses(), getAppSettings()]);
        setSales(salesData);
        setExpenses(expensesData);
        setSettings(appSettings);
      } catch (err) {
        console.error(err);
        setError("Failed to load report data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currencySymbol = getCurrencySymbol(settings?.currency);
  const filteredSales = sales.filter(s => s.date >= startDate && s.date <= endDate);
  const filteredExpenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);
  const totalSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const profitLoss = totalSales - totalExpenses;

  const handleExport = () => {
    const reportPeriod = `Report from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;

    // Summary Data
    const summaryData = [
      { Metric: "Total Sales", Amount: totalSales },
      { Metric: "Total Expenses", Amount: totalExpenses },
      { Metric: "Profit / Loss", Amount: profitLoss },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.sheet_add_aoa(summarySheet, [[reportPeriod]], { origin: "A5" });


    // Sales Data
    const salesData = filteredSales.map(s => ({
      'Date': new Date(s.date).toLocaleDateString(),
      'Customer': s.customerName,
      'Salesman': s.salesmanName,
      'Amount': s.total,
    }));
    const salesSheet = XLSX.utils.json_to_sheet(salesData);

    // Expenses Data
    const expensesData = filteredExpenses.map(e => ({
        'Date': new Date(e.date).toLocaleDateString(),
        'Category': e.category,
        'Notes': e.notes || 'N/A',
        'Amount': e.amount
    }));
    const expensesSheet = XLSX.utils.json_to_sheet(expensesData);

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Financial Summary");
    XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Details");
    XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expense Details");
    
    // Download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(data, `Financial_Report_${startDate}_to_${endDate}.xlsx`);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
          <PageHeader
            title="Reports"
            description="Generate sales, expense, and profit/loss reports."
          />
          <div className="flex items-center gap-2">
            <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-xs">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleExport} className="self-end" disabled={isLoading}>
                <File className="mr-2 h-4 w-4" /> Export to Excel
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
      <div id="report-content" className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{settings?.appName || 'JS Glow'} - Financial Report</CardTitle>
                <CardDescription>
                    Report for the period from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800">Total Sales</p>
                    <p className="text-2xl font-bold text-green-900">{currencySymbol}{totalSales.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-900">{currencySymbol}{totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg ${profitLoss >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className={`text-sm font-medium ${profitLoss >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Profit / Loss</p>
                    <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>{currencySymbol}{profitLoss.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Customer</th>
                                <th className="text-right p-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(s => (
                                <tr key={s.id} className="border-b">
                                    <td className="p-2">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="p-2">{s.customerName}</td>
                                    <td className="text-right p-2">{currencySymbol}{s.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Details</CardTitle>
                </CardHeader>
                <CardContent>
                     <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-right p-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(e => (
                                <tr key={e.id} className="border-b">
                                    <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-2">{e.category}</td>
                                    <td className="text-right p-2">{currencySymbol}{e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
      </div>
      )}
    </div>
  )
}
