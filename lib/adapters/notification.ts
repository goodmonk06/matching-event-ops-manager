/**
 * Notification adapter interface
 * Allows pluggable notification backends (email, SMS, push, etc.)
 */

export interface NotificationPayload {
  to: string;
  subject?: string;
  body: string;
  templateId?: string;
  variables?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface INotificationAdapter {
  /**
   * Send a notification
   */
  send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /**
   * Send bulk notifications
   */
  sendBulk(payloads: NotificationPayload[]): Promise<{ success: boolean; sent: number; failed: number }>;

  /**
   * Get adapter name/type
   */
  getName(): string;
}

/**
 * No-op notification adapter (default)
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload) {
    console.log(`[NoOpNotification] Would send to ${payload.to}: ${payload.body}`);
    return { success: true };
  }

  async sendBulk(payloads: NotificationPayload[]) {
    console.log(`[NoOpNotification] Would send ${payloads.length} notifications`);
    return { success: true, sent: payloads.length, failed: 0 };
  }

  getName() {
    return 'noop';
  }
}

/**
 * Console notification adapter (for development/testing)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload) {
    console.log('=== NOTIFICATION ===');
    console.log(`To: ${payload.to}`);
    if (payload.subject) console.log(`Subject: ${payload.subject}`);
    console.log(`Body: ${payload.body}`);
    console.log('===================');
    return { success: true, messageId: `console-${Date.now()}` };
  }

  async sendBulk(payloads: NotificationPayload[]) {
    for (const payload of payloads) {
      await this.send(payload);
    }
    return { success: true, sent: payloads.length, failed: 0 };
  }

  getName() {
    return 'console';
  }
}

// Singleton instance (can be swapped at runtime)
let notificationAdapter: INotificationAdapter = new NoOpNotificationAdapter();

export function setNotificationAdapter(adapter: INotificationAdapter) {
  notificationAdapter = adapter;
}

export function getNotificationAdapter(): INotificationAdapter {
  return notificationAdapter;
}
