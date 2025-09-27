
'use client';

import { useState, useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { getAppSettings } from '@/lib/firestore';
import type { AppSettings, Role } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLES } from '@/lib/types';


export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const logoUrl = theme === 'dark' ? settings?.authLogoDark : settings?.authLogoLight;

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) {
        setError('Please select a role.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signup(email, password, role);
      router.push('/');
    } catch (error) {
      setError('Failed to sign up. The email might already be in use.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (settings === null) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      )
  }

  if (!settings.signupVisible) {
      notFound();
  }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1200x900/000000/FFFFFF/png"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="abstract pattern"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
             {logoUrl && <Image src={logoUrl} alt="Logo" width={48} height={48} className="mx-auto" />}
            <h1 className="text-3xl font-bold font-headline">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Create an account to get started.
            </p>
          </div>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as Role)} required disabled={isLoading}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
