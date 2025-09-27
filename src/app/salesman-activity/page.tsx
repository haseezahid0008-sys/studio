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
import { salesmen, sales } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import PageHeader from "@/components/page-header"

export default function SalesmanActivityPage() {

  const salesmanData = salesmen.map(salesman => {
    const salesmanSales = sales.filter(s => s.salesmanName === salesman.name);
    const totalRevenue = salesmanSales.reduce((acc, s) => acc + s.total, 0);
    const totalSales = salesmanSales.length;
    
    // Mock check-in/out status
    const statuses = ["Checked In", "Checked Out"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const lastActivity = new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
        ...salesman,
        totalRevenue,
        totalSales,
        status,
        lastActivity,
    }
  });

  return (
    <>
      <PageHeader
        title="Salesman Activity"
        description="Track sales and activity for each salesman."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Total Sales</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmanData.map((sm) => (
                <TableRow key={sm.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarFallback>{sm.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {sm.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sm.status === 'Checked In' ? 'default' : 'outline'}>
                        {sm.status}
                    </Badge>
                     <p className="text-xs text-muted-foreground"> at {sm.lastActivity}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{sm.totalSales}</TableCell>
                  <TableCell className="text-right">${sm.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
