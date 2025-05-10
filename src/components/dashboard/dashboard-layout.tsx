
'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { useWallet } from '@/contexts/wallet-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import type { MultiSigWallet } from '@/types/secure-share';
import { Icons } from '@/components/icons'; // For loader

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentWallet?: MultiSigWallet | null; // Optional prop for context-aware sidebar
}

export default function DashboardLayout({ children, currentWallet }: DashboardLayoutProps) {
  const { isConnected, loading: contextLoading, currentUser } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!contextLoading && !isConnected) {
      router.replace('/signin'); // Redirect to sign-in page
    }
  }, [isConnected, contextLoading, router]);

  if (contextLoading || !currentUser) { // Show loader if context is loading or currentUser isn't set yet
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Icons.Refresh className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  // isConnected is true here because currentUser is set
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <DashboardSidebar currentWallet={currentWallet} />
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
