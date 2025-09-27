'use server';

/**
 * @fileOverview An AI flow to generate a task description for a worker.
 *
 * - generateTaskDescription - A function that takes task keywords and generates a formatted description.
 * - GenerateTaskDescriptionInput - The input type for the generateTaskDescription function.
 * - GenerateTaskDescriptionOutput - The return type for the generateTaskDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskDescriptionInputSchema = z.object({
  keywords: z.string().describe('Keywords for the task. For example: pack 50 units of soap'),
});
export type GenerateTaskDescriptionInput = z.infer<typeof GenerateTaskDescriptionInputSchema>;

const GenerateTaskDescriptionOutputSchema = z.object({
  taskDescription: z.string().describe("A clear and concise task description for the worker in Roman Urdu."),
});
export type GenerateTaskDescriptionOutput = z.infer<typeof GenerateTaskDescriptionOutputSchema>;

export async function generateTaskDescription(input: GenerateTaskDescriptionInput): Promise<GenerateTaskDescriptionOutput> {
  return generateTaskDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskDescriptionPrompt',
  input: {schema: GenerateTaskDescriptionInputSchema},
  output: {schema: GenerateTaskDescriptionOutputSchema},
  prompt: `You are an assistant for a manager. Your task is to convert simple keywords into a formal task description for a worker. The description must be in Roman Urdu and should be clear and direct.

  For example, if the input is "pack 50 units of soap", the output should be:
  "Aapka kaam hai ke 50 soap pack karein."
  
  Another example, if the input is "load 20 cartons into the van", the output should be:
  "Aapka kaam hai ke 20 cartons van mein load karein."

  Always start the sentence with "Aapka kaam hai ke...". The entire response must be in Roman Urdu.

  Keywords: {{{keywords}}}
  `,
});

const generateTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTaskDescriptionFlow',
    inputSchema: GenerateTaskDescriptionInputSchema,
    outputSchema: GenerateTaskDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
