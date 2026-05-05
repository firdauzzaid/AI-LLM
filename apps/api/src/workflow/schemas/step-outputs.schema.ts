import { z } from 'zod';

// ─── Step 1: Intent Classification ───────────────────────────────────────────

export const IntentCategoryEnum = z.enum([
  'sales_new',
  'sales_existing',
  'support',
  'spam',
  'unknown',
]);
export type IntentCategory = z.infer<typeof IntentCategoryEnum>;

export const IntentClassificationOutputSchema = z.object({
  category: IntentCategoryEnum,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1).max(600),
});
export type IntentClassificationOutput = z.infer<
  typeof IntentClassificationOutputSchema
>;

// ─── Step 2: Data Extraction ──────────────────────────────────────────────────

const CoreFieldsSchema = z.object({
  customer_name: z.string().nullable().optional(),
  contact_channel: z.enum(['whatsapp', 'webchat', 'email', 'other']),
  service_interest: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  urgency: z.enum(['low', 'medium', 'high']),
  timeline: z.enum(['now', '<1w', '1-4w', '>1m', 'unknown']),
  budget_range: z.enum(['<500', '500-2000', '2000-10000', '>10000', 'unknown']),
  language: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
});

// Category-specific extras — only present when the category matches
const SalesNewExtrasSchema = z.object({
  lead_type: z.enum([
    'quote_request',
    'availability',
    'pricing',
    'comparison',
    'other',
  ]),
  service_date: z.string().nullable().optional(),
});

const SalesExistingExtrasSchema = z.object({
  account_hint: z.string().nullable().optional(),
  change_request: z.enum(['reschedule', 'upgrade', 'add_on', 'cancel', 'other']),
});

const SupportExtrasSchema = z.object({
  issue_type: z.enum([
    'billing',
    'scheduling',
    'service_quality',
    'technical',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high']),
});

const SpamExtrasSchema = z.object({
  spam_reason: z.enum(['promo', 'phishing', 'irrelevant', 'abusive', 'other']),
});

const UnknownExtrasSchema = z.object({
  missing_info: z.array(
    z.enum(['service_type', 'budget', 'timeline', 'contact', 'other']),
  ),
});

export const DataExtractionOutputSchema = CoreFieldsSchema.and(
  z.object({
    category_extras: z
      .union([
        SalesNewExtrasSchema,
        SalesExistingExtrasSchema,
        SupportExtrasSchema,
        SpamExtrasSchema,
        UnknownExtrasSchema,
      ])
      .nullable()
      .optional(),
  }),
);
export type DataExtractionOutput = z.infer<typeof DataExtractionOutputSchema>;

// ─── Step 3: Routing Decision ─────────────────────────────────────────────────

export const RoutingDecisionOutputSchema = z.object({
  queue: z.enum(['sales', 'support', 'ignore', 'needs_clarification']),
  priority: z.enum(['p0', 'p1', 'p2']),
  sla_minutes: z.number().int().positive(),
  recommended_next_action: z.string().min(1).max(300),
  required_followups: z.array(z.string()),
  explanation: z.string().min(1).max(500),
});
export type RoutingDecisionOutput = z.infer<typeof RoutingDecisionOutputSchema>;
