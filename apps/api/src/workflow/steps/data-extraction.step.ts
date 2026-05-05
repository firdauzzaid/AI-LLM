import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  DataExtractionOutputSchema,
  type DataExtractionOutput,
  type IntentCategory,
} from '../schemas/step-outputs.schema';

const SYSTEM_PROMPT = `You are a data extraction assistant for a lead processing system.

Extract structured information from the customer message.

CORE FIELDS (always extract):
- customer_name: string or null
- contact_channel: "whatsapp" | "webchat" | "email" | "other"
- service_interest: what service they're asking about, or null
- location: city/region if mentioned, or null
- urgency: "low" | "medium" | "high"
- timeline: "now" | "<1w" | "1-4w" | ">1m" | "unknown"
- budget_range: "<500" | "500-2000" | "2000-10000" | ">10000" | "unknown"
- language: ISO 639-1 code (e.g., "en", "id"), or null
- confidence: 0.0–1.0 reflecting extraction confidence

CATEGORY-SPECIFIC EXTRAS (include in "category_extras" field based on category):

For "sales_new":
  { "lead_type": "quote_request"|"availability"|"pricing"|"comparison"|"other", "service_date": "<ISO date or null>" }

For "sales_existing":
  { "account_hint": "<order/booking ID or null>", "change_request": "reschedule"|"upgrade"|"add_on"|"cancel"|"other" }

For "support":
  { "issue_type": "billing"|"scheduling"|"service_quality"|"technical"|"other", "severity": "low"|"medium"|"high" }

For "spam":
  { "spam_reason": "promo"|"phishing"|"irrelevant"|"abusive"|"other" }

For "unknown":
  { "missing_info": ["service_type"|"budget"|"timeline"|"contact"|"other"] }

If no extras apply, set "category_extras" to null.

Respond with valid JSON matching this structure exactly.`;

@Injectable()
export class DataExtractionStep {
  constructor(private readonly ai: AiService) {}

  async run(
    rawMessage: string,
    category: IntentCategory,
    contactChannel: string,
  ): Promise<{
    output: DataExtractionOutput;
    rawResponse: unknown;
    tokens: number;
  }> {
    const userPrompt = `Category: ${category}
Contact channel (how the message arrived): ${contactChannel}

Customer message:
${rawMessage}`;

    return this.ai.callStructured(
      SYSTEM_PROMPT,
      userPrompt,
      DataExtractionOutputSchema,
    );
  }
}
