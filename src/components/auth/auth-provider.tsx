
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
    if (loading) return; // Wait until loading is false

    const isPublic = publicRoutes.includes(pathname);

    // If user is not logged in and is trying to access a private route, redirect to login
    if (!user && !isPublic) {
      router.push('/login');
    }

    // If user is logged in and is on a public route, redirect to dashboard
    if (user && isPublic) {
        router.push('/');
    }
  }, [user, loading, router, pathname]);

  // Show a loader while authentication state is loading,
  // or if we're about to redirect.
  if (loading || (!user && !publicRoutes.includes(pathname)) || (user && publicRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
