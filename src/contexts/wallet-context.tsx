
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types/secure-share';
import { getUsers as apiGetUsers } from '@/lib/mock-data';

interface WalletState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void; // Exposed for direct setting if needed
  availableUsers: User[]; // For the sign-in page
  address: string | null; // Derived from currentUser
  isConnected: boolean; // Derived from currentUser
  signIn: (user: User) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start true to load users
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const users = await apiGetUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const signIn = useCallback(async (user: User) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation
    setCurrentUser(user);
    toast({
      title: 'Signed In',
      description: `Welcome, ${user.name}! Address: ${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
    });
    router.push('/dashboard/manage-wallets');
    setLoading(false);
  }, [router, toast]);

  const signOut = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const userName = currentUser?.name;
      setCurrentUser(null);
      toast({
        title: 'Signed Out',
        description: userName ? `Goodbye, ${userName}!` : 'You have been signed out.',
      });
      router.push('/'); // Redirect to home page after sign out
      setLoading(false);
    }, 500);
  }, [currentUser, router, toast]);
  
  const address = useMemo(() => currentUser?.address || null, [currentUser]);
  const isConnected = useMemo(() => !!currentUser, [currentUser]); // "Connected" means signed in

  const value = useMemo(() => ({ 
    currentUser, 
    setCurrentUser, // Exposing setCurrentUser
    availableUsers,
    address, 
    isConnected, 
    signIn, 
    signOut, 
    loading 
  }), [currentUser, availableUsers, address, isConnected, signIn, signOut, loading]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = (): WalletState => {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
