import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leadsApi } from '../../api/leads.api';
import { Badge } from '../ui/Badge';
import type { Workflow, WorkflowStep, StepStatus, WorkflowStatus } from '../../api/types';

const STEP_LABELS: Record<string, string> = {
  INTENT_CLASSIFICATION: 'Intent Classification',
  DATA_EXTRACTION: 'Data Extraction',
  ROUTING_DECISION: 'Routing Decision',
};

function stepVariant(status: StepStatus) {
  const map: Record<StepStatus, 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | 'default'> = {
    NOT_STARTED: 'default',
    PROCESSING:  'processing',
    COMPLETED:   'completed',
    FAILED:      'failed',
    SKIPPED:     'skipped',
  };
  return map[status];
}

function workflowVariant(status: WorkflowStatus) {
  const map: Record<WorkflowStatus, 'pending' | 'processing' | 'completed' | 'failed'> = {
    PENDING:    'pending',
    PROCESSING: 'processing',
    COMPLETED:  'completed',
    FAILED:     'failed',
  };
  return map[status];
}

function StepCard({ step }: { step: WorkflowStep }) {
  return (
    <div className={`step-card step-card--${step.status.toLowerCase()}`}>
      <div className="step-header">
        <span className="step-name">{STEP_LABELS[step.stepName] ?? step.stepName}</span>
        <Badge label={step.status.replace('_', ' ')} variant={stepVariant(step.status)} />
      </div>

      {step.status === 'COMPLETED' && step.output && (
        <pre className="step-output">{JSON.stringify(step.output, null, 2)}</pre>
      )}

      {step.status === 'FAILED' && step.errorReason && (
        <p className="step-error">⚠ {step.errorReason}</p>
      )}

      {step.retryCount > 0 && (
        <p className="step-meta">Retried {step.retryCount}×</p>
      )}
    </div>
  );
}

interface Props {
  workflow: Workflow;
  leadId: string;
}

export function WorkflowDetail({ workflow, leadId }: Props) {
  const queryClient = useQueryClient();

  const retryMutation = useMutation({
    mutationFn: () => leadsApi.retry(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Workflow re-queued — processing will resume shortly.');
    },
    onError: () => {
      toast.error('Failed to retry workflow. Please try again.');
    },
  });

  return (
    <div className="workflow-detail">
      <div className="workflow-summary">
        <Badge
          label={workflow.status}
          variant={workflowVariant(workflow.status)}
        />
        {workflow.finalCategory && (
          <span className="workflow-meta">Category: <strong>{workflow.finalCategory.toLowerCase().replace('_', ' ')}</strong></span>
        )}
        {workflow.finalQueue && (
          <span className="workflow-meta">Queue: <strong>{workflow.finalQueue}</strong></span>
        )}
        {workflow.finalPriority && (
          <span className="workflow-meta">Priority: <strong>{workflow.finalPriority.toUpperCase()}</strong></span>
        )}

        {workflow.status === 'FAILED' && (
          <button
            className="btn-retry"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
          >
            {retryMutation.isPending ? 'Retrying…' : 'Retry Workflow'}
          </button>
        )}
      </div>

      {workflow.failureReason && (
        <div className="workflow-error">⚠ {workflow.failureReason}</div>
      )}

      <div className="steps-list">
        {workflow.steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}
