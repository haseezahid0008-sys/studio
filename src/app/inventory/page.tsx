
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import PageHeader from "@/components/page-header"
import { products } from "@/lib/data"
import { Button } from "@/components/ui/button"

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Monitor and manage product stock levels."
        action={{
            href: "/inventory/new",
            label: "Add Product",
        }}
      />
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Products</CardTitle>
            <CardDescription>A list of all products in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden sm:table-cell">Unit</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.sku}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.unit}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">${product.salePrice.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={product.stock < product.reorderLevel ? "destructive" : "outline"}>
                        {product.stock < product.reorderLevel ? `Low Stock (${product.reorderLevel})` : "In Stock"}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="#">Edit</Link>
                      </Button>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
