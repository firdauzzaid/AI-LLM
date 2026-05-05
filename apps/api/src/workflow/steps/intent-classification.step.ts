import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  IntentClassificationOutputSchema,
  type IntentClassificationOutput,
} from '../schemas/step-outputs.schema';

const SYSTEM_PROMPT = `You are a lead classification assistant for a service business.

Classify the customer message into EXACTLY one category:
- sales_new: New lead asking about pricing, availability, or services for the first time
- sales_existing: Existing customer requesting changes, upgrades, or add-ons to an existing arrangement
- support: Help request related to an existing booking or service issue
- spam: Irrelevant, promotional, or malicious content with no genuine intent
- unknown: Genuinely unclear — not enough information to classify

Respond with valid JSON only:
{
  "category": "sales_new" | "sales_existing" | "support" | "spam" | "unknown",
  "confidence": <number 0.0–1.0>,
  "rationale": "<one sentence explaining the classification>"
}`;

@Injectable()
export class IntentClassificationStep {
  constructor(private readonly ai: AiService) {}

  async run(rawMessage: string): Promise<{
    output: IntentClassificationOutput;
    rawResponse: unknown;
    tokens: number;
  }> {
    return this.ai.callStructured(
      SYSTEM_PROMPT,
      `Customer message:\n${rawMessage}`,
      IntentClassificationOutputSchema,
    );
  }
}
