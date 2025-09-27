
'use client';

import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
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
import { getExpenses, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import PageHeader from "@/components/page-header"
import type { Expense, AppSettings } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const [expensesData, appSettings] = await Promise.all([
          getExpenses(),
          getAppSettings()
        ]);
        setExpenses(expensesData);
        setSettings(appSettings);
      } catch (err) {
        setError("Failed to fetch expenses. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const currencySymbol = getCurrencySymbol(settings?.currency);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Manage and track all your business expenses."
        action={{
            href: "/expenses/new",
            label: "Add Expense",
        }}
      />
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">All Expenses</CardTitle>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.notes}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencySymbol}{expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
         {!isLoading && !error && (
            <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>1-{expenses.length}</strong> of <strong>{expenses.length}</strong>{" "}
                expenses
            </div>
            </CardFooter>
        )}
      </Card>
    </>
  )
}
