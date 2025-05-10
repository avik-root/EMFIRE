'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { WalletInfo } from '@/components/dashboard/wallet/wallet-info';
import { TransactionList } from '@/components/dashboard/wallet/transaction-list';
import { FundWalletForm } from '@/components/dashboard/wallet/fund-wallet-form';
import { Icons } from '@/components/icons';
import type { MultiSigWallet, Proposal } from '@/types/secure-share';
import { getWalletById, leaveWallet as apiLeaveWallet } from '@/lib/mock-data';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, buttonVariants } from '@/components/ui/button'; // Added buttonVariants
import Link from 'next/link';
import { useWallet as useAppWalletContext } from '@/contexts/wallet-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

export default function WalletDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, loading: userLoading } = useAppWalletContext(); // Use currentUser
  const { toast } = useToast();
  const walletId = params.walletId as string;

  const [wallet, setWallet] = useState<MultiSigWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const [isLeavingWallet, setIsLeavingWallet] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!walletId) return;
    setIsLoading(true);
    const fetchedWallet = await getWalletById(walletId as string);
    if (fetchedWallet) {
      fetchedWallet.proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const handleProposalUpdate = (updatedProposal: Proposal) => {
    fetchWalletData(); // Re-fetch wallet data to ensure consistency
  };
  

  const handleFundsAdded = (updatedWalletWithNewBalance: MultiSigWallet) => {
    setWallet(prevWallet => {
      if (!prevWallet || prevWallet.id !== updatedWalletWithNewBalance.id) return prevWallet;
      return { ...prevWallet, balance: updatedWalletWithNewBalance.balance, proposals: updatedWalletWithNewBalance.proposals };
    });
    //Also refetch to ensure proposals array etc. is up to date.
    fetchWalletData();
  };

  const handleOpenLeaveAlert = () => {
    setIsLeaveAlertOpen(true);
  };

  const handleLeaveWalletConfirmed = async () => {
    if (!wallet || !currentUser) return;
    setIsLeavingWallet(true);
    try {
      const updatedWallet = await apiLeaveWallet(wallet.id, currentUser.address); // Use currentUser.address
      if (updatedWallet) {
        toast({
          title: "Left Wallet Successfully",
          description: `You have left the wallet "${wallet.name || wallet.address.slice(0,10)}...".`,
        });
        router.push('/dashboard/manage-wallets');
      } else {
        // This 'else' might not be hit if apiLeaveWallet throws for errors or returns null for "not an owner"
        throw new Error("Failed to leave the wallet. You might not be an owner or an error occurred.");
      }
    } catch (error) {
      console.error("Failed to leave wallet:", error);
      toast({
        title: "Error Leaving Wallet",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLeavingWallet(false);
      setIsLeaveAlertOpen(false);
    }
  };

  if (isLoading || userLoading) { // Check userLoading as well
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Icons.Refresh className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Loading wallet details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!wallet || !currentUser) { // Ensure currentUser is also available
    // Fallback, though DashboardLayout should handle redirect if !currentUser
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Icons.Warning className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Wallet or User Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested wallet could not be loaded or user session is invalid.</p>
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
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <WalletInfo 
            wallet={wallet} 
            currentUserAddress={currentUser.address} // Pass currentUser.address
            onOpenLeaveAlert={handleOpenLeaveAlert}
            isLeavingWallet={isLeavingWallet}
          />
          <FundWalletForm wallet={wallet} onFundsAdded={handleFundsAdded} />
           <Button asChild className="w-full">
             <Link href={`/dashboard/wallet/${wallet.id}/propose`}>
               <Icons.Send className="mr-2 h-4 w-4" /> Propose New Transaction
             </Link>
           </Button>
        </div>
        <div className="md:col-span-2">
          <TransactionList wallet={wallet} proposals={wallet.proposals} onProposalUpdate={handleProposalUpdate} />
        </div>
      </div>

      <AlertDialog open={isLeaveAlertOpen} onOpenChange={setIsLeaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave this wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove you as an owner from "{wallet.name || wallet.address.slice(0,10)}...". 
              If this action makes the wallet's threshold unmeetable with the remaining owners, 
              the threshold may be automatically adjusted, or the wallet could become inoperable if you are the last owner.
              This action cannot be undone through this interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeavingWallet}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveWalletConfirmed} disabled={isLeavingWallet} className="bg-destructive hover:bg-destructive/90">
              {isLeavingWallet ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.UserMinus className="mr-2 h-4 w-4" />}
              Yes, Leave Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
