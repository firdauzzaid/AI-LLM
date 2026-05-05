import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leadsApi } from '../../api/leads.api';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { WorkflowDetail } from './WorkflowDetail';
import type { Lead, WorkflowStatus } from '../../api/types';

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  WEBCHAT:  'Web Chat',
  EMAIL:    'Email',
  OTHER:    'Other',
};

function statusVariant(status: WorkflowStatus | undefined) {
  if (!status) return 'default' as const;
  const map: Record<WorkflowStatus, 'pending' | 'processing' | 'completed' | 'failed'> = {
    PENDING:    'pending',
    PROCESSING: 'processing',
    COMPLETED:  'completed',
    FAILED:     'failed',
  };
  return map[status];
}

// Detect workflow status transitions and fire toasts
function useStatusToasts(leads: Lead[] | undefined) {
  const prev = useRef<Record<string, WorkflowStatus>>({});

  useEffect(() => {
    if (!leads) return;
    leads.forEach((lead) => {
      const status = lead.workflow?.status;
      if (!status) return;
      const old = prev.current[lead.id];
      if (old && old !== status) {
        if (status === 'COMPLETED') {
          toast.success(`Lead processed: ${lead.customerName ?? 'Message'} → completed`);
        } else if (status === 'FAILED') {
          toast.error(`Lead failed: ${lead.customerName ?? 'Message'}`);
        }
      }
      prev.current[lead.id] = status;
    });
  }, [leads]);
}

function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const status = lead.workflow?.status;

  return (
    <div className="lead-row">
      <button
        className="lead-row-header"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="lead-row-main">
          <span className="lead-channel">{CHANNEL_LABELS[lead.contactChannel]}</span>
          {lead.customerName && <span className="lead-name">{lead.customerName}</span>}
          <span className="lead-message">{lead.rawMessage.slice(0, 120)}{lead.rawMessage.length > 120 ? '…' : ''}</span>
        </div>
        <div className="lead-row-meta">
          <Badge
            label={status ?? 'no workflow'}
            variant={statusVariant(status)}
          />
          <span className="lead-date">
            {new Date(lead.createdAt).toLocaleDateString()}
          </span>
          <span className="lead-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && lead.workflow && (
        <div className="lead-detail">
          <WorkflowDetail workflow={lead.workflow} leadId={lead.id} />
        </div>
      )}
    </div>
  );
}

export function LeadList() {
  const { data: leads, isLoading, isError } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsApi.list,
    refetchInterval: 4000, // poll every 4s to catch workflow progress
  });

  useStatusToasts(leads);

  if (isLoading) {
    return (
      <div className="list-state">
        <Spinner size={24} />
        <span>Loading leads…</span>
      </div>
    );
  }

  if (isError) {
    return <div className="list-state error">Failed to load leads.</div>;
  }

  if (!leads?.length) {
    return (
      <div className="list-state empty">
        No leads yet. Submit your first lead using the button above.
      </div>
    );
  }

  return (
    <div className="lead-list">
      {leads.map((lead) => (
        <LeadRow key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
