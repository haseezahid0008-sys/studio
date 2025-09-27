
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

type SalesmanData = AppUser & {
  totalRevenue: number;
  totalSales: number;
  status: string;
  lastActivity: string;
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

        const data = salesmen.map(salesman => {
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
                <TableHead>Salesman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Total Sales</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmanData.map((sm) => (
                <TableRow key={sm.uid}>
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
                  <TableCell className="text-right">{currencySymbol}{sm.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
