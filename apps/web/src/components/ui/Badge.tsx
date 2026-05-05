type Variant = 'default' | 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

const colors: Record<Variant, { bg: string; color: string }> = {
  default:    { bg: '#f1f5f9', color: '#475569' },
  pending:    { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  completed:  { bg: '#dcfce7', color: '#166534' },
  failed:     { bg: '#fee2e2', color: '#991b1b' },
  skipped:    { bg: '#f1f5f9', color: '#64748b' },
};

export function Badge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  const { bg, color } = colors[variant];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  );
}
