

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
import { getSalesmen, getAssignments } from "@/lib/firestore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import PageHeader from "@/components/page-header"
import type { AppUser, Assignment } from "@/lib/types";
import { Loader2, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";

type SalesmanHistory = AppUser & {
  assignments: Assignment[];
};

export default function HistoryPage() {
  const [salesmanHistory, setSalesmanHistory] = useState<SalesmanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesmen, assignments] = await Promise.all([getSalesmen(), getAssignments()]);
        
        const data = salesmen.map(salesman => {
          const salesmanAssignments = assignments
            .filter(a => a.salesmanId === salesman.uid)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          return {
              ...salesman,
              assignments: salesmanAssignments,
          }
        });
        
        setSalesmanHistory(data);

      } catch(err) {
        setError("Failed to fetch history data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);


  return (
    <>
      <PageHeader
        title="Salesman History"
        description="Review past plans and visited locations for each salesman."
      />
      <Card>
         <CardHeader>
            <CardTitle className="font-headline">Assignment History</CardTitle>
            <CardDescription>A complete log of all past and present assignments.</CardDescription>
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
            {salesmanHistory.map((sm) => (
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
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Assignments for {sm.name}</h4>
                            {sm.assignments.length > 0 ? (
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sm.assignments.map(assignment => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>{new Date(assignment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{assignment.location}</TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.status === 'Visited' ? 'outline' : 'default'}>
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{assignment.itemsToTake || 'N/A'}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No assignment history found.</p>
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
