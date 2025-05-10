
'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { CreateWalletForm } from '@/components/dashboard/create-wallet-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { MultiSigWallet, User, JoinRequest } from '@/types/secure-share';
import { getWalletsForUser as apiGetWalletsForUser, getWalletById as apiGetWalletById, requestToJoinWallet as apiRequestToJoinWallet, approveJoinRequest as apiApproveJoinRequest, denyJoinRequest as apiDenyJoinRequest, getWallets as apiGetWallets } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/wallet-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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


export default function ManageWalletsPage() {
  const [userWallets, setUserWallets] = useState<MultiSigWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinWalletAddressOrId, setJoinWalletAddressOrId] = useState('');
  const [searchedWallet, setSearchedWallet] = useState<MultiSigWallet | null>(null);
  const [isJoinRequestPending, setIsJoinRequestPending] = useState(false);
  const [isProcessingJoin, setIsProcessingJoin] = useState(false);
  
  const [walletsWithPendingRequests, setWalletsWithPendingRequests] = useState<MultiSigWallet[]>([]);


  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, loading: userLoading } = useWallet();

  const fetchUserWallets = useCallback(async () => {
    if (!currentUser || !currentUser.address) return;
    setIsLoading(true);
    const fetchedWallets = await apiGetWalletsForUser(currentUser.address);
    setUserWallets(fetchedWallets);
    
    // Fetch all wallets to check for pending requests where current user is an owner
    // const allWallets = await apiGetWalletById('').then(() => []); // This is a bit of a hack, ideally we have a get all wallets or similar
    // For now, iterate through known userWallets and refetch them to get full pending requests info
    const detailedUserWallets = await Promise.all(fetchedWallets.map(w => apiGetWalletById(w.id)));
    setWalletsWithPendingRequests(detailedUserWallets.filter(w => w && w.pendingJoinRequests && w.pendingJoinRequests.length > 0 && w.owners.some(o => o.address.toLowerCase() === currentUser.address.toLowerCase())) as MultiSigWallet[]);

    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchUserWallets();
    }
  }, [currentUser, userLoading, fetchUserWallets]);

  const handleSearchWalletToJoin = async () => {
    if (!joinWalletAddressOrId.trim() || !currentUser) {
      toast({ title: "Error", description: "Please enter a wallet address or ID.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSearchedWallet(null);
    setIsJoinRequestPending(false);

    const searchTerm = joinWalletAddressOrId.trim();
    // Attempt to find by ID first, then by address among all wallets (mocked by searching for current user's wallets as a proxy for "all")
    let wallet = await apiGetWalletById(searchTerm);
    if (!wallet) {
        const allMockWallets = await apiGetWallets(); // Fetch all wallets for address search
        wallet = allMockWallets.find(w => w.address.toLowerCase() === searchTerm.toLowerCase()) || null;
    }
    
    if (wallet) {
      setSearchedWallet(wallet);
      const isOwner = wallet.owners.some(o => o.address.toLowerCase() === currentUser.address.toLowerCase());
      if (isOwner) {
        router.push(`/dashboard/wallet/${wallet.id}`);
      } else {
        setIsJoinRequestPending(wallet.pendingJoinRequests?.some(req => req.userId === currentUser.id) || false);
      }
    } else {
      toast({ title: "Wallet Not Found", description: "Could not find a wallet with that address/ID.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleRequestToJoin = async () => {
    if (!searchedWallet || !currentUser) return;
    setIsProcessingJoin(true);
    const result = await apiRequestToJoinWallet(searchedWallet.id, currentUser);
    if ('error' in result) {
      toast({ title: "Join Request Failed", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Join Request Sent", description: `Your request to join "${result.name || result.address.slice(0,10)}" has been submitted.` });
      setSearchedWallet(result); // Update with potentially new pending requests list
      setIsJoinRequestPending(true);
      fetchUserWallets(); // Re-fetch to update lists if needed
    }
    setIsProcessingJoin(false);
  };

  const handleApproveDenyRequest = async (walletId: string, requestingUserId: string, action: 'approve' | 'deny') => {
    if(!currentUser) return;
    setIsProcessingJoin(true);
    const result = action === 'approve' 
      ? await apiApproveJoinRequest(walletId, requestingUserId, currentUser)
      : await apiDenyJoinRequest(walletId, requestingUserId, currentUser);

    if ('error' in result) {
      toast({ title: `${action === 'approve' ? 'Approval' : 'Denial'} Failed`, description: result.error, variant: "destructive" });
    } else {
      toast({ title: `Request ${action === 'approve' ? 'Approved' : 'Denied'}`, description: `The join request has been ${action === 'approve' ? 'approved' : 'denied'}.` });
      fetchUserWallets(); // Refresh lists
    }
    setIsProcessingJoin(false);
  }

  if (userLoading || (!currentUser && !isLoading)) {
     return <DashboardLayout><div className="flex items-center justify-center h-full"><Icons.Refresh className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-lg">Loading user data...</p></div></DashboardLayout>;
  }


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Wallets</h1>
          <p className="text-muted-foreground">
            Create new multi-signature wallets, access your existing ones, or manage join requests.
          </p>
        </div>

        {walletsWithPendingRequests.length > 0 && (
          <Card className="shadow-lg border-accent">
            <CardHeader>
              <CardTitle className="flex items-center text-accent"><Icons.Users className="mr-2 h-5 w-5" />Pending Join Requests</CardTitle>
              <CardDescription>Review and approve/deny requests to join wallets you own.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletsWithPendingRequests.map(wallet => (
                wallet.pendingJoinRequests && wallet.pendingJoinRequests.map(req => (
                <Card key={`${wallet.id}-${req.userId}`} className="p-4 bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold">{req.userName} ({req.userAddress.slice(0,6)}...{req.userAddress.slice(-4)})</p>
                      <p className="text-xs text-muted-foreground">Wants to join: <span className="font-medium">{wallet.name || wallet.address.slice(0,10)}</span></p>
                      <p className="text-xs text-muted-foreground">Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm" variant="outline" disabled={isProcessingJoin}>
                            <Icons.Confirm className="mr-1 h-4 w-4 text-green-500" /> Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Join Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve {req.userName}'s request to join {wallet.name || 'this wallet'}? They will become an owner.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleApproveDenyRequest(wallet.id, req.userId, 'approve')} className="bg-primary">Approve</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={isProcessingJoin}>
                            <Icons.Reject className="mr-1 h-4 w-4" /> Deny
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deny Join Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to deny {req.userName}'s request to join {wallet.name || 'this wallet'}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleApproveDenyRequest(wallet.id, req.userId, 'deny')} className="bg-destructive">Deny Request</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
                ))
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
             <CreateWalletForm />
          </div>
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Join Existing Wallet</CardTitle>
                <CardDescription>Enter the address or ID of a multi-sig wallet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input 
                  placeholder="Enter Wallet Address or ID" 
                  value={joinWalletAddressOrId}
                  onChange={(e) => setJoinWalletAddressOrId(e.target.value)}
                />
                <Button className="w-full" onClick={handleSearchWalletToJoin} disabled={isLoading}>
                  {isLoading && !searchedWallet ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Link className="mr-2 h-4 w-4" />} 
                  Search Wallet
                </Button>
                {searchedWallet && !searchedWallet.owners.some(o => o.address.toLowerCase() === currentUser?.address.toLowerCase()) && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold">Found: {searchedWallet.name || searchedWallet.address.slice(0,10)}</p>
                    <p className="text-xs text-muted-foreground">{searchedWallet.owners.length} owners, {searchedWallet.threshold} threshold</p>
                    {isJoinRequestPending ? (
                      <Badge variant="secondary" className="mt-2">Join Request Pending</Badge>
                    ) : (
                      <Button className="w-full mt-2" onClick={handleRequestToJoin} variant="outline" disabled={isProcessingJoin}>
                        {isProcessingJoin ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.PlusCircle className="mr-2 h-4 w-4" />}
                        Request to Join Wallet
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Wallets</CardTitle>
                <CardDescription>Quick access to wallets where you are an owner.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && userWallets.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <Icons.Refresh className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Loading your wallets...</p>
                  </div>
                ) : userWallets.length > 0 ? (
                  <ul className="space-y-3">
                    {userWallets.map((wallet) => (
                      <li key={wallet.id}>
                        <Button variant="outline" className="w-full justify-start text-left h-auto py-3" asChild>
                          <Link href={`/dashboard/wallet/${wallet.id}`}>
                            <span className="flex w-full items-center">
                              <Icons.Wallet className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                              <span className="flex-grow">
                                <p className="font-semibold truncate">{wallet.name || 'Unnamed Wallet'}</p>
                                <p className="text-xs text-muted-foreground truncate">{wallet.address}</p>
                                <p className="text-xs text-muted-foreground">
                                  {wallet.owners.length} Owners, {wallet.threshold} Threshold
                                </p>
                              </span>
                              <Icons.ArrowRight className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </span>
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No wallets found where you are an owner. Create one or join an existing wallet!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

