import { Package } from "lucide-react";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Monitor and manage product stock levels."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
        <div className="flex flex-col items-center gap-2 text-center max-w-md">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight font-headline">
            Inventory Management Coming Soon
          </h3>
          <p className="text-muted-foreground px-4">
            We are working hard to bring you a comprehensive inventory management system. Track your stock, manage reorders, and get notified for low inventory levels.
          </p>
        </div>
      </div>
    </>
  );
}
