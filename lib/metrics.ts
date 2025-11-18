/**
 * Metrics abstraction layer
 * Provides consistent interface for recording metrics
 */

interface MetricLabels {
  [key: string]: string | number;
}

class MetricsCollector {
  private metrics: Map<string, number> = new Map();

  /**
   * Record a counter metric
   */
  recordCounter(name: string, value: number = 1, labels?: MetricLabels) {
    const key = this.getKey(name, labels);
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
  }

  /**
   * Record a gauge metric (point-in-time value)
   */
  recordGauge(name: string, value: number, labels?: MetricLabels) {
    const key = this.getKey(name, labels);
    this.metrics.set(key, value);
  }

  /**
   * Record timing/duration in milliseconds
   */
  recordTiming(name: string, durationMs: number, labels?: MetricLabels) {
    const key = this.getKey(`${name}_ms`, labels);
    this.metrics.set(key, durationMs);
  }

  /**
   * Create a timer that records duration when stopped
   */
  startTimer(name: string, labels?: MetricLabels) {
    const start = Date.now();
    return {
      stop: () => {
        const duration = Date.now() - start;
        this.recordTiming(name, duration, labels);
        return duration;
      },
    };
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Generate metric key from name and labels
   */
  private getKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join(',');

    return `${name}{${labelStr}}`;
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

// Export class for testing
export { MetricsCollector };
