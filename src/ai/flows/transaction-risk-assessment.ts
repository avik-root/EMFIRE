// src/ai/flows/transaction-risk-assessment.ts
'use server';

/**
 * @fileOverview An AI agent that assesses the risk of a transaction.
 *
 * - assessTransactionRisk - A function that assesses the risk of a transaction.
 * - AssessTransactionRiskInput - The input type for the assessTransactionRisk function.
 * - AssessTransactionRiskOutput - The return type for the assessTransactionRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessTransactionRiskInputSchema = z.object({
  to: z.string().describe('The recipient address of the transaction.'),
  value: z.number().describe('The amount of ETH being sent in the transaction.'),
  data: z.string().describe('The transaction data (calldata).'),
});
export type AssessTransactionRiskInput = z.infer<typeof AssessTransactionRiskInputSchema>;

const AssessTransactionRiskOutputSchema = z.object({
  riskScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('The AI-assessed risk score of the transaction, from 0 to 100.'),
  riskFactors: z
    .string()
    .describe('A list of factors contributing to the risk score, or an empty string if no risks found.'),
});
export type AssessTransactionRiskOutput = z.infer<typeof AssessTransactionRiskOutputSchema>;

export async function assessTransactionRisk(input: AssessTransactionRiskInput): Promise<AssessTransactionRiskOutput> {
  return assessTransactionRiskFlow(input);
}

const assessTransactionRiskPrompt = ai.definePrompt({
  name: 'assessTransactionRiskPrompt',
  input: {schema: AssessTransactionRiskInputSchema},
  output: {schema: AssessTransactionRiskOutputSchema},
  prompt: `You are an AI transaction risk assessment tool.

You will receive transaction details and provide a risk score from 0 to 100, and a list of factors contributing to the risk.

Transaction Details:
To: {{{to}}}
Value: {{{value}}}
Data: {{{data}}}

Respond with a JSON object containing the riskScore and riskFactors.
The riskFactors should be an empty string if no risks are found.
`, 
});

const assessTransactionRiskFlow = ai.defineFlow(
  {
    name: 'assessTransactionRiskFlow',
    inputSchema: AssessTransactionRiskInputSchema,
    outputSchema: AssessTransactionRiskOutputSchema,
  },
  async input => {
    const {output} = await assessTransactionRiskPrompt(input);
    return output!;
  }
);
