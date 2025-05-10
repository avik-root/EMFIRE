'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Icons } from '@/components/icons';
import type { MultiSigWallet, JoinRequest, User } from '@/types/secure-share';
import { getWalletById, approveJoinRequest, denyJoinRequest } from '@/lib/mock-data';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button'; // Added buttonVariants
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWallet as useAppWalletContext } from '@/contexts/wallet-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

export default function WalletOwnersSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, loading: userLoading } = useAppWalletContext();
  const walletId = params.walletId as string;

  const [wallet, setWallet] = useState<MultiSigWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingJoinAction, setIsProcessingJoinAction] = useState(false);

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

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
        toast({ title: `${label} Copied!`, description: text });
        }).catch(err => {
        toast({ title: `Failed to copy ${label}`, description: String(err), variant: "destructive" });
        });
    } else {
        toast({ title: "Clipboard Error", description: "Clipboard API not available.", variant: "destructive" });
    }
  };

  const handleApproveDenyRequest = async (requestingUserId: string, action: 'approve' | 'deny') => {
    if (!wallet || !currentUser) return;
    setIsProcessingJoinAction(true);
    const result = action === 'approve'
      ? await approveJoinRequest(wallet.id, requestingUserId, currentUser)
      : await denyJoinRequest(wallet.id, requestingUserId, currentUser);

    if ('error' in result) {
      toast({ title: `${action === 'approve' ? 'Approval' : 'Denial'} Failed`, description: result.error, variant: "destructive" });
    } else {
      toast({ title: `Request ${action === 'approve' ? 'Approved' : 'Denied'}`, description: `The join request has been processed.` });
      setWallet(result); // Update wallet state with new owner list / removed request
    }
    setIsProcessingJoinAction(false);
  };


  if (isLoading || userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Icons.Refresh className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Loading wallet details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!wallet) {
    // This case should be handled by redirect in fetchWalletData, but as a fallback
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Icons.Warning className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Wallet Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested wallet could not be loaded.</p>
          <Link 
            href="/dashboard/manage-wallets"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            <Icons.Briefcase className="mr-2 h-4 w-4" /> Go to Manage Wallets
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  const isCurrentUserAnOwner = currentUser && wallet.owners.some(owner => owner.address.toLowerCase() === currentUser.address.toLowerCase());

  return (
    <DashboardLayout currentWallet={wallet}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Icons.Settings className="mr-3 h-6 w-6 text-primary" />
                  Owners & Settings
                </CardTitle>
                <CardDescription>View details, ownership, and manage join requests for '{wallet.name || 'Unnamed Wallet'}'.</CardDescription>
              </div>
              <Icons.Wallet className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Wallet Information</h3>
              <Separator className="mb-3"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{wallet.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Address:</span>
                  <div className="flex items-center">
                    <span className="font-mono text-xs truncate" title={wallet.address}>{wallet.address}</span>
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => copyToClipboard(wallet.address, 'Wallet Address')}>
                      <Icons.Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>{wallet.balance} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(wallet.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1">Ownership & Threshold</h3>
              <Separator className="mb-3"/>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmation Threshold:</span>
                  <Badge variant="secondary" className="text-base">
                    {wallet.threshold} of {wallet.owners.length}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Owners ({wallet.owners.length}):</h4>
                  <ScrollArea className="h-[120px] border rounded-md p-2 bg-muted/30"> 
                    {wallet.owners.length > 0 ? (
                      <ul className="space-y-1">
                        {wallet.owners.map((owner, index) => (
                          <li key={index} className="text-sm flex items-center justify-between group py-1.5 px-2 hover:bg-background rounded-md transition-colors">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center truncate">
                                    <Icons.User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"/>
                                    <span className="font-mono text-xs truncate" title={owner.address}>{owner.address}</span>
                                    {currentUser && owner.address.toLowerCase() === currentUser.address.toLowerCase() && (
                                      <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5">You</Badge>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{owner.address}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button variant="ghost" size="icon" className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(owner.address, 'Owner Address')}>
                              <Icons.Copy className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-center text-muted-foreground py-4">No owners configured for this wallet.</p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            {isCurrentUserAnOwner && wallet.pendingJoinRequests && wallet.pendingJoinRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-accent">Pending Join Requests</h3>
                <Separator className="mb-3"/>
                <ScrollArea className="h-[150px] border rounded-md p-2 bg-muted/20">
                  <ul className="space-y-3">
                    {wallet.pendingJoinRequests.map((req) => (
                      <li key={req.userId} className="p-3 border rounded-md bg-card shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <p className="font-semibold text-sm">{req.userName}</p>
                                <p className="text-xs text-muted-foreground font-mono" title={req.userAddress}>{req.userAddress}</p>
                                <p className="text-xs text-muted-foreground">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="outline" disabled={isProcessingJoinAction}>
                                            <Icons.Confirm className="mr-1 h-3 w-3 text-green-600"/> Approve
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Approve Join Request?</AlertDialogTitle>
                                        <AlertDialogDescription>Approve {req.userName} to become an owner of this wallet?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleApproveDenyRequest(req.userId, 'approve')} className="bg-primary">Approve</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" disabled={isProcessingJoinAction}>
                                            <Icons.Reject className="mr-1 h-3 w-3"/> Deny
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Deny Join Request?</AlertDialogTitle>
                                        <AlertDialogDescription>Deny {req.userName}'s request to join this wallet?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleApproveDenyRequest(req.userId, 'deny')} className="bg-destructive">Deny</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}


          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button variant="outline" className="w-full" disabled> {/* Future: onClick={() => router.push(`/dashboard/wallet/${walletId}/edit-settings`)} */}
              <Icons.Settings className="mr-2 h-4 w-4" /> Edit Wallet Settings (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
