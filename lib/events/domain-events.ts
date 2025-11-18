/**
 * Domain events system
 * Allows decoupled event-driven architecture
 */

export type DomainEvent =
  | EventCreatedEvent
  | EventPublishedEvent
  | ApplicationCreatedEvent
  | PaymentCompletedEvent
  | ReviewSubmittedEvent;

export interface EventCreatedEvent {
  type: 'event.created';
  eventId: string;
  timestamp: Date;
  data: {
    title: string;
    date: Date;
    categoryId?: string;
  };
}

export interface EventPublishedEvent {
  type: 'event.published';
  eventId: string;
  timestamp: Date;
  data: {
    title: string;
    date: Date;
  };
}

export interface ApplicationCreatedEvent {
  type: 'application.created';
  applicationId: string;
  eventId: string;
  participantId: string;
  timestamp: Date;
}

export interface PaymentCompletedEvent {
  type: 'payment.completed';
  applicationId: string;
  amount: number;
  timestamp: Date;
}

export interface ReviewSubmittedEvent {
  type: 'review.submitted';
  reviewId: string;
  eventId: string;
  participantId: string;
  rating: number;
  timestamp: Date;
}

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Simple in-memory event bus
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to an event type
   */
  on<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>) {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventType, handlers);
  }

  /**
   * Unsubscribe from an event type
   */
  off<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>) {
    const handlers = this.handlers.get(eventType) || [];
    const filtered = handlers.filter((h) => h !== handler);
    this.handlers.set(eventType, filtered);
  }

  /**
   * Publish an event
   */
  async publish(event: DomainEvent) {
    const handlers = this.handlers.get(event.type) || [];

    // Execute handlers in parallel
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      })
    );
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear() {
    this.handlers.clear();
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Export class for testing
export { EventBus };
