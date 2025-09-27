'use server';

/**
 * @fileOverview A flow to calculate daily profit/loss based on sales and expenses.
 *
 * - calculateDailyProfitLoss - A function that calculates the daily profit/loss.
 * - CalculateDailyProfitLossInput - The input type for the calculateDailyProfitLoss function.
 * - CalculateDailyProfitLossOutput - The return type for the calculateDailyProfitLoss function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateDailyProfitLossInputSchema = z.object({
  dailySales: z
    .number()
    .describe('Total sales amount for the day.'),
  dailyExpenses: z
    .number()
    .describe('Total expenses amount for the day.'),
});
export type CalculateDailyProfitLossInput = z.infer<
  typeof CalculateDailyProfitLossInputSchema
>;

const CalculateDailyProfitLossOutputSchema = z.object({
  profitLoss: z
    .number()
    .describe('The calculated profit or loss for the day.'),
  isProfitable: z
    .boolean()
    .describe('Whether the business was profitable on this day.'),
});
export type CalculateDailyProfitLossOutput = z.infer<
  typeof CalculateDailyProfitLossOutputSchema
>;

export async function calculateDailyProfitLoss(
  input: CalculateDailyProfitLossInput
): Promise<CalculateDailyProfitLossOutput> {
  return calculateDailyProfitLossFlow(input);
}

const calculateDailyProfitLossPrompt = ai.definePrompt({
  name: 'calculateDailyProfitLossPrompt',
  input: {schema: CalculateDailyProfitLossInputSchema},
  output: {schema: CalculateDailyProfitLossOutputSchema},
  prompt: `You are a financial analyst. Calculate the profit or loss for the day based on the provided sales and expenses. Also, determine if the business was profitable or not.

Sales: {{{dailySales}}}
Expenses: {{{dailyExpenses}}}

Calculate the profit/loss and then determine whether the day resulted in a profit.`,
});

const calculateDailyProfitLossFlow = ai.defineFlow(
  {
    name: 'calculateDailyProfitLossFlow',
    inputSchema: CalculateDailyProfitLossInputSchema,
    outputSchema: CalculateDailyProfitLossOutputSchema,
  },
  async input => {
    const profitLoss = input.dailySales - input.dailyExpenses;
    const isProfitable = profitLoss > 0;

    const {output} = await calculateDailyProfitLossPrompt({
      ...input,
      profitLoss,
      isProfitable,
    });
    return {
      profitLoss,
      isProfitable,
    };
  }
);
