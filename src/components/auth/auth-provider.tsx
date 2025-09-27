
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/login', '/signup'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until Firebase has checked the auth state.
    }

    const isPublic = publicRoutes.includes(pathname);

    // If there's no user and the route is not public, redirect to login.
    if (!user && !isPublic) {
      router.push('/login');
    }

    // If there is a user and the route is public (like login/signup), redirect to the dashboard.
    if (user && isPublic) {
      router.push('/');
    }
  }, [user, loading, router, pathname]);
  
  const isPublic = publicRoutes.includes(pathname);

  // While loading, show a spinner.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If there's no user and we are on a private page, show a spinner while we redirect.
  if (!user && !isPublic) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      );
  }
  
    // If there is a user and we are on a public page, show a spinner while we redirect.
  if (user && isPublic) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      );
  }


  return <>{children}</>;
}
