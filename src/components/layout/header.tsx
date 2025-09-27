
'use client';

import {
  Home,
  Search,
  User,
  LogOut,
  Settings,
  LayoutGrid,
  DollarSign,
  ClipboardCopy,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { allNavItems } from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { getAppSettings, getUser } from '@/lib/firestore';
import type { AppSettings, AppUser, Role } from '@/lib/types';
import { SidebarTrigger } from '../ui/sidebar';

const salesmanNavItems = [
    { href: '/', icon: LayoutGrid, label: 'Dashboard', roles: ['Salesman'] },
    { href: '/sales/new', icon: DollarSign, label: 'Sales Entry', roles: ['Salesman'] },
    { href: '/sales', icon: ClipboardCopy, label: 'Sales Records', roles: ['Salesman'] },
]

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
      } else {
        const filteredItems = allNavItems.filter(item => item.roles.includes(appUser.role as Role));
        setNavItems(filteredItems);
      }
    }
  }, [appUser]);


  const logoUrl = theme === 'dark' ? settings?.logoDark : settings?.logoLight;
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) return null;


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathname.split('/').filter(Boolean).map((segment, index) => (
             <React.Fragment key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage className="capitalize font-headline">
                  {segment.replace('-', ' ')}
                </BreadcrumbPage>
              </BreadcrumbItem>
             </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName || user?.email || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
