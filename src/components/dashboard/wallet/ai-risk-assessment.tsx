
'use client';

import { useState } from 'react';
import type { Proposal, AssessTransactionRiskInput, AssessTransactionRiskOutput, MultiSigWallet } from '@/types/secure-share';
import { assessTransactionRisk } from '@/ai/flows/transaction-risk-assessment';
import { updateProposalRiskScore as apiUpdateRiskScore } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Mock AI Oracle address - in a real scenario, this would be validated
const AI_ORACLE_ADDRESS = '0xOracleAddressOracleAddressOracleAddressOr'; 

interface AiRiskAssessmentProps {
  walletId: string;
  proposal: Proposal;
  currentUserAddress: string | null; // This should come from useWallet().currentUser.address
  onRiskScoreUpdated: (updatedProposal: Proposal) => void;
}

export function AiRiskAssessment({ walletId, proposal, currentUserAddress, onRiskScoreUpdated }: AiRiskAssessmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualScore, setManualScore] = useState<number | string>(proposal.aiRiskScore ?? '');
  const [manualFactors, setManualFactors] = useState<string>(proposal.aiRiskFactors ?? '');

  const { toast } = useToast();

  // currentUserAddress is passed from parent, which gets it from useWallet().currentUser.address
  const isOracle = currentUserAddress?.toLowerCase() === AI_ORACLE_ADDRESS.toLowerCase();

  const handleAssessRisk = async () => {
    setIsLoading(true);
    try {
      const input: AssessTransactionRiskInput = {
        to: proposal.to,
        value: parseFloat(proposal.value), 
        data: proposal.data,
      };
      const result: AssessTransactionRiskOutput = await assessTransactionRisk(input);
      const updatedProposal = await apiUpdateRiskScore(walletId, proposal.id, result.riskScore, result.riskFactors);
      if (updatedProposal) {
        onRiskScoreUpdated(updatedProposal);
        toast({ title: 'AI Risk Assessment Complete', description: `Score: ${result.riskScore}. Factors: ${result.riskFactors}` });
      } else {
        throw new Error("Failed to update proposal with risk score.");
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
      toast({ title: 'AI Risk Assessment Failed', description: String(error), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const score = parseInt(String(manualScore), 10);
        if (isNaN(score) || score < 0 || score > 100) {
            toast({ title: 'Invalid Score', description: 'Score must be between 0 and 100.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
        const updatedProposal = await apiUpdateRiskScore(walletId, proposal.id, score, manualFactors);
        if (updatedProposal) {
            onRiskScoreUpdated(updatedProposal);
            toast({ title: 'Risk Score Updated Manually', description: `Score: ${score}. Factors: ${manualFactors}` });
            setShowManualForm(false);
        } else {
            throw new Error("Failed to update proposal with manual risk score.");
        }
    } catch (error) {
        console.error('Error submitting manual risk score:', error);
        toast({ title: 'Manual Update Failed', description: String(error), variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };


  const getRiskBadgeVariant = (score: number | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (score === null || score === undefined) return "outline";
    if (score > 70) return "destructive";
    if (score > 40) return "secondary"; 
    return "default"; 
  };
  
  const getRiskBadgeLabel = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return "Not Assessed";
    if (score > 70) return "High Risk";
    if (score > 40) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium">AI Risk Assessment:</Label>
        {proposal.aiRiskScore !== null && proposal.aiRiskScore !== undefined ? (
          <Badge variant={getRiskBadgeVariant(proposal.aiRiskScore)}>
            {getRiskBadgeLabel(proposal.aiRiskScore)} ({proposal.aiRiskScore})
          </Badge>
        ) : (
          <Badge variant="outline">Not Assessed</Badge>
        )}
      </div>
      {proposal.aiRiskFactors && <p className="text-xs text-muted-foreground">Factors: {proposal.aiRiskFactors}</p>}
      
      {isOracle && (
        <div className="space-y-2 pt-2 border-t">
          <Button onClick={handleAssessRisk} disabled={isLoading} size="sm" variant="outline">
            {isLoading ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Analytics className="mr-2 h-4 w-4" />}
            Trigger AI Assessment
          </Button>
          <Button onClick={() => setShowManualForm(!showManualForm)} size="sm" variant="outline">
            <Icons.Settings className="mr-2 h-4 w-4" /> {showManualForm ? 'Cancel Manual' : 'Set Score Manually'}
          </Button>
        </div>
      )}

      {isOracle && showManualForm && (
        <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Manually Set Risk Score</CardTitle></CardHeader>
            <form onSubmit={handleManualSubmit}>
                <CardContent className="space-y-3">
                    <div>
                        <Label htmlFor={`manualScore-${proposal.id}`}>Risk Score (0-100)</Label>
                        <Input 
                            id={`manualScore-${proposal.id}`} 
                            type="number" 
                            min="0" max="100" 
                            value={manualScore} 
                            onChange={(e) => setManualScore(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <Label htmlFor={`manualFactors-${proposal.id}`}>Risk Factors</Label>
                        <Textarea 
                            id={`manualFactors-${proposal.id}`}
                            value={manualFactors}
                            onChange={(e) => setManualFactors(e.target.value)}
                            placeholder="Describe risk factors..."
                            disabled={isLoading}
                            rows={2}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} size="sm">
                        {isLoading ? <Icons.Refresh className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Confirm className="mr-2 h-4 w-4" />}
                        Save Manual Score
                    </Button>
                </CardFooter>
            </form>
        </Card>
      )}
    </div>
  );
}
