'use client'

import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  showBackButton?: boolean;
};

export default function PageHeader({ title, description, action, showBackButton }: PageHeaderProps) {
  const router = useRouter();
  
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
