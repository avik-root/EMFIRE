
'use client';

import type { Proposal, MultiSigWallet, Confirmation } from '@/types/secure-share';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { confirmProposal as apiConfirmProposal, executeProposal as apiExecuteProposal } from '@/lib/mock-data';
import { useWallet as useAppWalletContext } from '@/contexts/wallet-context'; // Use new context
import { useState } from 'react';
import { AiRiskAssessment } from './ai-risk-assessment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransactionListProps {
  wallet: MultiSigWallet;
  proposals: Proposal[];
  onProposalUpdate: (updatedProposal: Proposal) => void; 
}

export function TransactionList({ wallet, proposals, onProposalUpdate }: TransactionListProps) {
  const { toast } = useToast();
  const { currentUser } = useAppWalletContext(); // Use new context
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

  const connectedAddress = currentUser?.address; // Get address from currentUser

  const handleConfirm = async (proposalId: string) => {
    if (!connectedAddress) return;
    setLoadingStates(prev => ({...prev, [`confirm-${proposalId}`]: true}));
    try {
      const updatedProposal = await apiConfirmProposal(wallet.id, proposalId, connectedAddress);
      if (updatedProposal) {
        onProposalUpdate(updatedProposal);
        toast({ title: 'Transaction Confirmed!', description: `You confirmed proposal ${proposalId.slice(0,6)}...` });
      } else {
         const currentProposal = proposals.find(p => p.id === proposalId);
         if (currentProposal?.confirmations.some(c => c.ownerAddress.toLowerCase() === connectedAddress.toLowerCase())) {
            toast({ title: 'Already Confirmed', description: `You have already confirmed proposal ${proposalId.slice(0,6)}...`, variant: 'default' });
         } else {
            throw new Error("Confirmation failed. The proposal may not exist or an issue occurred.");
         }
      }
    } catch (error) {
      toast({ title: 'Confirmation Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({...prev, [`confirm-${proposalId}`]: false}));
    }
  };

  const handleExecute = async (proposalId: string) => {
    if (!connectedAddress) return;
    setLoadingStates(prev => ({...prev, [`execute-${proposalId}`]: true}));
    try {
      const updatedProposal = await apiExecuteProposal(wallet.id, proposalId, connectedAddress);
      if (updatedProposal) {
        onProposalUpdate(updatedProposal); 
        toast({ title: 'Transaction Executed!', description: `Proposal ${proposalId.slice(0,6)}... has been executed.` });
      } else {
        throw new Error("Execution failed. Check confirmations, if already executed, or wallet balance.");
      }
    } catch (error) {
      toast({ title: 'Execution Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({...prev, [`execute-${proposalId}`]: false}));
    }
  };

  const isOwner = connectedAddress && wallet.owners.some(o => o.address.toLowerCase() === connectedAddress.toLowerCase());

  if (proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History & Proposals</CardTitle>
          <CardDescription>No transactions or proposals found for this wallet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Icons.Archive className="mx-auto h-12 w-12 mb-4" />
          No items to display. Propose a transaction to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Transaction History & Proposals</CardTitle>
        <CardDescription>
          View pending proposals and executed transactions for this wallet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-28rem)] min-h-[300px] pr-4"> 
          <Accordion type="multiple" className="w-full">
            {proposals.map((proposal) => {
              const hasConfirmed = proposal.confirmations.some(c => c.ownerAddress.toLowerCase() === connectedAddress?.toLowerCase());
              const thresholdMet = proposal.confirmationCount >= wallet.threshold;
              const canConfirm = isOwner && !proposal.executed && !hasConfirmed;
              const canExecute = isOwner && !proposal.executed && thresholdMet;
              const isLoadingConfirm = loadingStates[`confirm-${proposal.id}`];
              const isLoadingExecute = loadingStates[`execute-${proposal.id}`];

              let statusText: string;
              let statusVariant: "default" | "secondary" | "destructive" | "outline";

              if (proposal.executed) {
                statusText = 'Executed';
                statusVariant = 'default'; 
              } else if (thresholdMet) {
                statusText = 'Ready to Execute';
                statusVariant = 'default'; 
              } else {
                statusText = 'Pending Confirmations';
                statusVariant = 'secondary'; 
              }

              return (
                <AccordionItem value={proposal.id} key={proposal.id} className="border bg-card rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline focus:ring-2 focus:ring-ring rounded-t-lg">
                    <div className="flex flex-grow items-center justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={proposal.id}>
                          <span className="text-muted-foreground">ID:</span> {proposal.id.slice(0,8)}...
                        </p>
                        <p className="text-xs text-muted-foreground truncate" title={proposal.to}>
                          <span className="text-muted-foreground">To:</span> {proposal.to}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 ml-2 text-right">
                        <Badge variant={statusVariant} className="whitespace-nowrap">
                          <Icons.Activity className="mr-1 h-3 w-3" />
                          {statusText}
                        </Badge>
                         <Badge variant="outline" className="whitespace-nowrap">
                           {proposal.value} ETH
                         </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="flex items-center">
                                <Icons.Users className="h-4 w-4 text-muted-foreground mr-1" />
                                <span className="text-sm">{proposal.confirmationCount}/{wallet.threshold}</span>
                               </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{proposal.confirmationCount} of {wallet.threshold} confirmations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0 space-y-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-3">
                      <div><strong>Proposer:</strong> <span className="font-mono text-xs truncate block" title={proposal.proposer}>{proposal.proposer}</span></div>
                      <div><strong>Value:</strong> {proposal.value} ETH</div>
                      <div className="md:col-span-2"><strong>Data:</strong> <pre className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto max-h-24">{proposal.data || '0x'}</pre></div>
                      <div><strong>Created:</strong> {new Date(proposal.createdAt).toLocaleString()}</div>
                      {proposal.executed && proposal.executedAt && (
                        <div><strong>Executed:</strong> {new Date(proposal.executedAt).toLocaleString()}</div>
                      )}
                       {/* Always show AI Risk Assessment if available or not executed. For executed, show historical. */}
                        <div className="md:col-span-2">
                            <AiRiskAssessment
                                walletId={wallet.id}
                                proposal={proposal}
                                currentUserAddress={connectedAddress} // Pass the connected address
                                onRiskScoreUpdated={onProposalUpdate}
                            />
                        </div>
                    </div>
                    
                    {!proposal.executed && thresholdMet && (
                        <div className="my-3 p-3 bg-primary/10 border border-primary/30 rounded-md text-center">
                            <p className="text-sm font-semibold text-primary flex items-center justify-center">
                            <Icons.Send className="mr-2 h-4 w-4" /> This proposal has enough confirmations and is ready for execution.
                            </p>
                        </div>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Confirmations ({proposal.confirmationCount}/{wallet.threshold}):</h4>
                      {proposal.confirmations.length > 0 ? (
                        <ScrollArea className="max-h-24">
                        <ul className="space-y-1 text-xs pr-2">
                          {proposal.confirmations.map(conf => (
                            <li key={conf.ownerAddress} className="flex items-center justify-between">
                              <div className="flex items-center truncate">
                                <Icons.Confirm className="h-3 w-3 mr-1.5 text-green-500 flex-shrink-0" />
                                <span className="font-mono truncate" title={conf.ownerAddress}>{conf.ownerAddress}</span>
                              </div>
                              <span className="ml-2 text-muted-foreground text-[10px] flex-shrink-0">{new Date(conf.confirmedAt).toLocaleTimeString()}</span>
                            </li>
                          ))}
                        </ul>
                        </ScrollArea>
                      ) : (
                        <p className="text-xs text-muted-foreground">No confirmations yet.</p>
                      )}
                    </div>

                    {isOwner && !proposal.executed && (
                      <div className="flex space-x-2 mt-3 pt-3 border-t">
                        {canConfirm && (
                          <Button onClick={() => handleConfirm(proposal.id)} disabled={isLoadingConfirm || isLoadingExecute} size="sm" variant="outline">
                            {isLoadingConfirm ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Confirm className="mr-2 h-4 w-4" /> }
                             Confirm
                          </Button>
                        )}
                        {hasConfirmed && !canConfirm && ( // if already confirmed by current user but not executable yet
                             <Badge variant="outline" className="py-2 px-3 text-sm">
                                <Icons.Confirm className="mr-2 h-4 w-4 text-green-500" /> You Confirmed
                            </Badge>
                        )}
                        {canExecute && (
                          <Button onClick={() => handleExecute(proposal.id)} disabled={isLoadingExecute || isLoadingConfirm} size="sm">
                            {isLoadingExecute ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Send className="mr-2 h-4 w-4" /> }
                            Execute
                          </Button>
                        )}
                      </div>
                    )}
                    {proposal.executed && (
                      <div className="mt-3 pt-3 border-t">
                        <Badge variant="default" className="py-2 px-3 text-sm">
                          <Icons.Confirm className="mr-2 h-4 w-4" /> Transaction Executed
                        </Badge>
                      </div>
                    )}
                     {!isOwner && !proposal.executed && (
                        <p className="text-xs text-muted-foreground pt-3 border-t mt-3">You are not an owner of this wallet. Only owners can confirm or execute proposals.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
