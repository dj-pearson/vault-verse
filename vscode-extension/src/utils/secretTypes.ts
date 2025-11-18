/**
 * Secret type detection and icon mapping
 */

export enum SecretType {
  API_KEY = 'api_key',
  DATABASE_URL = 'database_url',
  URL = 'url',
  TOKEN = 'token',
  PASSWORD = 'password',
  EMAIL = 'email',
  PORT = 'port',
  PATH = 'path',
  GENERIC = 'generic',
}

export interface SecretTypeInfo {
  type: SecretType;
  icon: string;
  color?: string;
  description: string;
}

/**
 * Detect secret type based on key name and value
 */
export function detectSecretType(key: string, value: string): SecretTypeInfo {
  const keyLower = key.toLowerCase();
  const valueLower = value.toLowerCase();

  // API Keys
  if (
    keyLower.includes('api_key') ||
    keyLower.includes('apikey') ||
    keyLower.match(/^[A-Z_]*KEY$/) ||
    valueLower.startsWith('sk_') ||
    valueLower.startsWith('pk_')
  ) {
    return {
      type: SecretType.API_KEY,
      icon: 'key',
      color: 'charts.yellow',
      description: 'API Key',
    };
  }

  // Database URLs
  if (
    keyLower.includes('database') ||
    keyLower.includes('db_url') ||
    valueLower.startsWith('postgres://') ||
    valueLower.startsWith('mysql://') ||
    valueLower.startsWith('mongodb://')
  ) {
    return {
      type: SecretType.DATABASE_URL,
      icon: 'database',
      color: 'charts.blue',
      description: 'Database Connection',
    };
  }

  // URLs
  if (
    keyLower.includes('url') ||
    keyLower.includes('endpoint') ||
    valueLower.startsWith('http://') ||
    valueLower.startsWith('https://')
  ) {
    return {
      type: SecretType.URL,
      icon: 'link',
      color: 'charts.green',
      description: 'URL/Endpoint',
    };
  }

  // Tokens (JWT, OAuth, etc.)
  if (
    keyLower.includes('token') ||
    keyLower.includes('jwt') ||
    keyLower.includes('bearer') ||
    keyLower.includes('oauth')
  ) {
    return {
      type: SecretType.TOKEN,
      icon: 'symbol-key',
      color: 'charts.orange',
      description: 'Access Token',
    };
  }

  // Passwords
  if (
    keyLower.includes('password') ||
    keyLower.includes('passwd') ||
    keyLower.includes('pwd')
  ) {
    return {
      type: SecretType.PASSWORD,
      icon: 'lock',
      color: 'charts.red',
      description: 'Password',
    };
  }

  // Email addresses
  if (keyLower.includes('email') || keyLower.includes('mail')) {
    return {
      type: SecretType.EMAIL,
      icon: 'mail',
      color: 'charts.purple',
      description: 'Email Address',
    };
  }

  // Port numbers
  if (keyLower.includes('port') && /^\d{2,5}$/.test(value)) {
    return {
      type: SecretType.PORT,
      icon: 'plug',
      description: 'Port Number',
    };
  }

  // File paths
  if (
    keyLower.includes('path') ||
    keyLower.includes('dir') ||
    value.includes('/') ||
    value.includes('\\')
  ) {
    return {
      type: SecretType.PATH,
      icon: 'folder',
      description: 'File Path',
    };
  }

  // Generic secret
  return {
    type: SecretType.GENERIC,
    icon: 'symbol-variable',
    description: 'Environment Variable',
  };
}

/**
 * Validate secret value for common security issues
 */
export interface SecretValidation {
  isValid: boolean;
  warnings: string[];
  severity: 'error' | 'warning' | 'info';
}

export function validateSecret(key: string, value: string): SecretValidation {
  const warnings: string[] = [];
  let severity: 'error' | 'warning' | 'info' = 'info';

  // Check for test/placeholder values
  const testPatterns = [
    /^(test|demo|example|placeholder|changeme|your_.*_here)/i,
    /^(xxx|yyy|zzz|abc|123)/i,
    /^(todo|fixme|replace)/i,
  ];

  for (const pattern of testPatterns) {
    if (pattern.test(value)) {
      warnings.push('⚠️ This looks like a test or placeholder value');
      severity = 'warning';
      break;
    }
  }

  // Check for weak values
  if (value.length < 8 && !key.includes('PORT')) {
    warnings.push('⚠️ Short value - consider using a stronger secret');
    severity = 'warning';
  }

  // Check for common weak passwords
  const weakPasswords = ['password', 'admin', '12345', 'secret', 'root'];
  if (weakPasswords.some((weak) => value.toLowerCase().includes(weak))) {
    warnings.push('🔴 Weak secret detected - use a stronger value');
    severity = 'error';
  }

  // Check if value matches key (usually a mistake)
  if (value.toLowerCase() === key.toLowerCase()) {
    warnings.push('🔴 Secret value matches key name - this is likely a mistake');
    severity = 'error';
  }

  // Empty values
  if (value.trim() === '') {
    warnings.push('🔴 Empty value detected');
    severity = 'error';
  }

  return {
    isValid: warnings.length === 0 || severity === 'info',
    warnings,
    severity,
  };
}

/**
 * Group secrets by common prefixes
 */
export function groupSecretsByPrefix(secrets: Record<string, any>): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const key of Object.keys(secrets)) {
    const parts = key.split('_');
    const prefix = parts.length > 1 ? parts[0] : 'Other';

    if (!groups.has(prefix)) {
      groups.set(prefix, []);
    }
    groups.get(prefix)!.push(key);
  }

  return groups;
}
