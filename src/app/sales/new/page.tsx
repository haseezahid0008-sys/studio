
"use client"

import { useState, useEffect } from "react"
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
import { PlusCircle, Trash2 } from "lucide-react"
import { products, salesmen } from "@/lib/data"
import PageHeader from "@/components/page-header"

type SaleItem = {
  productId: string
  quantity: number
  unitPrice: number
  total: number
}

export default function NewSalePage() {
  const [items, setItems] = useState<SaleItem[]>([
    { productId: "", quantity: 1, unitPrice: 0, total: 0 },
  ])
  const [discount, setDiscount] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)

  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)

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
                  <Select>
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
                  <Input id="customer" placeholder="Enter customer name" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Sale Date</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
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
                    />
                  </div>
                  <div className="grid gap-1">
                    {index === 0 && <Label>Unit Price</Label>}
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}>
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
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount-paid">Amount Paid</Label>
                <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between text-destructive font-bold text-lg">
                <span>Pending Amount</span>
                <span>${pendingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Sale</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
