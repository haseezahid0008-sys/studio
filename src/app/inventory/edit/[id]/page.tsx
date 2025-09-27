
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
import type { Product } from "@/lib/types"
import { getProduct, updateProduct } from "@/lib/firestore"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await getProduct(params.id);
        if (productData) {
          setProduct(productData);
        } else {
          notFound();
        }
      } catch (err) {
        setError("Failed to fetch product data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const updatedData: Partial<Product> = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        unit: formData.get('unit') as string,
        stock: Number(formData.get('stock')),
        costPrice: Number(formData.get('cost-price')),
        salePrice: Number(formData.get('sale-price')),
        reorderLevel: Number(formData.get('reorder-level')),
    };

    try {
        await updateProduct(params.id, updatedData);
        toast({
            title: "Success",
            description: "Product updated successfully.",
        });
        router.push('/inventory');
    } catch (e) {
        console.error("Failed to update product: ", e);
        setError("Failed to update product. Please try again.");
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
        <form onSubmit={handleSubmit}>
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
                    <Input id="name" name="name" defaultValue={product.name} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" defaultValue={product.sku} required/>
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" defaultValue={product.unit} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={product.stock} required/>
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="cost-price">Cost Price</Label>
                    <Input id="cost-price" name="cost-price" type="number" defaultValue={product.costPrice} step="0.01" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="sale-price">Sale Price</Label>
                    <Input id="sale-price" name="sale-price" type="number" defaultValue={product.salePrice} step="0.01" required/>
                </div>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="reorder-level">Reorder Level</Label>
                <Input id="reorder-level" name="reorder-level" type="number" defaultValue={product.reorderLevel} required/>
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
