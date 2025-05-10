
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { createWallet as apiCreateWallet } from '@/lib/mock-data'; 
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/wallet-context'; // Import useWallet

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50, "Wallet name is too long"),
  initialOwners: z.array(z.object({ address: addressSchema })).min(1, "At least one owner is required"),
  threshold: z.coerce.number().int().positive("Threshold must be a positive number"),
}).refine(data => data.threshold <= data.initialOwners.length, {
  message: "Threshold cannot exceed the number of owners",
  path: ["threshold"],
}).refine(data => {
  const addresses = data.initialOwners.map(owner => owner.address.toLowerCase());
  return new Set(addresses).size === addresses.length;
}, {
  message: "Owner addresses must be unique",
  path: ["initialOwners"],
});

type CreateWalletFormData = z.infer<typeof createWalletSchema>;

export function CreateWalletForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser } = useWallet(); // Get currentUser from context

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<CreateWalletFormData>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: '',
      initialOwners: [{ address: '' }], // Default to one empty owner field
      threshold: 1,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "initialOwners",
  });

  const owners = watch("initialOwners");

  // Set current user as the first owner if available and fields are empty
  useEffect(() => {
    if (currentUser && currentUser.address) {
      // Check if initialOwners is just the default empty one
      if (fields.length === 1 && !fields[0].address) {
        replace([{ address: currentUser.address }]);
      } else if (!fields.some(field => field.address.toLowerCase() === currentUser.address.toLowerCase())) {
        // If current user is not in the list, consider adding them, or ensure the UI allows it.
        // For now, we assume the first field can be the current user or they can add themselves.
        // If defaultValues.initialOwners was `[{ address: currentUser?.address || '' }]`
        // and user changes it, this logic might need adjustment.
        // The primary goal here is pre-filling if possible.
      }
    }
  }, [currentUser, fields, replace]);


  const onSubmit = async (data: CreateWalletFormData) => {
    if (!currentUser) {
        toast({ title: "User not signed in", description: "Please sign in to create a wallet.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    try {
      // Ensure creator (currentUser) is among the owners if not already explicitly added
      const ownerAddresses = data.initialOwners.map(owner => owner.address);
      if (!ownerAddresses.some(addr => addr.toLowerCase() === currentUser.address.toLowerCase())) {
        ownerAddresses.push(currentUser.address); // Add creator if not present
      }
      // Remove duplicates that might occur if user added themselves manually and then we added them.
      const uniqueOwnerAddresses = Array.from(new Set(ownerAddresses.map(addr => addr.toLowerCase())));

      const newWallet = await apiCreateWallet(data.name, uniqueOwnerAddresses, data.threshold, currentUser);
      toast({
        title: "Wallet Created Successfully!",
        description: `Wallet "${newWallet.name}" (${newWallet.address.slice(0,6)}...) is ready.`,
      });
      // Consider refreshing the wallet list in ManageWalletsPage or redirecting.
      // For now, direct redirect is fine. A global state update for wallets might be better.
      router.push(`/dashboard/wallet/${newWallet.id}`); 
    } catch (error) {
      console.error("Failed to create wallet:", error);
      toast({
        title: "Error Creating Wallet",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Multi-Signature Wallet</CardTitle>
        <CardDescription>
          Set up your shared wallet by defining owners and the required confirmation threshold. You will be added as an owner.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g., Project Treasury, Family Savings" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Initial Owners</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2 mb-2">
                <Input
                  {...register(`initialOwners.${index}.address`)}
                  placeholder="0x... (Ethereum address)"
                  className="flex-grow"
                  // Disable if it's the current user's address to prevent accidental removal, or handle removal carefully
                  // disabled={field.address.toLowerCase() === currentUser?.address.toLowerCase()} 
                />
                {/* Allow removal only if it's not the current user's pre-filled address OR if there's more than one owner */}
                {(fields.length > 1 || field.address.toLowerCase() !== currentUser?.address.toLowerCase()) && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove owner" disabled={field.address.toLowerCase() === currentUser?.address.toLowerCase() && fields.length ===1}>
                    <Icons.Reject className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
             {errors.initialOwners && errors.initialOwners.root && <p className="text-sm text-destructive">{errors.initialOwners.root.message}</p>}
             {errors.initialOwners?.map((error, index) => error?.address && <p key={index} className="text-sm text-destructive my-1 ml-1">{error.address.message}</p>)}

            <Button type="button" variant="outline" size="sm" onClick={() => append({ address: '' })}>
              <Icons.PlusCircle className="mr-2 h-4 w-4" /> Add Another Owner
            </Button>
             <p className="text-xs text-muted-foreground mt-1">
                Your address ({currentUser?.address.slice(0,6)}...) will be automatically included as an owner if not listed.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="threshold">Confirmation Threshold (M of N)</Label>
            <Input 
              id="threshold" 
              type="number" 
              min="1"
              max={Math.max(1, owners.filter(o=>o.address).length || 1)} // Max is number of actual owners
              {...register("threshold")} 
            />
            {owners.filter(o=>o.address).length > 0 && <p className="text-sm text-muted-foreground">Requires {watch("threshold")} out of {owners.filter(o=>o.address).length} owner(s) to confirm.</p>}
            {errors.threshold && <p className="text-sm text-destructive">{errors.threshold.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !currentUser}>
            {isLoading ? (
              <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Wallet className="mr-2 h-4 w-4" />
            )}
            Create Wallet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
