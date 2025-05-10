
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useWallet } from '@/contexts/wallet-context';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  const { currentUser, signOut, address, isConnected, loading } = useWallet(); 
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.AppLogo className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            ΣMFIRE By MintFire
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          {/* Add any public nav links here if needed */}
        </nav>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {isConnected && currentUser ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:block">
                {currentUser.name} ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'})
              </span>
              <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
                {loading && <Icons.Refresh className="mr-1 h-4 w-4 animate-spin" />}
                <Icons.Logout className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => router.push('/signin')} disabled={loading}>
              {loading && <Icons.Refresh className="mr-1 h-4 w-4 animate-spin" />}
              <Icons.Login className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

