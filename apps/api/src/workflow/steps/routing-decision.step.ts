import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import {
  RoutingDecisionOutputSchema,
  type RoutingDecisionOutput,
  type IntentClassificationOutput,
  type DataExtractionOutput,
} from '../schemas/step-outputs.schema';

// Default queue by category — deterministic rule applied before AI runs
const DEFAULT_QUEUE: Record<string, string> = {
  sales_new: 'sales',
  sales_existing: 'sales',
  support: 'support',
  spam: 'ignore',
  unknown: 'needs_clarification',
};

const SYSTEM_PROMPT = `You are a lead routing decision engine for a service business.

Determine the routing decision based on the classification and extracted data.

DEFAULT QUEUE RULES (override only with strong justification):
- sales_new → "sales"
- sales_existing → "sales" (may be "support" if the request is about a service-quality issue)
- support → "support"
- spam → "ignore"
- unknown → "needs_clarification"

YOUR JOB: Determine priority, SLA, and next actions. Priorities MUST NOT be hardcoded.
Consider these signals:
- Urgency language ("ASAP", "today", "emergency", "urgent") → higher priority
- Budget/deal size ("enterprise", large budget figures) → higher priority
- Churn risk ("cancel", "refund", "moving to competitor", complaint tone) → p0 or p1
- Timeline proximity (now or <1w) → higher priority
- Emotional tone (frustrated, distressed) → higher priority + faster SLA

Priority definitions:
- p0: Critical/immediate (same-day response required)
- p1: High (respond within a few hours)
- p2: Normal/low (standard SLA)

SLA guidelines (sla_minutes):
- p0: 30–120 minutes
- p1: 120–480 minutes
- p2: 480–2880 minutes

Respond with valid JSON:
{
  "queue": "sales" | "support" | "ignore" | "needs_clarification",
  "priority": "p0" | "p1" | "p2",
  "sla_minutes": <integer>,
  "recommended_next_action": "<short action string>",
  "required_followups": ["<string>", ...],
  "explanation": "<1-2 sentence justification>"
}`;

@Injectable()
export class RoutingDecisionStep {
  constructor(private readonly ai: AiService) {}

  async run(
    classification: IntentClassificationOutput,
    extraction: DataExtractionOutput,
    rawMessage: string,
  ) {
    const defaultQueue = DEFAULT_QUEUE[classification.category] ?? 'needs_clarification';

    const userPrompt = `Classification:
${JSON.stringify(classification, null, 2)}

Extracted data:
${JSON.stringify(extraction, null, 2)}

Default queue for this category: "${defaultQueue}"

Original message:
${rawMessage}`;

    return this.ai.callStructured(
      SYSTEM_PROMPT,
      userPrompt,
      RoutingDecisionOutputSchema,
    );
  }
}
