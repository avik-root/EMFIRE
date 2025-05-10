
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import type { MultiSigWallet } from '@/types/secure-share';
import { addFundsToWallet as apiAddFundsToWallet } from '@/lib/mock-data';

const fundWalletSchema = z.object({
  amount: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Amount must be a positive number",
  }),
});

type FundWalletFormData = z.infer<typeof fundWalletSchema>;

interface FundWalletFormProps {
  wallet: MultiSigWallet;
  onFundsAdded: (updatedWallet: MultiSigWallet) => void;
}

export function FundWalletForm({ wallet, onFundsAdded }: FundWalletFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FundWalletFormData>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: {
      amount: '',
    },
  });

  const onSubmit = async (formData: FundWalletFormData) => {
    setIsLoading(true);
    try {
      const updatedWallet = await apiAddFundsToWallet(wallet.id, formData.amount);
      if (updatedWallet) {
        toast({
          title: "Funds Added Successfully!",
          description: `${formData.amount} ETH added to wallet "${wallet.name || wallet.address.slice(0,6)+ '...'}". New balance: ${updatedWallet.balance} ETH.`,
        });
        onFundsAdded(updatedWallet);
        reset();
      } else {
        throw new Error("Failed to add funds via API.");
      }
    } catch (error) {
      console.error("Failed to add funds:", error);
      toast({
        title: "Funding Failed",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Fund Wallet</CardTitle>
        <CardDescription>
          Add ETH to this multi-signature wallet. This action is typically a direct transfer on the blockchain.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input id="amount" {...register("amount")} type="text" placeholder="e.g., 1.25" />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>
          <p className="text-xs text-muted-foreground">
            Funds will be added to: <span className="font-mono">{wallet.address}</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.PlusCircle className="mr-2 h-4 w-4" /> /* Using PlusCircle for funding */
            )}
            Add Funds
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
