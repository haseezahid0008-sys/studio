
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

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        title="Add New Product"
        description="Add a new product to your inventory."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Product Details</CardTitle>
            <CardDescription>
              Fill in the details of the new product.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="e.g., Soap" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="e.g., JS-SOAP-01" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="e.g., piece" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input id="stock" type="number" placeholder="e.g., 100" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="cost-price">Cost Price</Label>
                <Input id="cost-price" type="number" placeholder="e.g., 0.50" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="sale-price">Sale Price</Label>
                <Input id="sale-price" type="number" placeholder="e.g., 1.00" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder-level">Reorder Level</Label>
              <Input id="reorder-level" type="number" placeholder="e.g., 20" />
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Product</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
