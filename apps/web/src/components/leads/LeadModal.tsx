import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { leadsApi } from '../../api/leads.api';
import type { ContactChannel } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CHANNELS: { value: ContactChannel; label: string }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WEBCHAT', label: 'Web Chat' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'OTHER', label: 'Other' },
];

export function LeadModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ContactChannel>('WHATSAPP');
  const [message, setMessage] = useState('');

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      leadsApi.create({
        customerName: name.trim() || undefined,
        contactChannel: channel,
        message: message.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead submitted — processing started');
      setName('');
      setChannel('WHATSAPP');
      setMessage('');
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to submit lead');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutate();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Lead">
      <form onSubmit={handleSubmit} className="lead-form">
        <div className="field">
          <label htmlFor="lead-name">Customer Name (optional)</label>
          <input
            id="lead-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            maxLength={200}
          />
        </div>

        <div className="field">
          <label htmlFor="lead-channel">Contact Channel</label>
          <select
            id="lead-channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="lead-message">Message</label>
          <textarea
            id="lead-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste or type the customer message here…"
            rows={5}
            maxLength={5000}
            required
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending || !message.trim()}>
            {isPending ? <Spinner size={16} /> : 'Submit Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
