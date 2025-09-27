

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
import { Loader2, MapPin, Pencil, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSalesmen, addAssignment, getAssignments } from "@/lib/firestore";
import type { AppUser, Assignment } from "@/lib/types";
import { generateSalesmanItems } from "@/ai/flows/generate-salesman-items";
import { useAuth } from "@/hooks/use-auth";

export default function AssignmentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [salesmen, setSalesmen] = useState<AppUser[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    
    const [salesmanId, setSalesmanId] = useState('');
    const [location, setLocation] = useState('');
    const [itemsToTake, setItemsToTake] = useState('');
    const [aiItemKeywords, setAiItemKeywords] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

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
                setAssignments(assignmentsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                console.error(err);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGenerateItems = async () => {
        if (!aiItemKeywords) return;
        setIsAiGenerating(true);
        try {
            const result = await generateSalesmanItems({ items: aiItemKeywords });
            if (result.itemList) {
                setItemsToTake(result.itemList);
            }
        } catch (e) {
            console.error("AI item generation failed", e);
            toast({
                title: "AI Generation Failed",
                description: "Could not generate items list. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!salesmanId || !location || !user) {
            setError("Please select a salesman, fill out the location field, and ensure you are logged in.");
            return;
        }

        setIsSaving(true);
        setError(null);

        const salesman = salesmen.find(s => s.uid === salesmanId);

        try {
            await addAssignment({
                salesmanId,
                salesmanName: salesman?.name || 'N/A',
                location,
                itemsToTake,
                status: 'Pending',
                progressNotes: '',
                assignedById: user.uid,
                assignedByName: user.displayName || 'Manager',
            });
            toast({
                title: "Success",
                description: "Assignment created successfully.",
            });
            // Refresh assignments list
            getAssignments().then(assignmentsData => {
                 setAssignments(assignmentsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            });
            // Reset form
            setSalesmanId('');
            setLocation('');
            setItemsToTake('');
            setAiItemKeywords('');

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
    
    const today = new Date().toISOString().split('T')[0];
    const activeAssignments = assignments.filter(a => a.status === 'Pending');

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
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g., Downtown Market" value={location} onChange={e => setLocation(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ai-items">Generate Items with AI (Optional)</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="ai-items" 
                                    placeholder="e.g., soap, biscuits, cold drinks" 
                                    value={aiItemKeywords}
                                    onChange={e => setAiItemKeywords(e.target.value)}
                                    disabled={isAiGenerating || isSaving}
                                />
                                <Button onClick={handleGenerateItems} disabled={isAiGenerating || !aiItemKeywords} variant="outline" size="icon">
                                    {isAiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    <span className="sr-only">Generate</span>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">AI will generate the list in Roman Urdu.</p>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="items">Items to Take</Label>
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
                        <CardTitle className="font-headline">Active Plans</CardTitle>
                         <CardDescription>A log of the currently active (pending) plans.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-6">
                            {activeAssignments.map(assignment => (
                                <div key={assignment.id} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                        {assignment.salesmanName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{assignment.salesmanName}</p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-500" /> <strong>Location:</strong> {assignment.location}</p>
                                        </div>
                                         <p className="text-xs text-muted-foreground mt-1">Assigned on: {new Date(assignment.createdAt).toLocaleString()}</p>
                                    </div>
                                    {new Date(assignment.createdAt).toISOString().split('T')[0] === today && (
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href={`/assignments/edit/${assignment.id}`}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ))}
                             {activeAssignments.length === 0 && (
                                <p className="text-muted-foreground text-center">No active assignments found.</p>
                             )}
                       </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
