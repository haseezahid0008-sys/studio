'use server';

/**
 * @fileOverview An AI flow to analyze financial data and provide a summary.
 *
 * - analyzeFinancials - A function that analyzes total revenue and expenses.
 * - AnalyzeFinancialsInput - The input type for the analyzeFinancials function.
 * - AnalyzeFinancialsOutput - The return type for the analyzeFinancials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFinancialsInputSchema = z.object({
  totalRevenue: z
    .number()
    .describe('Total revenue from all sales.'),
  totalExpenses: z
    .number()
    .describe('Total of all business expenses.'),
});
export type AnalyzeFinancialsInput = z.infer<
  typeof AnalyzeFinancialsInputSchema
>;

const AnalyzeFinancialsOutputSchema = z.object({
    status: z.enum(['profit', 'loss', 'breakeven']).describe("The financial status: 'profit', 'loss', or 'breakeven'."),
    summary: z.string().describe("A concise, insightful summary of the financial status in 1-2 sentences. If there's a loss, mention the key contributing factors if possible. If profitable, mention the profit margin."),
});
export type AnalyzeFinancialsOutput = z.infer<
  typeof AnalyzeFinancialsOutputSchema
>;

export async function analyzeFinancials(
  input: AnalyzeFinancialsInput
): Promise<AnalyzeFinancialsOutput> {
  return analyzeFinancialsFlow(input);
}

const analyzeFinancialsPrompt = ai.definePrompt({
  name: 'analyzeFinancialsPrompt',
  input: {schema: AnalyzeFinancialsInputSchema},
  output: {schema: AnalyzeFinancialsOutputSchema},
  prompt: `You are an expert financial analyst for a small business. Your task is to analyze the provided financial data and determine the business's status.

  Analyze the following data:
  - Total Revenue: {{{totalRevenue}}}
  - Total Expenses: {{{totalExpenses}}}

  Based on this, determine if the business is in 'profit', 'loss', or 'breakeven'.
  Then, provide a concise, insightful summary (1-2 sentences) of the financial situation.
  
  - If it's a loss, briefly mention the gap between revenue and expenses.
  - If it's a profit, calculate and mention the net profit and the profit margin percentage.
  - If it's breakeven, state that the business has covered its costs.

  Your tone should be professional, clear, and easy for a business owner to understand.
  `,
});

const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: AnalyzeFinancialsInputSchema,
    outputSchema: AnalyzeFinancialsOutputSchema,
  },
  async input => {
    const {output} = await analyzeFinancialsPrompt(input);
    return output!;
  }
);
