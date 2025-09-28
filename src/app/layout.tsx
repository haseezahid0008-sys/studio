
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { AuthContextProvider } from '@/hooks/use-auth';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { getAppSettings } from '@/lib/firestore';
import { SidebarProvider } from '@/components/ui/sidebar';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  return {
    title: settings.appName || 'JS Glow Dashboard',
    description: `Sales & Inventory Management for ${settings.appName || 'JS Glow'}`,
    icons: {
      icon: settings.favicon || '/favicon.ico',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <AuthContextProvider>
            <AuthProvider>
                <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <div className="flex flex-col flex-1">
                            <Header />
                            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                                {children}
                            </main>
                            <footer className="py-4 px-6 text-center text-xs text-muted-foreground">
                                Developed by <a href="http://waseemakram.wuaze.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-foreground">Waseem Akram</a>
                            </footer>
                        </div>
                    </div>
              </SidebarProvider>
              <Toaster />
            </AuthProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
