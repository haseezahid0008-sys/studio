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
import { Badge } from "@/components/ui/badge"
import { sales } from "@/lib/data"
import PageHeader from "@/components/page-header"

export default function SalesPage() {
  const allSales = sales;
  const pendingSales = sales.filter(s => s.total > s.amountPaid);

  return (
    <Tabs defaultValue="all">
        <div className="flex items-center">
            <div className="flex-1">
                 <PageHeader title="Sales" description="Manage and view all customer sales." />
            </div>
            <div className="flex items-center gap-2">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <Button size="sm" variant="outline" className="h-8 gap-1">
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
        <TabsContent value="all">
            <SalesTable title="All Sales" description="A list of all sales transactions." salesData={allSales} />
        </TabsContent>
        <TabsContent value="pending">
            <SalesTable title="Pending Payments" description="A list of sales with outstanding payments." salesData={pendingSales} />
        </TabsContent>
    </Tabs>
  )
}


function SalesTable({ title, description, salesData }: { title: string, description: string, salesData: typeof sales }) {
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
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.customerName}</TableCell>
                <TableCell className="hidden sm:table-cell">{sale.salesmanName}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={sale.total > sale.amountPaid ? "destructive" : "outline"}>
                    {sale.total > sale.amountPaid ? "Pending" : "Paid"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(sale.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  ${(sale.total - sale.amountPaid).toFixed(2)}
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
