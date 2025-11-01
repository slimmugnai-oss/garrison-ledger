/**
 * AUDIT LOGGER UTILITY
 * 
 * Simplified interface for logging security-sensitive events to audit_logs table.
 * Use this for compliance, forensics, and admin visibility.
 * 
 * Usage:
 * ```typescript
 * import { auditLogger } from '@/lib/audit-logger';
 * 
 * await auditLogger.logAuth(userId, 'user_signup', 'success');
 * await auditLogger.logPayment(userId, 'subscription_created', stripeSubId, 'success');
 * await auditLogger.logDataAccess(userId, 'les_upload', uploadId, { fileSize, month });
 * ```
 */

import { supabaseAdmin } from './supabase/admin';
import { logger } from './logger';

type EventCategory = 'auth' | 'payment' | 'data_access' | 'admin' | 'security' | 'compliance';
type Severity = 'info' | 'warn' | 'critical';
type Outcome = 'success' | 'failure' | 'blocked';

interface AuditLogEntry {
  event_type: string;
  event_category: EventCategory;
  user_id: string | null;
  resource_type?: string;
  resource_id?: string;
  action: string;
  severity?: Severity;
  metadata?: Record<string, unknown>;
  outcome?: Outcome;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Generic audit log function
 */
async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        event_type: entry.event_type,
        event_category: entry.event_category,
        user_id: entry.user_id,
        resource_type: entry.resource_type || null,
        resource_id: entry.resource_id || null,
        action: entry.action,
        severity: entry.severity || 'info',
        metadata: entry.metadata || {},
        outcome: entry.outcome || 'success',
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null
      });

    if (error) {
      logger.warn('[AuditLogger] Failed to write audit log', {
        event_type: entry.event_type,
        error: error.message
      });
    }
  } catch (err) {
    // Never fail the main operation if audit logging fails
    logger.warn('[AuditLogger] Exception while logging', { error: err });
  }
}

/**
 * Audit Logger Interface
 */
export const auditLogger = {
  /**
   * Log authentication events
   */
  async logAuth(
    userId: string,
    eventType: 'user_signup' | 'user_signin' | 'user_signout' | 'password_reset' | 'mfa_enabled',
    outcome: Outcome,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'auth',
      user_id: userId,
      action: eventType.replace('user_', ''),
      severity: outcome === 'failure' ? 'warn' : 'info',
      metadata,
      outcome
    });
  },

  /**
   * Log payment & subscription events
   */
  async logPayment(
    userId: string,
    eventType: 'subscription_created' | 'subscription_canceled' | 'payment_succeeded' | 'payment_failed' | 'refund_issued' | 'credit_pack_purchased',
    resourceId: string,
    outcome: Outcome,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'payment',
      user_id: userId,
      resource_type: eventType.includes('subscription') ? 'subscription' : 'payment',
      resource_id: resourceId,
      action: eventType,
      severity: eventType.includes('failed') ? 'warn' : 'info',
      metadata,
      outcome
    });
  },

  /**
   * Log data access events (file uploads, sensitive data views)
   */
  async logDataAccess(
    userId: string,
    eventType: 'les_upload' | 'les_audit' | 'pcs_claim_created' | 'file_download' | 'profile_updated' | 'data_export',
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'data_access',
      user_id: userId,
      resource_type: eventType.split('_')[0], // 'les', 'pcs', 'file', etc.
      resource_id: resourceId,
      action: eventType.split('_').pop() || eventType,
      severity: eventType === 'data_export' ? 'warn' : 'info',
      metadata,
      outcome: 'success'
    });
  },

  /**
   * Log admin actions
   */
  async logAdmin(
    adminUserId: string,
    eventType: 'user_suspended' | 'tier_granted' | 'data_export' | 'config_changed' | 'manual_refund',
    targetUserId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'admin',
      user_id: adminUserId,
      resource_type: 'user',
      resource_id: targetUserId,
      action: eventType,
      severity: 'warn', // All admin actions are elevated
      metadata,
      outcome: 'success'
    });

    // Also log to admin_actions table
    try {
      await supabaseAdmin.from('admin_actions').insert({
        admin_user_id: adminUserId,
        action_type: eventType,
        target_type: 'user',
        target_id: targetUserId,
        details: metadata || {}
      });
    } catch {
      // Best-effort logging
    }
  },

  /**
   * Log security events (failures, violations, threats)
   */
  async logSecurity(
    eventType: 'rate_limit_exceeded' | 'rls_violation' | 'webhook_signature_failed' | 'malware_detected' | 'invalid_token' | 'suspicious_activity',
    userId: string | null,
    severity: Severity,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'security',
      user_id: userId,
      action: eventType,
      severity,
      metadata,
      outcome: 'blocked'
    });

    // Also log to error_logs if critical
    if (severity === 'critical') {
      try {
        await supabaseAdmin.from('error_logs').insert({
          level: 'error',
          source: 'security_event',
          message: `Security event: ${eventType}`,
          user_id: userId,
          metadata: metadata || {}
        });
      } catch {
        // Best-effort logging
      }
    }
  },

  /**
   * Log GDPR/compliance events
   */
  async logCompliance(
    userId: string,
    eventType: 'gdpr_data_request' | 'gdpr_deletion' | 'gdpr_export' | 'ccpa_opt_out',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await logAuditEvent({
      event_type: eventType,
      event_category: 'compliance',
      user_id: userId,
      action: eventType.replace('gdpr_', '').replace('ccpa_', ''),
      severity: 'warn', // Compliance events are important
      metadata,
      outcome: 'success'
    });
  }
};

/**
 * Convenience function: Log failed authentication attempt
 */
export async function logFailedAuth(
  identifier: string,
  reason: string,
  ipAddress?: string
): Promise<void> {
  await auditLogger.logSecurity(
    'invalid_token',
    null,
    'warn',
    {
      identifier: identifier.substring(0, 10) + '...', // Redact full identifier
      reason,
      ip: ipAddress
    }
  );
}

/**
 * Convenience function: Log API rate limit exceeded
 */
export async function logRateLimitExceeded(
  userId: string,
  route: string,
  count: number,
  limit: number
): Promise<void> {
  await auditLogger.logSecurity(
    'rate_limit_exceeded',
    userId,
    'warn',
    {
      route,
      count,
      limit,
      exceeded_by: count - limit
    }
  );
}

/**
 * Convenience function: Log file upload (especially PII-containing files)
 */
export async function logFileUpload(
  userId: string,
  fileType: 'les_pdf' | 'pcs_document' | 'binder_file' | 'ask_document',
  fileName: string,
  fileSize: number,
  scanResult?: { safe: boolean; scanId: string }
): Promise<void> {
  await auditLogger.logDataAccess(
    userId,
    fileType === 'les_pdf' ? 'les_upload' : 'file_download',
    undefined,
    {
      file_type: fileType,
      file_name: fileName.substring(0, 50), // Truncate long names
      file_size: fileSize,
      scan_result: scanResult
    }
  );

  // Log malware detection separately if found
  if (scanResult && !scanResult.safe) {
    await auditLogger.logSecurity(
      'malware_detected',
      userId,
      'critical',
      {
        file_name: fileName,
        scan_id: scanResult.scanId
      }
    );
  }
}

/**
 * Convenience function: Log Stripe webhook processing
 */
export async function logStripeWebhook(
  eventId: string,
  eventType: string,
  userId: string | null,
  outcome: Outcome,
  processingTimeMs?: number
): Promise<void> {
  await auditLogger.logPayment(
    userId || 'system',
    eventType.replace('.', '_') as any, // Type coercion safe - it's a generic payment event
    eventId,
    outcome,
    {
      event_id: eventId,
      event_type: eventType,
      processing_time_ms: processingTimeMs
    }
  );
}

/**
 * Convenience function: Log GDPR data request
 */
export async function logGDPRRequest(
  userId: string,
  requestType: 'access' | 'deletion' | 'export',
  completed: boolean
): Promise<void> {
  const eventType = `gdpr_${requestType === 'access' ? 'data_request' : requestType}` as 
    'gdpr_data_request' | 'gdpr_deletion' | 'gdpr_export';
  
  await auditLogger.logCompliance(
    userId,
    eventType,
    {
      request_type: requestType,
      completed,
      timestamp: new Date().toISOString()
    }
  );
}

export default auditLogger;

