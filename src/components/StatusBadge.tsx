interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'table';
}

const ORDER_COLORS: Record<string, string> = {
  PLACED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

const TABLE_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  DISABLED: 'bg-gray-100 text-gray-800',
};

export function StatusBadge({ status, variant = 'order' }: StatusBadgeProps) {
  const colors = variant === 'order' 
    ? ORDER_COLORS 
    : variant === 'payment' 
    ? PAYMENT_COLORS 
    : TABLE_COLORS;

  const colorClass = colors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
