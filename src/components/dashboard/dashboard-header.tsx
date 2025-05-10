
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useWallet } from '@/contexts/wallet-context';
import Link from 'next/link';
import { DashboardSidebarNav } from './dashboard-sidebar-nav'; 
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardHeader() {
  const { currentUser, signOut, address, loading } = useWallet(); 

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icons.Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="mb-4 flex items-center space-x-2 px-4">
                <Icons.AppLogo className="h-6 w-6 text-primary" />
                <span className="font-bold">ΣMFIRE By MintFire</span>
              </Link>
              <div className="overflow-y-auto">
                <DashboardSidebarNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {currentUser && (
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                {currentUser.name} ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''})
              </span>
            )}
            <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
              {loading ? <Icons.Refresh className="mr-1 h-4 w-4 animate-spin" /> : <Icons.Logout className="mr-1 h-4 w-4" />}
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

