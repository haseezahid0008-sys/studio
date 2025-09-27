
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
import { products } from "@/lib/data"
import { notFound } from "next/navigation"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit ${product.name}`}
        description="Update the details of your product."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Product Details</CardTitle>
            <CardDescription>
              Modify the details of the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" defaultValue={product.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" defaultValue={product.sku} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" defaultValue={product.unit} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" defaultValue={product.stock} />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="cost-price">Cost Price</Label>
                <Input id="cost-price" type="number" defaultValue={product.costPrice} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="sale-price">Sale Price</Label>
                <Input id="sale-price" type="number" defaultValue={product.salePrice} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder-level">Reorder Level</Label>
              <Input id="reorder-level" type="number" defaultValue={product.reorderLevel} />
            </div>
             <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
