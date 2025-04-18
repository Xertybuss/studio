// 'use server';

'use server';
/**
 * @fileOverview Estimates the time window before a potential heart attack based on heart rate data.
 *
 * - estimateTimeToHeartAttack - A function that estimates the time to a potential heart attack.
 * - EstimateTimeToHeartAttackInput - The input type for the estimateTimeToHeartAttack function.
 * - EstimateTimeToHeartAttackOutput - The return type for the estimateTimeToHeartAttack function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getHeartRate} from '@/services/heart-rate';

const EstimateTimeToHeartAttackInputSchema = z.object({
  heartRateBpm: z.number().describe('The current heart rate in beats per minute.'),
  heartRateVariability: z.number().optional().describe('The heart rate variability metric.'),
  userData: z.string().optional().describe('Additional user data such as age, gender, medical history.'),
});
export type EstimateTimeToHeartAttackInput = z.infer<
  typeof EstimateTimeToHeartAttackInputSchema
>;

const EstimateTimeToHeartAttackOutputSchema = z.object({
  estimatedTimeWindow: z
    .string()
    .describe(
      'An estimated time window (e.g., hours, days, weeks) before a potential heart attack.'
    ),
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The risk level of a potential heart attack.'),
  confidenceLevel: z
    .number()
    .min(0)
    .max(1)
    .describe('A value between 0 and 1 indicating the confidence level.'),
  rationale: z
    .string()
    .describe('The rationale behind the time window estimation and risk level.'),
});
export type EstimateTimeToHeartAttackOutput = z.infer<
  typeof EstimateTimeToHeartAttackOutputSchema
>;

export async function estimateTimeToHeartAttack(
  input: EstimateTimeToHeartAttackInput
): Promise<EstimateTimeToHeartAttackOutput> {
  return estimateTimeToHeartAttackFlow(input);
}

const estimateTimeToHeartAttackPrompt = ai.definePrompt({
  name: 'estimateTimeToHeartAttackPrompt',
  input: {
    schema: z.object({
      heartRateBpm: z.number().describe('The current heart rate in beats per minute.'),
      heartRateVariability: z
        .number()
        .optional()
        .describe('The heart rate variability metric.'),
      userData: z
        .string()
        .optional()
        .describe('Additional user data such as age, gender, medical history.'),
    }),
  },
  output: {
    schema: z.object({
      estimatedTimeWindow:
        z.string().describe('An estimated time window (e.g., hours, days, weeks) before a potential heart attack.'),
      riskLevel: z
        .enum(['low', 'medium', 'high'])
        .describe('The risk level of a potential heart attack.'),
      confidenceLevel:
        z.number().min(0).max(1).describe('A value between 0 and 1 indicating the confidence level.'),
      rationale: z
        .string()
        .describe('The rationale behind the time window estimation and risk level.'),
    }),
  },
  prompt: `Given the following heart rate data and user information, estimate the time window before a potential heart attack, the risk level (low, medium, high), and the rationale behind the estimation. The heartRateBpm is {{{heartRateBpm}}}, the heartRateVariability is {{{heartRateVariability}}}, and the userData is {{{userData}}}. Return your answer as JSON.`,
});

const estimateTimeToHeartAttackFlow = ai.defineFlow<
  typeof EstimateTimeToHeartAttackInputSchema,
  typeof EstimateTimeToHeartAttackOutputSchema
>(
  {
    name: 'estimateTimeToHeartAttackFlow',
    inputSchema: EstimateTimeToHeartAttackInputSchema,
    outputSchema: EstimateTimeToHeartAttackOutputSchema,
  },
  async input => {
    // Optionally, fetch heart rate from the service if not provided in the input
    const heartRateData = await getHeartRate();
    const heartRateBpm = input.heartRateBpm || heartRateData.bpm;

    const {output} = await estimateTimeToHeartAttackPrompt({
      ...input,
      heartRateBpm,
    });
    return output!;
  }
);
