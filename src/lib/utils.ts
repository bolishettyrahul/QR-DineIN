// Sanitize HTML from user input to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format currency
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Generate a unique idempotency key
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Order status display mapping
export const ORDER_STATUS_DISPLAY: Record<string, string> = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Being Prepared',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Order status flow (valid transitions)
export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

// Table status display mapping
export const TABLE_STATUS_DISPLAY: Record<string, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  DISABLED: 'Disabled',
};

// Payment method display mapping
export const PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  UPI: 'UPI',
  CASH: 'Cash',
  PAY_AT_COUNTER: 'Pay at Counter',
};

// Payment status display mapping
export const PAYMENT_STATUS_DISPLAY: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};
