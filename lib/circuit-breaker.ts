/**
 * CIRCUIT BREAKER PATTERN
 * 
 * Prevents cascading failures from external API outages.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests blocked, fallback returned
 * - HALF_OPEN: Testing if service recovered
 * 
 * Usage:
 * ```typescript
 * import { CircuitBreaker } from '@/lib/circuit-breaker';
 * 
 * const weatherBreaker = new CircuitBreaker('weather_api', {
 *   failureThreshold: 3,
 *   cooldownMs: 60000, // 1 minute
 *   timeout: 5000 // 5 seconds
 * });
 * 
 * const result = await weatherBreaker.execute(
 *   async () => {
 *     return await fetchWeatherData(zipCode);
 *   },
 *   { temperature: null, status: 'unavailable' } // Fallback
 * );
 * ```
 */

import { logger } from './logger';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number; // Open circuit after N failures
  cooldownMs: number; // Wait time before trying again
  timeout: number; // Request timeout in ms
  successThreshold?: number; // Successes needed to close from half-open
}

interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private config: Required<CircuitBreakerConfig>;
  
  // Stats for monitoring
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;

  constructor(name: string, config: CircuitBreakerConfig) {
    this.name = name;
    this.config = {
      ...config,
      successThreshold: config.successThreshold || 2
    };

    logger.info(`[CircuitBreaker] Initialized: ${name}`, {
      failureThreshold: this.config.failureThreshold,
      cooldownMs: this.config.cooldownMs,
      timeout: this.config.timeout
    });
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - (this.lastFailureTime || 0);
      
      if (timeSinceFailure > this.config.cooldownMs) {
        logger.info(`[CircuitBreaker] ${this.name}: Transitioning to HALF_OPEN (cooldown expired)`);
        this.state = 'HALF_OPEN';
        this.successes = 0;
      } else {
        // Circuit is open, return fallback immediately
        logger.warn(`[CircuitBreaker] ${this.name}: Circuit OPEN, using fallback`, {
          timeSinceFailure,
          cooldownRemaining: this.config.cooldownMs - timeSinceFailure
        });

        if (fallback !== undefined) {
          return fallback;
        }
        
        throw new Error(`Circuit breaker OPEN for ${this.name}`);
      }
    }

    // Execute the function with timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.config.timeout);
      });

      const result = await Promise.race([fn(), timeoutPromise]);

      // Success!
      this.onSuccess();
      return result;

    } catch (error) {
      // Failure
      this.onFailure(error);

      // Return fallback if provided
      if (fallback !== undefined) {
        logger.info(`[CircuitBreaker] ${this.name}: Using fallback after failure`, {
          error: error instanceof Error ? error.message : 'Unknown'
        });
        return fallback;
      }

      // Re-throw if no fallback
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      
      // Close circuit after enough successes
      if (this.successes >= this.config.successThreshold) {
        logger.info(`[CircuitBreaker] ${this.name}: Circuit CLOSED (recovered)`, {
          successes: this.successes
        });
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(error: unknown): void {
    this.lastFailureTime = Date.now();
    this.failures++;
    this.totalFailures++;

    logger.warn(`[CircuitBreaker] ${this.name}: Request failed`, {
      failures: this.failures,
      threshold: this.config.failureThreshold,
      state: this.state,
      error: error instanceof Error ? error.message : 'Unknown'
    });

    // Open circuit if threshold exceeded
    if (this.failures >= this.config.failureThreshold) {
      if (this.state !== 'OPEN') {
        logger.error(`[CircuitBreaker] ${this.name}: Circuit OPENED (threshold exceeded)`, {
          failures: this.failures,
          threshold: this.config.failureThreshold,
          cooldownMs: this.config.cooldownMs
        });

        this.state = 'OPEN';
        
        // Log to error_logs for admin visibility
        // Don't await - best effort
        this.logCircuitOpened(error).catch(() => {});
      }
    }

    // If in HALF_OPEN and still failing, go back to OPEN
    if (this.state === 'HALF_OPEN') {
      logger.warn(`[CircuitBreaker] ${this.name}: Circuit re-OPENED (still failing)`);
      this.state = 'OPEN';
      this.failures = this.config.failureThreshold; // Reset to threshold
    }
  }

  /**
   * Log circuit breaker opening to database for admin alerts
   */
  private async logCircuitOpened(error: unknown): Promise<void> {
    try {
      const { supabaseAdmin } = await import('./supabase/admin');
      
      await supabaseAdmin.from('error_logs').insert({
        level: 'error',
        source: 'circuit_breaker',
        message: `Circuit breaker OPEN: ${this.name}`,
        metadata: {
          circuit_name: this.name,
          failures: this.failures,
          threshold: this.config.failureThreshold,
          error: error instanceof Error ? error.message : 'Unknown',
          cooldown_ms: this.config.cooldownMs
        }
      });

      await supabaseAdmin.from('system_alerts').insert({
        severity: 'high',
        category: 'api',
        message: `External API down: ${this.name}`,
        details: {
          circuit_name: this.name,
          state: 'OPEN',
          failures: this.failures,
          cooldown_ms: this.config.cooldownMs
        }
      });

    } catch (logError) {
      // Best-effort logging - don't fail circuit breaker if logging fails
      logger.warn(`[CircuitBreaker] ${this.name}: Could not log circuit opened`, {
        error: logError
      });
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses
    };
  }

  /**
   * Manually reset circuit breaker (admin operation)
   */
  reset(): void {
    logger.info(`[CircuitBreaker] ${this.name}: Manual reset`);
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    return this.state === 'OPEN';
  }
}

/**
 * Pre-configured circuit breakers for external services
 */
export const circuitBreakers = {
  // Google Weather API
  weather: new CircuitBreaker('google_weather', {
    failureThreshold: 3,
    cooldownMs: 60000, // 1 minute
    timeout: 5000
  }),

  // Housing data (Zillow via RapidAPI)
  housing: new CircuitBreaker('housing_api', {
    failureThreshold: 3,
    cooldownMs: 120000, // 2 minutes
    timeout: 10000
  }),

  // School data (GreatSchools)
  schools: new CircuitBreaker('schools_api', {
    failureThreshold: 3,
    cooldownMs: 120000, // 2 minutes
    timeout: 8000
  }),

  // Gemini AI
  gemini: new CircuitBreaker('gemini_api', {
    failureThreshold: 5, // Higher threshold for AI
    cooldownMs: 300000, // 5 minutes
    timeout: 60000 // AI can be slower
  }),

  // JTR rates scraper
  jtr: new CircuitBreaker('jtr_scraper', {
    failureThreshold: 2,
    cooldownMs: 180000, // 3 minutes
    timeout: 15000
  })
};

/**
 * Get stats for all circuit breakers (for admin dashboard)
 */
export function getAllCircuitBreakerStats(): Record<string, CircuitBreakerStats> {
  return {
    weather: circuitBreakers.weather.getStats(),
    housing: circuitBreakers.housing.getStats(),
    schools: circuitBreakers.schools.getStats(),
    gemini: circuitBreakers.gemini.getStats(),
    jtr: circuitBreakers.jtr.getStats()
  };
}

/**
 * Reset all circuit breakers (admin operation)
 */
export function resetAllCircuitBreakers(): void {
  Object.values(circuitBreakers).forEach(breaker => breaker.reset());
  logger.info('[CircuitBreaker] All circuit breakers manually reset');
}

