import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  isEventFull,
  getAvailableSlots,
  isValidEmail,
  getEventStatusLabel,
  getPaymentStatusLabel,
  canAcceptApplications,
} from '../utils';

describe('formatPrice', () => {
  it('should format price with Japanese Yen symbol', () => {
    expect(formatPrice(5000)).toBe('¥5,000');
    expect(formatPrice(10000)).toBe('¥10,000');
    expect(formatPrice(0)).toBe('¥0');
  });

  it('should handle large numbers', () => {
    expect(formatPrice(1234567)).toBe('¥1,234,567');
  });
});

describe('formatDate', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2024-12-25T18:30:00');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('12');
    expect(formatted).toContain('25');
  });

  it('should handle string date input', () => {
    const formatted = formatDate('2024-12-25T18:30:00');
    expect(formatted).toContain('2024');
  });
});

describe('isEventFull', () => {
  it('should return true when event is full', () => {
    expect(isEventFull(30, 30)).toBe(true);
    expect(isEventFull(31, 30)).toBe(true);
  });

  it('should return false when event is not full', () => {
    expect(isEventFull(29, 30)).toBe(false);
    expect(isEventFull(0, 30)).toBe(false);
  });
});

describe('getAvailableSlots', () => {
  it('should calculate available slots correctly', () => {
    expect(getAvailableSlots(10, 30)).toBe(20);
    expect(getAvailableSlots(0, 30)).toBe(30);
    expect(getAvailableSlots(29, 30)).toBe(1);
  });

  it('should not return negative numbers when over capacity', () => {
    expect(getAvailableSlots(31, 30)).toBe(0);
    expect(getAvailableSlots(40, 30)).toBe(0);
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.jp')).toBe(true);
    expect(isValidEmail('test+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('getEventStatusLabel', () => {
  it('should return Japanese labels for event statuses', () => {
    expect(getEventStatusLabel('draft')).toBe('下書き');
    expect(getEventStatusLabel('published')).toBe('公開');
    expect(getEventStatusLabel('cancelled')).toBe('中止');
    expect(getEventStatusLabel('completed')).toBe('完了');
  });

  it('should return original status if not mapped', () => {
    expect(getEventStatusLabel('unknown')).toBe('unknown');
  });
});

describe('getPaymentStatusLabel', () => {
  it('should return Japanese labels for payment statuses', () => {
    expect(getPaymentStatusLabel('pending')).toBe('未払い');
    expect(getPaymentStatusLabel('paid')).toBe('支払済');
    expect(getPaymentStatusLabel('cancelled')).toBe('キャンセル');
    expect(getPaymentStatusLabel('refunded')).toBe('返金済');
  });

  it('should return original status if not mapped', () => {
    expect(getPaymentStatusLabel('unknown')).toBe('unknown');
  });
});

describe('canAcceptApplications', () => {
  it('should return true for published events with available slots', () => {
    expect(canAcceptApplications('published', 10, 30)).toBe(true);
    expect(canAcceptApplications('published', 0, 30)).toBe(true);
  });

  it('should return false for full published events', () => {
    expect(canAcceptApplications('published', 30, 30)).toBe(false);
    expect(canAcceptApplications('published', 31, 30)).toBe(false);
  });

  it('should return false for non-published events', () => {
    expect(canAcceptApplications('draft', 10, 30)).toBe(false);
    expect(canAcceptApplications('cancelled', 10, 30)).toBe(false);
    expect(canAcceptApplications('completed', 10, 30)).toBe(false);
  });

  it('should return false for non-published events even with available slots', () => {
    expect(canAcceptApplications('draft', 0, 30)).toBe(false);
  });
});
