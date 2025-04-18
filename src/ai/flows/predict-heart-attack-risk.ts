// src/ai/flows/predict-heart-attack-risk.ts
'use server';

/**
 * @fileOverview Predicts heart attack risk based on heart rate variability data.
 *
 * - predictHeartAttackRisk - A function that predicts heart attack risk.
 * - PredictHeartAttackRiskInput - The input type for the predictHeartAttackRisk function.
 * - PredictHeartAttackRiskOutput - The return type for the predictHeartAttackRisk function.
 */

import {ai} from '@/ai/ai-instance';
import {getHeartRate, HeartRateData} from '@/services/heart-rate';
import {z} from 'genkit';

const PredictHeartAttackRiskInputSchema = z.object({
  userData: z
    .string()
    .describe(
      'User-provided data such as age, gender, medical history, and lifestyle information.'
    ),
});

export type PredictHeartAttackRiskInput = z.infer<
  typeof PredictHeartAttackRiskInputSchema
>;

const PredictHeartAttackRiskOutputSchema = z.object({
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The predicted heart attack risk level.'),
  estimatedTimeWindow: z
    .string()
    .describe(
      'An estimated time window before a potential heart attack might occur.'
    ),
  explanation: z
    .string()
    .describe('Explanation of why the model gave this prediction.'),
});

export type PredictHeartAttackRiskOutput = z.infer<
  typeof PredictHeartAttackRiskOutputSchema
>;

export async function predictHeartAttackRisk(
  input: PredictHeartAttackRiskInput
): Promise<PredictHeartAttackRiskOutput> {
  return predictHeartAttackRiskFlow(input);
}

const predictHeartAttackRiskPrompt = ai.definePrompt({
  name: 'predictHeartAttackRiskPrompt',
  input: {
    schema: z.object({
      userData: z
        .string()
        .describe(
          'User-provided data such as age, gender, medical history, and lifestyle information.'
        ),
      heartRateData: z.object({
        bpm: z.number(),
        timestamp: z.date(),
      }),
    }),
  },
  output: {
    schema: z.object({
      riskLevel: z
        .enum(['low', 'medium', 'high'])
        .describe('The predicted heart attack risk level.'),
      estimatedTimeWindow: z
        .string()
        .describe(
          'An estimated time window before a potential heart attack might occur.'
        ),
      explanation: z
        .string()
        .describe('Explanation of why the model gave this prediction.'),
    }),
  },
  prompt: `Given the following user data and heart rate information, predict the user's heart attack risk.

User Data: {{{userData}}}

Heart Rate Data: BPM: {{{heartRateData.bpm}}}, Timestamp: {{{heartRateData.timestamp}}}

Consider heart rate variability when determining risk. Output the risk level (low, medium, or high), an estimated time window before a potential heart attack, and the reasoning behind the prediction.

Ensure that the estimatedTimeWindow is reasonable; if the risk is high, the time window should be shorter. If the risk is low, the time window can be longer. If there's not enough data, make a reasonable estimate and state that it's based on limited information.

Please output the riskLevel, estimatedTimeWindow, and explanation fields.
`,
});

const predictHeartAttackRiskFlow = ai.defineFlow<
  typeof PredictHeartAttackRiskInputSchema,
  typeof PredictHeartAttackRiskOutputSchema
>(
  {
    name: 'predictHeartAttackRiskFlow',
    inputSchema: PredictHeartAttackRiskInputSchema,
    outputSchema: PredictHeartAttackRiskOutputSchema,
  },
  async input => {
    const heartRateData: HeartRateData = await getHeartRate();
    const {output} = await predictHeartAttackRiskPrompt({
      ...input,
      heartRateData,
    });
    return output!;
  }
);
