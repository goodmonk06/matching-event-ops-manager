/**
 * Utility functions for the application
 */

/**
 * Format price in Japanese Yen
 */
export function formatPrice(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Format date in Japanese locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if event is full
 */
export function isEventFull(currentCount: number, capacity: number): boolean {
  return currentCount >= capacity;
}

/**
 * Calculate available slots
 */
export function getAvailableSlots(currentCount: number, capacity: number): number {
  return Math.max(0, capacity - currentCount);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get event status label in Japanese
 */
export function getEventStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: '下書き',
    published: '公開',
    cancelled: '中止',
    completed: '完了',
  };
  return statusMap[status] || status;
}

/**
 * Get payment status label in Japanese
 */
export function getPaymentStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '未払い',
    paid: '支払済',
    cancelled: 'キャンセル',
    refunded: '返金済',
  };
  return statusMap[status] || status;
}

/**
 * Check if event can accept new applications
 */
export function canAcceptApplications(
  status: string,
  currentCount: number,
  capacity: number
): boolean {
  return status === 'published' && !isEventFull(currentCount, capacity);
}
