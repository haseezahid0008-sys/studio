
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarFooter,
} from '@/components/ui/sidebar';

import {
  LayoutGrid,
  DollarSign,
  Users,
  ClipboardCopy,
  ClipboardList,
  History,
  Wrench,
  BarChart,
  Package,
  Coins,
  FileText,
  AlertTriangle,
  Settings,
  Home,
  ShoppingCart,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { getAppSettings, getUser } from '@/lib/firestore';
import { useEffect, useState } from 'react';
import type { AppSettings, AppUser, Role } from '@/lib/types';
import { Button } from '../ui/button';

export const allNavItems = [
  { href: '/', icon: LayoutGrid, label: 'Dashboard', roles: ['Admin', 'Manager', 'Worker', 'Cashier', 'Salesman'] },
  { href: '/sales/new', icon: DollarSign, label: 'Sales Entry', roles: ['Admin', 'Manager', 'Cashier', 'Salesman'] },
  { href: '/sales', icon: ClipboardCopy, label: 'Sales Records', roles: ['Admin', 'Manager', 'Cashier', 'Salesman'] },
  { href: '/assignments', icon: ClipboardList, label: 'Salesman Plans', roles: ['Admin', 'Manager'] },
  { href: '/salesman-activity', icon: UserCheck, label: 'Salesman Activity', roles: ['Admin', 'Manager'] },
  { href: '/worker-tasks', icon: Wrench, label: 'Worker Tasks', roles: ['Admin', 'Manager'] },
  { href: '/worker-progress', icon: BarChart, label: 'Worker Progress', roles: ['Admin', 'Manager'] },
  { href: '/inventory', icon: Package, label: 'Inventory', roles: ['Admin', 'Manager', 'Worker'] },
  { href: '/expenses', icon: Coins, label: 'Expenses', roles: ['Admin', 'Manager', 'Cashier'] },
  { href: '/reports', icon: FileText, label: 'Reports', roles: ['Admin', 'Manager'] },
  { href: '/analysis', icon: AlertTriangle, label: 'P/L Analysis', roles: ['Admin', 'Manager'] },
];

const salesmanNavItems = [
    { href: '/', icon: LayoutGrid, label: 'Dashboard', roles: ['Salesman'] },
    { href: '/sales/new', icon: DollarSign, label: 'Sales Entry', roles: ['Salesman'] },
    { href: '/sales', icon: ClipboardCopy, label: 'Sales Records', roles: ['Salesman'] },
]

const workerNavItems = [
    { href: '/', icon: LayoutGrid, label: 'Dashboard', roles: ['Worker'] },
];

export function AppSidebar() {
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
      if (appUser.role === 'Salesman') {
        setNavItems(salesmanNavItems);
      } else if (appUser.role === 'Worker') {
          setNavItems(workerNavItems);
      }
       else {
        const filteredItems = allNavItems.filter(item => item.roles.includes(appUser.role as Role));
        setNavItems(filteredItems);
      }
    }
  }, [appUser]);

  const logoUrl = theme === 'dark' ? settings?.logoDark : settings?.logoLight;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;


  return (
    <Sidebar>
        <SidebarHeader>
             <div className="flex items-center gap-2">
                {logoUrl && <Image src={logoUrl} alt="Logo" width={32} height={32} />}
                <h1 className="text-xl font-bold font-headline">{settings?.appName || 'GLOW'}</h1>
             </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navItems.map((item) => (
                     <SidebarMenuItem key={item.href}>
                         <Link href={item.href}>
                             <SidebarMenuButton
                                isActive={pathname === item.href}
                                >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                         </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/settings">
                        <SidebarMenuButton
                            isActive={pathname === '/settings'}
                            >
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
