
'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { DashboardSidebarNav } from './dashboard-sidebar-nav';
import type { MultiSigWallet } from '@/types/secure-share';

interface DashboardSidebarProps {
  className?: string;
  currentWallet?: MultiSigWallet | null;
}

export function DashboardSidebar({ className, currentWallet }: DashboardSidebarProps) {
  return (
    <div className={cn("h-full border-r bg-card", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard/manage-wallets" className="flex items-center gap-2 font-semibold">
            <Icons.AppLogo className="h-6 w-6 text-primary" />
            <span className="">ΣMFIRE By MintFire</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <DashboardSidebarNav currentWallet={currentWallet} />
        </div>
        {currentWallet && (
          <div className="mt-auto border-t p-4">
            <div className="text-xs text-muted-foreground">Current Wallet:</div>
            <div className="font-semibold truncate" title={currentWallet.name || currentWallet.address}>
              {currentWallet.name || `${currentWallet.address.slice(0,10)}...`}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentWallet.owners.length} Owners, {currentWallet.threshold} Threshold
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

