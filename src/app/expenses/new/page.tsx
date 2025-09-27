
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import { addExpense } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Expense } from "@/lib/types";

export default function NewExpensePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as Expense['category'];

    if (!category || !amount) {
        setError("Please fill out all required fields.");
        setIsLoading(false);
        return;
    }

    const newExpense = {
        date: formData.get('date') as string,
        category: category,
        amount: amount,
        notes: formData.get('notes') as string,
    };

    try {
        await addExpense(newExpense);
        toast({
            title: "Success",
            description: "Expense added successfully.",
        });
        router.push('/expenses');
    } catch (e) {
        console.error("Failed to add expense: ", e);
        setError("Failed to add expense. Please try again.");
        setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Add New Expense"
        description="Record a new business expense."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <form onSubmit={handleSubmit}>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Expense Details</CardTitle>
                <CardDescription>
                Fill in the details of the expense.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required disabled={isLoading}>
                    <SelectTrigger id="category" aria-label="Select category">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fuel">Fuel</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Salaries">Salaries</SelectItem>
                        <SelectItem value="Packing">Packing</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" placeholder="Enter amount" required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any relevant notes..."
                    disabled={isLoading}
                />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="receipt">Receipt (Optional)</Label>
                    <Input id="receipt" type="file" disabled={isLoading} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Expense
                    </Button>
                </div>
            </CardContent>
            </Card>
        </form>
      </div>
    </>
  )
}
