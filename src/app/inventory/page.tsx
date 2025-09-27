import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button"
import { products } from "@/lib/data"
import { Droplets, Sparkles, FlaskConical, WashingMachine } from "lucide-react"
import { FarnielIcon } from "@/components/icons"
import PageHeader from "@/components/page-header"

const productIcons: { [key: string]: React.ElementType } = {
  Soap: Droplets,
  "Snow Powder": Sparkles,
  Bleach: FlaskConical,
  "Kampre (Laundry Powder)": WashingMachine,
  "Farniel (Toilet Cleaner)": FarnielIcon,
}

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Monitor and manage product stock levels."
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Icon</span>
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">
                  Stock
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const Icon = productIcons[product.name] || Droplets
                const isLowStock = product.stock < product.reorderLevel
                return (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-center bg-muted rounded-md h-12 w-12">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.sku}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${product.salePrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isLowStock ? (
                        <Badge variant="destructive">
                          {product.stock} (Low)
                        </Badge>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell>
                        <div className="flex justify-end">
                            <Button size="sm">Reorder</Button>
                        </div>
                    </TableCell>
                  </TableRow>
                )
              })}
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
