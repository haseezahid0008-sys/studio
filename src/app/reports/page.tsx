
'use client'

import { useState } from "react"
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
import { Printer } from "lucide-react"
import PageHeader from "@/components/page-header"
import { sales, expenses } from "@/lib/data"

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("2024-07-01");
  const [endDate, setEndDate] = useState("2024-07-31");

  const handlePrint = () => {
    window.print();
  }

  const filteredSales = sales.filter(s => s.date >= startDate && s.date <= endDate);
  const filteredExpenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);
  const totalSales = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const profitLoss = totalSales - totalExpenses;

  return (
    <div className="@container">
      <div className="flex items-center justify-between gap-4 mb-4">
          <PageHeader
            title="Reports"
            description="Generate sales, expense, and profit/loss reports."
          />
          <div className="flex items-center gap-2 print:hidden">
            <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-xs">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handlePrint} className="self-end">
                <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
          </div>
      </div>
      
      <div id="report-content" className="space-y-8">
        <Card className="print:shadow-none print:border-none">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">JS Glow - Financial Report</CardTitle>
                <CardDescription>
                    Report for the period from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 @md:grid-cols-3">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800">Total Sales</p>
                    <p className="text-2xl font-bold text-green-900">${totalSales.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm font-medium text-red-800">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-900">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg ${profitLoss >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className={`text-sm font-medium ${profitLoss >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Profit / Loss</p>
                    <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>${profitLoss.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="print:shadow-none print:border-none">
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
                                    <td className="text-right p-2">${s.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card className="print:shadow-none print:border-none">
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
                                    <td className="text-right p-2">${e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
            body {
                background: white !important;
            }
            .print\\:hidden {
                display: none;
            }
            main {
                padding: 0 !important;
            }
            .print\\:shadow-none {
                box-shadow: none !important;
            }
             .print\\:border-none {
                border: none !important;
            }
        }
      `}</style>
    </div>
  )
}
