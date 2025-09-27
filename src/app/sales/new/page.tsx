
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Loader2 } from "lucide-react"
import { getProducts, getSalesmen, addSale } from "@/lib/firestore"
import type { Product, Salesman } from "@/lib/types"
import PageHeader from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"

type SaleItem = {
  productId: string
  quantity: number
  unitPrice: number
  total: number
}

export default function NewSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salesmanId, setSalesmanId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const [items, setItems] = useState<SaleItem[]>([
    { productId: "", quantity: 1, unitPrice: 0, total: 0 },
  ])
  const [discount, setDiscount] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)

  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, salesmenData] = await Promise.all([getProducts(), getSalesmen()]);
        setProducts(productsData);
        setSalesmen(salesmenData);
      } catch (err) {
        setError("Failed to load necessary data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + item.total, 0)
    setSubtotal(newSubtotal)
  }, [items])

  useEffect(() => {
    const newTotal = subtotal - discount
    setTotal(newTotal)
  }, [subtotal, discount])

  useEffect(() => {
    const newPending = total - amountPaid
    setPendingAmount(newPending)
  }, [total, amountPaid])

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items]
    const currentItem = { ...newItems[index] }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      currentItem.productId = value
      currentItem.unitPrice = product?.salePrice || 0
    } else {
      (currentItem[field] as any) = value
    }

    currentItem.total = currentItem.quantity * currentItem.unitPrice
    newItems[index] = currentItem
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleSubmit = async () => {
      if (!salesmanId || !customerName || items.some(i => !i.productId)) {
          setError("Please fill all required fields: Salesman, Customer Name, and select products for all items.");
          return;
      }
      setIsSaving(true);
      setError(null);

      const salesman = salesmen.find(s => s.id === salesmanId);

      const newSale = {
          date: saleDate,
          salesmanName: salesman?.name || 'N/A',
          customerName,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
          discount,
          total,
          amountPaid,
      };

      try {
          await addSale(newSale);
          toast({
              title: "Success",
              description: "Sale recorded successfully.",
          });
          router.push('/sales');
      } catch (e) {
          console.error("Failed to add sale: ", e);
          setError("Failed to record sale. Please try again.");
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
  
  return (
    <>
      <PageHeader
        title="Create New Sale"
        description="Fill out the form to record a new sale."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Sale Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salesman">Salesman</Label>
                  <Select value={salesmanId} onValueChange={setSalesmanId} disabled={isSaving}>
                    <SelectTrigger id="salesman">
                      <SelectValue placeholder="Select salesman" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesmen.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input id="customer" placeholder="Enter customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={isSaving}/>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Sale Date</Label>
                <Input id="date" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} disabled={isSaving}/>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Products</CardTitle>
              <CardDescription>Add products to the sale.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_120px_auto] items-end gap-2">
                  <div className="grid gap-1">
                    {index === 0 && <Label>Product</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, "productId", value)}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    {index === 0 && <Label>Quantity</Label>}
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                       disabled={isSaving}
                    />
                  </div>
                  <div className="grid gap-1">
                    {index === 0 && <Label>Unit Price</Label>}
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                       disabled={isSaving}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1 || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} disabled={isSaving}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} disabled={isSaving}/>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount-paid">Amount Paid</Label>
                <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} disabled={isSaving} />
              </div>
              <div className="flex justify-between text-destructive font-bold text-lg">
                <span>Pending Amount</span>
                <span>${pendingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Sale
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
