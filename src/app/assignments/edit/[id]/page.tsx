

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
import type { Assignment } from "@/lib/types"
import { getAssignment, updateAssignment } from "@/lib/firestore"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        const assignmentData = await getAssignment(params.id);
        if (assignmentData) {
          setAssignment(assignmentData);
        } else {
          notFound();
        }
      } catch (err) {
        setError("Failed to fetch assignment data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [params.id]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignment) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const updatedData: Partial<Assignment> = {
        location: formData.get('location') as string,
        itemsToTake: formData.get('items') as string,
    };

    try {
        await updateAssignment(params.id, updatedData);
        toast({
            title: "Success",
            description: "Assignment updated successfully.",
        });
        router.push('/assignments');
    } catch (e) {
        console.error("Failed to update assignment: ", e);
        setError("Failed to update assignment. Please try again.");
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
  
  if (!assignment) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit Plan for ${assignment.salesmanName}`}
        description="Update the details of the salesman's plan."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Plan Details</CardTitle>
                <CardDescription>
                  Modify the location and items for this plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label>Salesman</Label>
                    <Input defaultValue={assignment.salesmanName} readOnly/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" defaultValue={assignment.location} required disabled={isSaving}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="items">Items to Take (Optional)</Label>
                    <Textarea id="items" name="items" defaultValue={assignment.itemsToTake} disabled={isSaving}/>
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
