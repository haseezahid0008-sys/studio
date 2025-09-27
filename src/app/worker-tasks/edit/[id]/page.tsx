
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import { notFound, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { WorkerTask } from "@/lib/types"
import { getWorkerTask, updateWorkerTask } from "@/lib/firestore"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

export default function EditWorkerTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const taskId = params.id;
  const [task, setTask] = useState<WorkerTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const taskData = await getWorkerTask(taskId);
        if (taskData) {
          setTask(taskData);
        } else {
          notFound();
        }
      } catch (err) {
        setError("Failed to fetch task data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const updatedData: Partial<WorkerTask> = {
        taskDescription: formData.get('task-description') as string,
    };

    try {
        await updateWorkerTask(taskId, updatedData);
        toast({
            title: "Success",
            description: "Task updated successfully.",
        });
        router.push('/worker-tasks');
    } catch (e) {
        console.error("Failed to update task: ", e);
        setError("Failed to update task. Please try again.");
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }
  
  if (!task) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit Task for ${task.workerName}`}
        description="Update the details of the worker's task."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Task Details</CardTitle>
                <CardDescription>
                  Modify the description for this task.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label>Worker</Label>
                    <Input defaultValue={task.workerName} readOnly/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="task-description">Task Description</Label>
                    <Textarea id="task-description" name="task-description" defaultValue={task.taskDescription} required disabled={isSaving}/>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
            </Card>
        </form>
      </div>
    </>
  )
}
