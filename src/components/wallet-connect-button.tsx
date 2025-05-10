
'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useWallet } from '@/contexts/wallet-context';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation'; // Added for redirecting if already signed in

// This component is now more of a "SessionStatusButton" or similar,
// as actual sign-in action (selecting a user) is handled on the /signin page.
// It will primarily be used for displaying status or initiating sign-out from other locations if needed.
// For the /connect-wallet page, it's less relevant as that page redirects.

export function WalletConnectButton() {
  const { currentUser, address, isConnected, signOut, loading } = useWallet();
  const router = useRouter();

  if (isConnected && currentUser) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Badge variant="secondary" className="p-2 text-center">
          Signed in as: {currentUser.name} ({`${address?.slice(0, 6)}...${address?.slice(-4)}`})
        </Badge>
        <Button variant="outline" onClick={signOut} disabled={loading}>
          {loading && <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />}
          <Icons.Logout className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    );
  }

  // This button will navigate to the sign-in page if not connected.
  return (
    <Button onClick={() => router.push('/signin')} disabled={loading} size="lg" className="w-full">
      {loading ? (
        <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.Login className="mr-2 h-4 w-4" />
      )}
      Sign In to ΣMFIRE By MintFire
    </Button>
  );
}

