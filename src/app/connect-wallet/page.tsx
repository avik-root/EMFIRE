
'use client';

import { useWallet } from '@/contexts/wallet-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Icons } from '@/components/icons';

export default function ConnectWalletPage() {
  const { isConnected, loading } = useWallet(); // isConnected now means currentUser is set
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isConnected) {
        router.push('/dashboard/manage-wallets');
      } else {
        router.push('/signin'); // Redirect to new sign-in page
      }
    }
  }, [isConnected, loading, router]);

  // Display a loading state or a message while redirecting
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Icons.Refresh className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Redirecting...</p>
      </main>
      <SiteFooter />
    </div>
  );
}
