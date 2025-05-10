
'use client';

import type { MultiSigWallet } from '@/types/secure-share';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WalletInfoProps {
  wallet: MultiSigWallet;
  currentUserAddress: string | null;
  onOpenLeaveAlert: () => void;
  isLeavingWallet: boolean;
}

export function WalletInfo({ wallet, currentUserAddress, onOpenLeaveAlert, isLeavingWallet }: WalletInfoProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} Copied!`, description: text });
    }).catch(err => {
      toast({ title: `Failed to copy ${label}`, description: String(err), variant: "destructive" });
    });
  };

  const isOwner = currentUserAddress && wallet.owners.some(o => o.address.toLowerCase() === currentUserAddress.toLowerCase());
  // Allow leaving even if the user is the last owner. The consequences (e.g., wallet becoming unusable) are handled by the system or are user's responsibility.
  // Or, to prevent last owner from leaving: const canLeave = isOwner && wallet.owners.length > 1;
  const canLeave = isOwner && wallet.owners.length > 0; 
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-2xl font-bold">{wallet.name || 'Multi-Signature Wallet'}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                    {wallet.address}
                    <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={() => copyToClipboard(wallet.address, 'Address')}>
                    <Icons.Copy className="h-3 w-3" />
                    </Button>
                </CardDescription>
            </div>
            <Icons.Wallet className="h-8 w-8 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <Separator />
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <div className="flex items-center">
            <Icons.Activity className="h-4 w-4 mr-2 text-primary" /> {/* Using Activity as ETH/Balance icon */}
            <span className="text-lg font-semibold">{wallet.balance} ETH</span>
          </div>
        </div>
         <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Threshold</span>
          <Badge variant="secondary" className="text-base">
            {wallet.threshold > 0 ? `${wallet.threshold} of ${wallet.owners.length}` : `0 of ${wallet.owners.length} (Inactive)`}
          </Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Owners ({wallet.owners.length}):</h4>
          <ScrollArea className="h-[80px]"> 
            {wallet.owners.length > 0 ? (
              <ul className="space-y-1 pr-3">
                {wallet.owners.map((owner, index) => (
                  <li key={index} className="text-sm flex items-center justify-between group">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate font-mono text-xs" style={{maxWidth: '200px'}}>{owner.address}</span>
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
              <p className="text-xs text-muted-foreground">No owners for this wallet.</p>
            )}
          </ScrollArea>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Created: {new Date(wallet.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
      {canLeave && (
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onOpenLeaveAlert}
            disabled={isLeavingWallet}
          >
            {isLeavingWallet ? (
              <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.UserMinus className="mr-2 h-4 w-4" />
            )}
            Leave Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
