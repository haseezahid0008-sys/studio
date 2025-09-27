import Link from "next/link"
import { PlusCircle, File } from "lucide-react"

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
import { expenses } from "@/lib/data"
import PageHeader from "@/components/page-header"

export default function ExpensesPage() {
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
        <CardContent className="pt-6">
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
                    ${expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{expenses.length}</strong> of <strong>{expenses.length}</strong>{" "}
            expenses
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
