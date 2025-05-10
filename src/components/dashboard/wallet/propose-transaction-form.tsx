
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import type { MultiSigWallet, Proposal } from '@/types/secure-share';
import { addProposal as apiAddProposal } from '@/lib/mock-data';
import { useWallet as useAppWalletContext } from '@/contexts/wallet-context'; // Use new context

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");
const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]*$/, "Invalid hex string (must start with 0x)");

const proposeTransactionSchema = z.object({
  to: addressSchema,
  value: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Value must be a non-negative number",
  }),
  data: hexStringSchema.optional().default('0x'),
});

type ProposeTransactionFormData = z.infer<typeof proposeTransactionSchema>;

interface ProposeTransactionFormProps {
  wallet: MultiSigWallet;
  onProposalCreated: (newProposal: Proposal) => void;
}

export function ProposeTransactionForm({ wallet, onProposalCreated }: ProposeTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAppWalletContext(); // Use new context
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.address && wallet && wallet.owners) {
      setIsOwner(wallet.owners.some(o => o.address.toLowerCase() === currentUser.address.toLowerCase()));
    } else {
      setIsOwner(false);
    }
  }, [currentUser, wallet]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProposeTransactionFormData>({
    resolver: zodResolver(proposeTransactionSchema),
    defaultValues: {
      to: '',
      value: '0',
      data: '0x',
    },
  });

  const onSubmit = async (formData: ProposeTransactionFormData) => {
    if (!currentUser || !currentUser.address) { // Check currentUser and its address
      toast({ title: "Error", description: "User not signed in.", variant: "destructive" });
      return;
    }
    if (!isOwner) {
        toast({ title: "Unauthorized", description: "You are not an owner of this wallet and cannot propose transactions.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      const proposalData = {
        proposer: currentUser.address, // Use currentUser.address as proposer
        to: formData.to,
        value: formData.value, 
        data: formData.data || '0x',
      };
      const newProposal = await apiAddProposal(wallet.id, proposalData);
      if (newProposal) {
        onProposalCreated(newProposal); 
        reset();
      } else {
        throw new Error("Failed to create proposal via API.");
      }
    } catch (error) {
      console.error("Failed to propose transaction:", error);
      toast({
        title: "Proposal Failed",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) { // If no currentUser, show a generic message or loading.
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Propose New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Please sign in to propose transactions.</p>
            </CardContent>
        </Card>
    );
  }

  if (!isOwner) { // Check isOwner after ensuring currentUser exists
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Propose New Transaction</CardTitle>
                <CardDescription>
                Submit a transaction for approval by the wallet owners.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center p-4 bg-muted rounded-md border border-dashed">
                    <Icons.Warning className="h-6 w-6 mr-3 text-destructive flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">You must be an owner of this wallet to propose transactions. Your current account ({currentUser.address.slice(0,6)}...) is not an owner.</p>
                </div>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Propose New Transaction</CardTitle>
        <CardDescription>
          Submit a transaction for approval by the wallet owners.
          It will require {wallet.threshold} confirmation(s).
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="to">Recipient Address (To)</Label>
            <Input id="to" {...register("to")} placeholder="0x..." />
            {errors.to && <p className="text-sm text-destructive">{errors.to.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="value">Value (ETH)</Label>
            <Input id="value" {...register("value")} type="text" placeholder="0.0" />
            {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="data">Transaction Data (Hex)</Label>
            <Textarea id="data" {...register("data")} placeholder="0x... (optional for contract interactions)" rows={3} />
            {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !isOwner || !currentUser.address}>
            {isLoading ? (
              <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Send className="mr-2 h-4 w-4" />
            )}
            Propose Transaction
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
