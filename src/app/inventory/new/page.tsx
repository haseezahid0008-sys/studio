
'use client';

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { addProduct } from "@/lib/firestore";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewProductPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;

        // Auto-generate SKU
        const sku = `${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const newProduct = {
            name,
            sku,
            unit: formData.get('unit') as string,
            stock: Number(formData.get('stock')),
            costPrice: Number(formData.get('cost-price')),
            salePrice: Number(formData.get('sale-price')),
            reorderLevel: Number(formData.get('reorder-level')),
            expiryDate: formData.get('expiry-date') as string,
        };

        try {
            await addProduct(newProduct);
            toast({
                title: "Success",
                description: "Product added successfully.",
            });
            router.push('/inventory');
        } catch (e) {
            console.error("Failed to add product: ", e);
            setError("Failed to add product. Please try again.");
            setIsLoading(false);
        }
    }


  return (
    <>
      <PageHeader
        title="Add New Product"
        description="Add a new product to your inventory."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-1">
        <form onSubmit={handleSubmit}>
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
                        <Input id="name" name="name" placeholder="e.g., Soap" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" name="unit" placeholder="e.g., piece" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input id="stock" name="stock" type="number" placeholder="e.g., 100" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="reorder-level">Reorder Level</Label>
                        <Input id="reorder-level" name="reorder-level" type="number" placeholder="e.g., 20" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cost-price">Cost Price</Label>
                        <Input id="cost-price" name="cost-price" type="number" placeholder="e.g., 0.50" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sale-price">Sale Price</Label>
                        <Input id="sale-price" name="sale-price" type="number" placeholder="e.g., 1.00" step="0.01" required />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                    <Input id="expiry-date" name="expiry-date" type="date" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Product
                    </Button>
                </div>
            </CardContent>
            </Card>
        </form>
      </div>
    </>
  )
}
