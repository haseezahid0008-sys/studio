
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
import { getWorkers, getWorkerTasks } from "@/lib/firestore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import PageHeader from "@/components/page-header"
import type { AppUser, WorkerTask } from "@/lib/types";
import { Loader2, Wrench } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type WorkerData = AppUser & {
  tasks: WorkerTask[];
};

export default function WorkerProgressPage() {
  const [workerData, setWorkerData] = useState<WorkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [workers, tasks] = await Promise.all([getWorkers(), getWorkerTasks()]);

        const data = workers.map(worker => {
          const workerTasks = tasks.filter(t => t.workerId === worker.uid);

          return {
              ...worker,
              tasks: workerTasks,
          }
        });
        
        setWorkerData(data);

      } catch(err) {
        setError("Failed to fetch worker data. Please try again later.");
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
        title="Worker Progress"
        description="Track tasks and progress for each worker."
      />
      <Card>
         <CardHeader>
            <CardTitle className="font-headline">Worker Task Summary</CardTitle>
            <CardDescription>Review daily tasks, status, and progress notes for each worker.</CardDescription>
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
            {workerData.map((worker) => (
                <AccordionItem value={worker.uid} key={worker.uid}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4 w-full pr-4">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarFallback>{worker.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1 text-left">
                                <p className="text-sm font-medium leading-none">
                                {worker.name}
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-lg">
                           <h4 className="font-semibold mb-2">Tasks Assigned to {worker.name}</h4>
                            {worker.tasks.length > 0 ? (
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Progress Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {worker.tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{task.taskDescription}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                task.status === 'Completed' ? 'default' : 
                                                task.status === 'In Progress' ? 'secondary' : 'outline'
                                            }>
                                                {task.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{task.progressNotes}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No tasks assigned to this worker.</p>
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
