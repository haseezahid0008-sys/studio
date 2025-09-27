
'use client';

import {
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Package2,
  FileText,
  BrainCircuit,
  Coins,
  Settings,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { getAppSettings, getUser } from '@/lib/firestore';
import { useEffect, useState } from 'react';
import type { AppSettings, AppUser } from '@/lib/types';

export const allNavItems = [
  { href: '/', icon: Home, label: 'Dashboard', roles: ['Admin', 'Manager', 'Worker', 'Cashier', 'Salesman'] },
  { href: '/sales', icon: ShoppingCart, label: 'Sales', roles: ['Admin', 'Manager', 'Cashier', 'Salesman'] },
  { href: '/inventory', icon: Package, label: 'Inventory', roles: ['Admin', 'Manager', 'Worker'] },
  { href: '/expenses', icon: Coins, label: 'Expenses', roles: ['Admin', 'Manager', 'Cashier'] },
  { href: '/assignments', icon: ClipboardList, label: 'Salesman Plan', roles: ['Admin', 'Manager'] },
  { href: '/salesman-activity', icon: Users2, label: 'Salesman Activity', roles: ['Admin', 'Manager'] },
  { href: '/reports', icon: FileText, label: 'Reports', roles: ['Admin', 'Manager'] },
  { href: '/analysis', icon: BrainCircuit, label: 'P/L Analysis', roles: ['Admin', 'Manager'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [navItems, setNavItems] = useState(allNavItems);


  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
        if(user) {
            const userData = await getUser(user.uid);
            setAppUser(userData);
        }
    }
    fetchUser();
  }, [user]);

  useEffect(() => {
    if (appUser?.role) {
      const filteredItems = allNavItems.filter(item => item.roles.includes(appUser.role!));
      setNavItems(filteredItems);
    }
  }, [appUser]);

  const logoUrl = theme === 'dark' ? settings?.logoDark : settings?.logoLight;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;


  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          {logoUrl ? (
             <Image src={logoUrl} alt="Logo" width={32} height={32} className="transition-all group-hover:scale-110" />
          ) : (
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          )}
          <span className="sr-only">{settings?.appName || 'JS Glow'}</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname === item.href &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
       <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    pathname === '/settings' &&
                      'bg-accent text-accent-foreground'
                  )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
