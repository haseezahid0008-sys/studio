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

export default function NewExpensePage() {
  return (
    <>
      <PageHeader
        title="Add New Expense"
        description="Record a new business expense."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
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
                <Input id="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category" aria-label="Select category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="salaries">Salaries</SelectItem>
                    <SelectItem value="packing">Packing</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="Enter amount" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant notes..."
              />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="receipt">Receipt (Optional)</Label>
                <Input id="receipt" type="file" />
             </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Expense</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
