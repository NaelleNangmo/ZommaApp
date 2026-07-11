import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { BackendProvider } from '@/contexts/backend-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZOMA SARL - Gestion des Dépôts',
  description: 'Application de gestion des dépôts de boissons ZOMA SARL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BackendProvider>
              {children}
              <Toaster richColors position="top-right" />
            </BackendProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}