
'use client';
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
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { getProducts } from "@/lib/firestore";
import { Loader2 } from "lucide-react";


export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="hidden md:table-cell">Expiry Date</TableHead>
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
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">${product.salePrice.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={product.stock < product.reorderLevel ? "destructive" : "outline"}>
                        {product.stock < product.reorderLevel ? `Low Stock (${product.reorderLevel})` : "In Stock"}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inventory/edit/${product.id}`}>Edit</Link>
                      </Button>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
        {!isLoading && !error && (
            <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
            </div>
            </CardFooter>
        )}
      </Card>
    </>
  )
}
