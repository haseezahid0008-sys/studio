
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSalesmen, addAssignment, getAssignments } from "@/lib/firestore";
import type { AppUser, Assignment } from "@/lib/types";

export default function AssignmentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [salesmen, setSalesmen] = useState<AppUser[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    
    const [salesmanId, setSalesmanId] = useState('');
    const [todayLocation, setTodayLocation] = useState('');
    const [tomorrowLocation, setTomorrowLocation] = useState('');
    const [itemsToTake, setItemsToTake] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [salesmenData, assignmentsData] = await Promise.all([
                    getSalesmen(),
                    getAssignments(),
                ]);
                setSalesmen(salesmenData);
                setAssignments(assignmentsData);
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
        if (!salesmanId || !todayLocation || !tomorrowLocation) {
            setError("Please select a salesman and fill out both location fields.");
            return;
        }

        setIsSaving(true);
        setError(null);

        const salesman = salesmen.find(s => s.uid === salesmanId);

        try {
            await addAssignment({
                salesmanId,
                salesmanName: salesman?.name || 'N/A',
                todayLocation,
                tomorrowLocation,
                itemsToTake,
            });
            toast({
                title: "Success",
                description: "Assignment created successfully.",
            });
            // Refresh assignments list
            getAssignments().then(setAssignments);
            // Reset form
            setSalesmanId('');
            setTodayLocation('');
            setTomorrowLocation('');
            setItemsToTake('');

        } catch (e) {
            console.error("Failed to create assignment:", e);
            setError("Failed to create assignment. Please try again.");
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

    return (
        <>
            <PageHeader
                title="Salesman Plan"
                description="Create and manage daily plans for your sales team."
            />
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">New Plan</CardTitle>
                        <CardDescription>Assign a daily route and tasks to a salesman.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="salesman">Salesman</Label>
                            <Select value={salesmanId} onValueChange={setSalesmanId} disabled={isSaving}>
                                <SelectTrigger id="salesman">
                                    <SelectValue placeholder="Select a salesman" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salesmen.map(s => (
                                        <SelectItem key={s.uid} value={s.uid}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="today-location">Today's Location</Label>
                            <Input id="today-location" placeholder="e.g., Downtown Market" value={todayLocation} onChange={e => setTodayLocation(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tomorrow-location">Tomorrow's Location</Label>
                            <Input id="tomorrow-location" placeholder="e.g., Uptown Plaza" value={tomorrowLocation} onChange={e => setTomorrowLocation(e.target.value)} disabled={isSaving}/>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="items">Items to Take (Optional)</Label>
                            <Textarea id="items" placeholder="List any items the salesman needs to take..." value={itemsToTake} onChange={e => setItemsToTake(e.target.value)} disabled={isSaving}/>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Plan
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Plans</CardTitle>
                         <CardDescription>A log of the most recent plans created.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-6">
                            {assignments.slice(0, 5).map(assignment => (
                                <div key={assignment.id} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                        {assignment.salesmanName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{assignment.salesmanName}</p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-500" /> <strong>Today:</strong> {assignment.todayLocation}</p>
                                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-500" /> <strong>Tomorrow:</strong> {assignment.tomorrowLocation}</p>
                                        </div>
                                         <p className="text-xs text-muted-foreground mt-1">{new Date(assignment.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                             {assignments.length === 0 && (
                                <p className="text-muted-foreground text-center">No assignments found.</p>
                             )}
                       </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
