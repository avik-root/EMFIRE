
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/wallet-context';
import { useEffect } from 'react';
import type { User } from '@/types/secure-share';
import Image from 'next/image';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isConnected, availableUsers, loading: contextLoading } = useWallet();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard/manage-wallets');
    }
  }, [isConnected, router]);

  const handleSignIn = async (user: User) => {
    await signIn(user);
  };

  if (contextLoading && availableUsers.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
           <Icons.Refresh className="h-10 w-10 animate-spin text-primary" />
           <p className="ml-3 text-lg">Loading users...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-secondary/20">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8 text-center">
            <Icons.Users className="mx-auto h-12 w-12 mb-3" />
            <CardTitle className="text-3xl font-bold">Sign In to ΣMFIRE By MintFire</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base pt-1">
              Select a mock user profile to proceed. This simulates user authentication for demonstration.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {availableUsers.length > 0 ? (
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {availableUsers.map((user) => (
                  <li key={user.id}>
                    <Button
                      onClick={() => handleSignIn(user)}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent/20"
                      disabled={contextLoading}
                    >
                      <Icons.User className="mr-3 h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.address}</p>
                      </div>
                      {contextLoading ? <Icons.Refresh className="ml-auto h-4 w-4 animate-spin" /> : <Icons.ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No mock users available. Please check configuration.</p>
            )}
            
            <div className="flex items-center justify-center pt-4">
                <Image 
                    src="https://picsum.photos/300/150?random=signin" 
                    alt="Secure login illustration"
                    width={300}
                    height={150}
                    className="rounded-lg shadow-md opacity-80"
                    data-ai-hint="secure login"
                />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-6 border-t">
            <Button variant="link" className="text-sm w-full text-muted-foreground hover:text-primary" asChild>
              <Link href="/">
                <Icons.ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

