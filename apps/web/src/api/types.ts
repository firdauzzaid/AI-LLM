export type ContactChannel = 'WHATSAPP' | 'WEBCHAT' | 'EMAIL' | 'OTHER';

export type WorkflowStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type StepStatus =
  | 'NOT_STARTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export type StepName =
  | 'INTENT_CLASSIFICATION'
  | 'DATA_EXTRACTION'
  | 'ROUTING_DECISION';

export interface WorkflowStep {
  id: string;
  stepName: StepName;
  status: StepStatus;
  output: Record<string, unknown> | null;
  errorReason: string | null;
  retryCount: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface Workflow {
  id: string;
  status: WorkflowStatus;
  finalCategory: string | null;
  finalQueue: string | null;
  finalPriority: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  steps: WorkflowStep[];
}

export interface Lead {
  id: string;
  customerName: string | null;
  contactChannel: ContactChannel;
  rawMessage: string;
  createdAt: string;
  workflow: Workflow | null;
}

export interface CreateLeadPayload {
  customerName?: string;
  contactChannel: ContactChannel;
  message: string;
}
