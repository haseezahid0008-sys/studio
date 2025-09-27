'use server';

/**
 * @fileOverview An AI flow to generate a list of items for a salesman to carry, in Roman Urdu.
 *
 * - generateSalesmanItems - A function that takes item keywords and generates a formatted string.
 * - GenerateSalesmanItemsInput - The input type for the generateSalesmanItems function.
 * - GenerateSalesmanItemsOutput - The return type for the generateSalesmanItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSalesmanItemsInputSchema = z.object({
  items: z.string().describe('A comma-separated list of item keywords. For example: soap, shampoo, oil'),
});
export type GenerateSalesmanItemsInput = z.infer<typeof GenerateSalesmanItemsInputSchema>;

const GenerateSalesmanItemsOutputSchema = z.object({
  itemList: z.string().describe("A formatted list of items for the salesman to take. This must be in Roman Urdu."),
});
export type GenerateSalesmanItemsOutput = z.infer<typeof GenerateSalesmanItemsOutputSchema>;

export async function generateSalesmanItems(input: GenerateSalesmanItemsInput): Promise<GenerateSalesmanItemsOutput> {
  return generateSalesmanItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSalesmanItemsPrompt',
  input: {schema: GenerateSalesmanItemsInputSchema},
  output: {schema: GenerateSalesmanItemsOutputSchema},
  prompt: `You are an assistant for a distribution business manager. Your task is to create a list of items for a salesman to carry for the day. The output must be in Roman Urdu.

  The manager will provide a list of item keywords. Convert this into a clear, formatted list.

  For example, if the input is "soap, surf, oil", the output should be something like:
  "Aaj aapko yeh samaan saath le kar jana hai:
  - Soap
  - Surf
  - Oil"
  
  Another example, if the input is "biscuits, cold drinks", the output should be:
  "Aaj aapko yeh samaan saath le kar jana hai:
  - Biscuits
  - Cold drinks"

  Always start the sentence with "Aaj aapko yeh samaan saath le kar jana hai:" and then list the items with bullet points. The entire response must be in Roman Urdu.

  Keywords: {{{items}}}
  `,
});

const generateSalesmanItemsFlow = ai.defineFlow(
  {
    name: 'generateSalesmanItemsFlow',
    inputSchema: GenerateSalesmanItemsInputSchema,
    outputSchema: GenerateSalesmanItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
