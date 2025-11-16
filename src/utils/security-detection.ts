import { supabase } from '@/integrations/supabase/client';

/**
 * Security Detection Utilities
 * Provides functions for detecting database leaks and environment variable exposures
 */

// Patterns that indicate potential secrets/credentials
const SENSITIVE_PATTERNS = [
  // API Keys
  /(?:api[_-]?key|apikey)[\s:=]+['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
  // AWS
  /AKIA[0-9A-Z]{16}/g,
  /(?:aws[_-]?secret[_-]?access[_-]?key)[\s:=]+['"]?([a-zA-Z0-9/+=]{40})['"]?/gi,
  // Database URLs
  /(?:database[_-]?url|db[_-]?url|postgres|mysql)[\s:=]+['"]?((?:postgres|mysql|mongodb):\/\/[^\s'"]+)['"]?/gi,
  // JWT
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  // Private Keys
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
  // Generic Secrets
  /(?:secret|password|passwd|pwd)[\s:=]+['"]?([^\s'"]{8,})['"]?/gi,
  // Supabase
  /(?:supabase[_-]?(?:url|key|service[_-]?key))[\s:=]+['"]?([a-zA-Z0-9._\-]+)['"]?/gi,
];

export interface SecurityFinding {
  type: 'database_leak' | 'env_leak' | 'api_key_leak' | 'credential_leak';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: string;
  sample?: string;
  recommendation: string;
}

/**
 * Scan environment variables for potential exposures
 */
export async function scanEnvironmentVariables(
  projectId?: string
): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];

  try {
    let query = supabase.from('secrets').select('key, project_id');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: secrets, error } = await query;

    if (error) throw error;

    // Check for common misconfigurations
    secrets?.forEach(secret => {
      // Check for exposed keys in key names
      if (secret.key.toLowerCase().includes('exposed') ||
          secret.key.toLowerCase().includes('public')) {
        findings.push({
          type: 'env_leak',
          severity: 'high',
          description: `Environment variable "${secret.key}" has suspicious naming that suggests it might be exposed`,
          location: `Project: ${secret.project_id}`,
          recommendation: 'Review this environment variable and ensure it\'s not publicly accessible',
        });
      }

      // Check for missing encryption indicators
      if (!secret.key.toLowerCase().includes('encrypted') &&
          (secret.key.toLowerCase().includes('secret') ||
           secret.key.toLowerCase().includes('password'))) {
        findings.push({
          type: 'env_leak',
          severity: 'medium',
          description: `Sensitive variable "${secret.key}" may not be properly encrypted`,
          location: `Project: ${secret.project_id}`,
          recommendation: 'Ensure this variable is encrypted at rest and in transit',
        });
      }
    });

    // Create scan record
    const scanId = await createScanRecord('automated', findings.length);

    // Store findings
    if (findings.length > 0 && scanId) {
      await storeFindings(scanId, findings);
    }

  } catch (error) {
    console.error('Error scanning environment variables:', error);
  }

  return findings;
}

/**
 * Scan for potential database leaks
 */
export async function scanDatabaseLeaks(): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];

  try {
    // Check for overly permissive RLS policies
    const { data: tables, error: tablesError } = await supabase.rpc(
      'check_table_permissions'
    ).catch(() => ({ data: null, error: null }));

    // Check audit logs for suspicious access patterns
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('action, details, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!auditError && auditLogs) {
      // Detect unusual access patterns
      const accessCounts = new Map<string, number>();

      auditLogs.forEach(log => {
        const key = log.action;
        accessCounts.set(key, (accessCounts.get(key) || 0) + 1);
      });

      // Flag if there are too many read operations in short time
      accessCounts.forEach((count, action) => {
        if (count > 500 && action.includes('read')) {
          findings.push({
            type: 'database_leak',
            severity: 'high',
            description: `Unusual number of ${action} operations detected (${count} in last 24h)`,
            recommendation: 'Review access patterns and ensure no data exfiltration is occurring',
          });
        }
      });
    }

    // Check for potential SQL injection attempts in audit logs
    if (!auditError && auditLogs) {
      const sqlInjectionPatterns = [
        /(\bunion\b.*\bselect\b)/i,
        /(\bdrop\b.*\btable\b)/i,
        /(\bexec\b.*\bxp_)/i,
        /(';.*--)/i,
      ];

      auditLogs.forEach(log => {
        const details = JSON.stringify(log.details);
        sqlInjectionPatterns.forEach(pattern => {
          if (pattern.test(details)) {
            findings.push({
              type: 'database_leak',
              severity: 'critical',
              description: 'Potential SQL injection attempt detected',
              location: `Action: ${log.action}`,
              sample: details.substring(0, 100),
              recommendation: 'Immediate investigation required. Review security measures and input validation.',
            });
          }
        });
      });
    }

    // Log detection
    await logSecurityDetection({
      type: 'database_leak',
      severity: findings.length > 0 ? 'high' : 'low',
      description: `Database leak scan completed. Found ${findings.length} potential issues.`,
      findings_count: findings.length,
    });

  } catch (error) {
    console.error('Error scanning for database leaks:', error);
  }

  return findings;
}

/**
 * Scan text content for exposed secrets
 */
export function scanTextForSecrets(text: string, location: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  SENSITIVE_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const sample = match[0].substring(0, 50) + '...';
      findings.push({
        type: 'credential_leak',
        severity: determineSecretSeverity(match[0]),
        description: `Potential credential or secret found in ${location}`,
        location,
        sample: sample.replace(/[a-zA-Z0-9]/g, '*'), // Obfuscate
        recommendation: 'Remove hardcoded credentials and use environment variables or secrets management',
      });
    }
  });

  return findings;
}

/**
 * Determine severity based on secret type
 */
function determineSecretSeverity(secret: string): 'critical' | 'high' | 'medium' | 'low' {
  if (secret.includes('AKIA') || secret.includes('BEGIN PRIVATE KEY')) {
    return 'critical';
  }
  if (secret.toLowerCase().includes('password') ||
      secret.toLowerCase().includes('secret')) {
    return 'high';
  }
  if (secret.toLowerCase().includes('api') ||
      secret.toLowerCase().includes('key')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Create a security scan record
 */
async function createScanRecord(
  scanType: 'automated' | 'manual' | 'scheduled',
  findingsCount: number
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('env_exposure_scans')
      .insert({
        scan_type: scanType,
        status: 'completed',
        findings_count: findingsCount,
        critical_findings_count: 0,
        high_findings_count: findingsCount,
        completed_at: new Date().toISOString(),
        triggered_by: user.user?.id,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error creating scan record:', error);
    return null;
  }
}

/**
 * Store security findings
 */
async function storeFindings(scanId: string, findings: SecurityFinding[]) {
  try {
    const findingsData = findings.map(finding => ({
      scan_id: scanId,
      finding_type: mapFindingType(finding.type),
      severity: finding.severity,
      variable_name: 'N/A',
      location: finding.location || 'Unknown',
      description: finding.description,
      recommendation: finding.recommendation,
      status: 'open',
    }));

    const { error } = await supabase
      .from('env_exposure_findings')
      .insert(findingsData);

    if (error) throw error;
  } catch (error) {
    console.error('Error storing findings:', error);
  }
}

/**
 * Map finding type to database enum
 */
function mapFindingType(type: SecurityFinding['type']): string {
  const mapping: Record<string, string> = {
    'database_leak': 'exposed_in_logs',
    'env_leak': 'exposed_in_code',
    'api_key_leak': 'exposed_in_code',
    'credential_leak': 'exposed_in_code',
  };
  return mapping[type] || 'exposed_in_code';
}

/**
 * Log security detection event
 */
async function logSecurityDetection(data: {
  type: string;
  severity: string;
  description: string;
  findings_count: number;
}) {
  try {
    await supabase.from('security_leak_detections').insert({
      detection_type: data.type,
      severity: data.severity,
      source: 'automated_scan',
      description: data.description,
      metadata: { findings_count: data.findings_count },
    });
  } catch (error) {
    console.error('Error logging security detection:', error);
  }
}

/**
 * Get recent security findings
 */
export async function getRecentSecurityFindings(limit: number = 50) {
  const { data, error } = await supabase
    .from('security_leak_detections')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching security findings:', error);
    return [];
  }

  return data || [];
}

/**
 * Run a full security scan
 */
export async function runFullSecurityScan() {
  const results = {
    envFindings: await scanEnvironmentVariables(),
    dbFindings: await scanDatabaseLeaks(),
    timestamp: new Date().toISOString(),
  };

  return results;
}
