'use server';

/**
 * @fileOverview A dental service description generator AI agent.
 *
 * - generateServiceDescription - A function that handles the dental service description generation process.
 * - GenerateServiceDescriptionInput - The input type for the generateServiceDescription function.
 * - GenerateServiceDescriptionOutput - The return type for the generateServiceDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateServiceDescriptionInputSchema = z.object({
  serviceName: z.string().describe('The name of the dental service.'),
});
export type GenerateServiceDescriptionInput = z.infer<typeof GenerateServiceDescriptionInputSchema>;

const GenerateServiceDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the dental service.'),
});
export type GenerateServiceDescriptionOutput = z.infer<typeof GenerateServiceDescriptionOutputSchema>;

export async function generateServiceDescription(input: GenerateServiceDescriptionInput): Promise<GenerateServiceDescriptionOutput> {
  return generateServiceDescriptionFlow(input);
}

const generateServiceDescriptionPrompt = ai.definePrompt({
  name: 'generateServiceDescriptionPrompt',
  input: {schema: GenerateServiceDescriptionInputSchema},
  output: {schema: GenerateServiceDescriptionOutputSchema},
  prompt: `You are a marketing expert in the dental industry. Generate a compelling and informative description for the following dental service, for use in a service catalog.

Service Name: {{{serviceName}}}

Description:`,
});

const generateServiceDescriptionFlow = ai.defineFlow(
  {
    name: 'generateServiceDescriptionFlow',
    inputSchema: GenerateServiceDescriptionInputSchema,
    outputSchema: GenerateServiceDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateServiceDescriptionPrompt(input);
    return output!;
  }
);
