'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { ProposeTransactionForm } from '@/components/dashboard/wallet/propose-transaction-form';
import { Icons } from '@/components/icons';
import type { MultiSigWallet, Proposal } from '@/types/secure-share';
import { getWalletById } from '@/lib/mock-data';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button'; // Added buttonVariants
import { useWallet as useAppWalletContext } from '@/contexts/wallet-context'; // Import new context
import { cn } from '@/lib/utils';

export default function ProposeTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, loading: userLoading } = useAppWalletContext(); // Use new context
  const walletId = params.walletId as string;

  const [wallet, setWallet] = useState<MultiSigWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletData = useCallback(async () => {
    if (!walletId) return;
    setIsLoading(true);
    const fetchedWallet = await getWalletById(walletId as string);
    if (fetchedWallet) {
      setWallet(fetchedWallet);
    } else {
      toast({ title: "Wallet Not Found", description: "Redirecting to manage wallets.", variant: "destructive" });
      router.push('/dashboard/manage-wallets');
    }
    setIsLoading(false);
  }, [walletId, router, toast]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleProposalCreated = (newProposal: Proposal) => {
    toast({
      title: "Proposal Submitted!",
      description: `Proposal ${newProposal.id.slice(0,8)}... successfully created. It may take a moment to appear in the list.`,
    });
    router.push(`/dashboard/wallet/${walletId}`); 
  };

  if (isLoading || userLoading) { // Also check userLoading
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Icons.Refresh className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Loading wallet details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!wallet || !currentUser) { // Also check currentUser
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Icons.Warning className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Wallet or User Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested wallet could not be loaded or user is not signed in.</p>
          <Link 
            href={currentUser ? "/dashboard/manage-wallets" : "/signin"}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            <Icons.Briefcase className="mr-2 h-4 w-4" /> Go to {currentUser ? "Manage Wallets" : "Sign In"}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentWallet={wallet}>
      <div className="max-w-2xl mx-auto">
        <ProposeTransactionForm wallet={wallet} onProposalCreated={handleProposalCreated} />
      </div>
    </DashboardLayout>
  );
}
