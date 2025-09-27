
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wrench, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWorkers, addWorkerTask, getWorkerTasks } from "@/lib/firestore";
import type { AppUser, WorkerTask } from "@/lib/types";

export default function WorkerTasksPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [workers, setWorkers] = useState<AppUser[]>([]);
    const [tasks, setTasks] = useState<WorkerTask[]>([]);
    
    const [workerId, setWorkerId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [workersData, tasksData] = await Promise.all([
                    getWorkers(),
                    getWorkerTasks(),
                ]);
                setWorkers(workersData);
                setTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                console.error(err);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!workerId || !taskDescription) {
            setError("Please select a worker and describe the task.");
            return;
        }

        setIsSaving(true);
        setError(null);

        const worker = workers.find(w => w.uid === workerId);

        try {
            await addWorkerTask({
                workerId,
                workerName: worker?.name || 'N/A',
                taskDescription,
            });
            toast({
                title: "Success",
                description: "Task assigned successfully.",
            });
            // Refresh tasks list
            getWorkerTasks().then(tasksData => {
                 setTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            });
            // Reset form
            setWorkerId('');
            setTaskDescription('');

        } catch (e) {
            console.error("Failed to create task:", e);
            setError("Failed to create task. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <PageHeader
                title="Worker Tasks"
                description="Create and manage daily tasks for your workers."
            />
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">New Task</CardTitle>
                        <CardDescription>Assign a daily task to a worker.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="worker">Worker</Label>
                            <Select value={workerId} onValueChange={setWorkerId} disabled={isSaving}>
                                <SelectTrigger id="worker">
                                    <SelectValue placeholder="Select a worker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map(w => (
                                        <SelectItem key={w.uid} value={w.uid}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task">Task Description</Label>
                            <Textarea id="task" placeholder="e.g., Pack 100 units of soap" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} disabled={isSaving}/>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign Task
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Tasks</CardTitle>
                         <CardDescription>A log of the most recent tasks assigned.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-6">
                            {tasks.slice(0, 10).map(task => (
                                <div key={task.id} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                        {task.workerName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{task.workerName}</p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p className="flex items-center gap-2"><Wrench className="h-4 w-4 text-sky-500" /> <strong>Task:</strong> {task.taskDescription}</p>
                                        </div>
                                         <p className="text-xs text-muted-foreground mt-1">{new Date(task.createdAt).toLocaleString()}</p>
                                    </div>
                                    {new Date(task.createdAt).toISOString().split('T')[0] === today && (
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href={`/worker-tasks/edit/${task.id}`}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ))}
                             {tasks.length === 0 && (
                                <p className="text-muted-foreground text-center">No tasks found.</p>
                             )}
                       </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
