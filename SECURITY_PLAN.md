# EnvVault Security Overhaul Plan

**Version**: 1.0
**Date**: 2025-11-16
**Status**: In Progress
**Target**: Enterprise-Grade Security

---

## Executive Summary

EnvVault handles highly sensitive environment variables and secrets for enterprise clients. This security overhaul ensures:

1. **Zero data leaks** across all vectors (memory, disk, network, logs)
2. **Enterprise compliance** (SOC2, GDPR, HIPAA-ready)
3. **Defense in depth** with multiple security layers
4. **Secure by default** configuration
5. **Audit trail** for all sensitive operations

---

## Current Security Assessment

### ✅ Existing Security Features

**Encryption**
- AES-256-GCM authenticated encryption
- OS keychain integration for master keys
- Zero plaintext on disk
- End-to-end encryption for sync

**Backend Security**
- Row-Level Security (RLS) on all tables
- SQL injection prevention (parameterized queries)
- CSRF protection (Supabase)
- XSS protection (React)
- Token-based CLI authentication
- Audit logging with triggers

**Input Validation**
- Environment variable key validation
- Sensitive key detection
- File path validation
- Email validation

### ⚠️ Security Gaps Identified

**Critical Gaps**
- ❌ No memory zeroing after handling secrets
- ❌ Secrets potentially visible in process memory
- ❌ No rate limiting on API endpoints
- ❌ Debug/verbose mode may leak sensitive data
- ❌ No 2FA/MFA support
- ❌ Session tokens don't rotate
- ❌ No encryption key rotation mechanism
- ❌ Shell history may capture secrets
- ❌ No request signing for API calls

**High Priority Gaps**
- ❌ No security headers (CSP, HSTS, etc.)
- ❌ No IP-based access restrictions
- ❌ Limited session management
- ❌ No anomaly detection
- ❌ File permissions not enforced strictly
- ❌ Temporary files not securely cleaned
- ❌ No clipboard security (auto-clear)
- ❌ No protection against timing attacks

**Medium Priority Gaps**
- ❌ No dependency vulnerability scanning
- ❌ No static code analysis
- ❌ Limited compliance documentation
- ❌ No penetration testing
- ❌ No incident response plan
- ❌ No security training materials

---

## Security Improvement Roadmap

### Phase 1: Critical CLI Security (Week 1)

#### 1.1 Memory Security
**Priority**: CRITICAL
**Risk**: Secrets in memory can be dumped/accessed

**Implementation**:
- [ ] Add secure memory wiping for sensitive data
- [ ] Implement `SecureString` type that auto-zeros on deallocation
- [ ] Clear all byte slices containing secrets after use
- [ ] Use `runtime.KeepAlive()` to prevent premature GC
- [ ] Lock memory pages containing secrets (mlock/VirtualLock)
- [ ] Disable core dumps for CLI process

**Files to Modify**:
- `cli/internal/crypto/crypto.go` - Add secure memory functions
- `cli/internal/crypto/secure_memory.go` - New file for memory security
- All command files that handle secrets

**Code Example**:
```go
// SecureString with automatic zeroing
type SecureString struct {
    data []byte
}

func (s *SecureString) Clear() {
    for i := range s.data {
        s.data[i] = 0
    }
}

func (s *SecureString) String() string {
    defer s.Clear()
    return string(s.data)
}
```

#### 1.2 Shell History Protection
**Priority**: CRITICAL
**Risk**: Secrets passed as CLI arguments appear in shell history

**Implementation**:
- [ ] Detect when secrets are passed as arguments vs stdin/file
- [ ] Warn users about shell history risks
- [ ] Recommend using `--` or stdin for sensitive values
- [ ] Add `.envvault_history` exclusion pattern
- [ ] Implement `HISTIGNORE` recommendations in docs

**Files to Modify**:
- `cli/cmd/set.go` - Add warnings for inline secrets
- `cli/cmd/login.go` - Prevent token in process list
- `cli/internal/utils/security.go` - New file for security utilities

#### 1.3 File Permission Security
**Priority**: CRITICAL
**Risk**: Unauthorized local access to database/config files

**Implementation**:
- [ ] Set database file to `0600` (owner read/write only)
- [ ] Set config files to `0600`
- [ ] Set export files to `0600` by default
- [ ] Verify parent directory permissions
- [ ] Add file permission checks on startup
- [ ] Warn if files have insecure permissions

**Files to Modify**:
- `cli/internal/config/config.go` - Add permission enforcement
- `cli/internal/storage/database.go` - Set DB permissions
- `cli/cmd/export.go` - Set secure export permissions
- `cli/cmd/init.go` - Set secure initial permissions

#### 1.4 Process Security
**Priority**: HIGH
**Risk**: Secrets visible in process arguments or environment

**Implementation**:
- [ ] Don't pass secrets via environment variables to child processes
- [ ] Clear environment after injection in `run` command
- [ ] Prevent process name from showing sensitive data
- [ ] Add process title obfuscation where possible

**Files to Modify**:
- `cli/cmd/run.go` - Secure environment injection

#### 1.5 Logging & Debug Security
**Priority**: HIGH
**Risk**: Secrets leaked in debug logs

**Implementation**:
- [ ] Implement redaction for all log output
- [ ] Create allowlist for loggable fields
- [ ] Add `[REDACTED]` replacement for sensitive values
- [ ] Disable verbose logging in production builds
- [ ] Add compile-time flag to remove debug code

**Files to Modify**:
- `cli/internal/utils/logger.go` - New secure logging utility
- All command files - Replace direct prints with secure logger

---

### Phase 2: Backend API Security (Week 2)

#### 2.1 Rate Limiting
**Priority**: CRITICAL
**Risk**: Brute force attacks, DDoS, credential stuffing

**Implementation**:
- [ ] Implement rate limiting on all RPC functions
- [ ] Different limits for auth vs. data operations
- [ ] Per-user and per-IP rate limiting
- [ ] Exponential backoff for failed auth attempts
- [ ] Account lockout after N failed attempts

**Strategy**:
- Auth endpoints: 5 attempts per 15 minutes
- Read operations: 100 requests per minute
- Write operations: 50 requests per minute
- Sync operations: 10 requests per minute

**Files to Create**:
- `supabase/migrations/20251117000000_add_rate_limiting.sql`

**Supabase Implementation**:
```sql
-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND endpoint = p_endpoint
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  RETURN v_count < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.2 Security Headers
**Priority**: HIGH
**Risk**: XSS, clickjacking, MITM attacks

**Implementation**:
- [ ] Content-Security-Policy (CSP)
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy

**Files to Modify**:
- Frontend hosting configuration (Lovable/Vercel)
- `src/middleware/security-headers.ts` - New file

#### 2.3 Request Validation & Sanitization
**Priority**: HIGH
**Risk**: Injection attacks, malformed data

**Implementation**:
- [ ] Validate all input types strictly
- [ ] Size limits on all request bodies
- [ ] Reject requests with unexpected fields
- [ ] Sanitize all user-provided strings
- [ ] Validate UUIDs format
- [ ] Check email format server-side
- [ ] Validate JSON structure before parsing

**Files to Modify**:
- All RPC functions in migration files
- Add validation helper functions

#### 2.4 API Request Signing
**Priority**: MEDIUM
**Risk**: Request tampering, replay attacks

**Implementation**:
- [ ] HMAC signing of all CLI→API requests
- [ ] Timestamp validation (±5 minutes tolerance)
- [ ] Nonce tracking to prevent replay
- [ ] Request body hashing
- [ ] Signature verification middleware

**Files to Create**:
- `cli/internal/api/signing.go` - Request signing
- `supabase/migrations/20251117010000_add_request_signing.sql`

---

### Phase 3: Encryption & Key Management (Week 3)

#### 3.1 Key Rotation
**Priority**: HIGH
**Risk**: Long-lived keys increase exposure risk

**Implementation**:
- [ ] Add key version tracking
- [ ] Support multiple active keys
- [ ] Automatic re-encryption on rotation
- [ ] Scheduled rotation reminders
- [ ] Emergency rotation procedure
- [ ] Key rotation audit logging

**Files to Create**:
- `cli/internal/crypto/key_rotation.go`
- `cli/cmd/rotate.go` - New command

**Design**:
```go
type KeyVersion struct {
    Version   int
    Key       []byte
    CreatedAt time.Time
    RotatedAt *time.Time
    Status    string // active, rotated, retired
}

func RotateKeys() error {
    // 1. Generate new key
    // 2. Re-encrypt all secrets with new key
    // 3. Mark old key as rotated
    // 4. Update keychain with new key
}
```

#### 3.2 Enhanced Key Derivation
**Priority**: HIGH
**Risk**: Weak key derivation allows brute force

**Implementation**:
- [ ] Use Argon2id for password-based keys
- [ ] Increase iteration counts
- [ ] Use unique salt per key
- [ ] Store salt securely
- [ ] Add key strengthening

**Files to Modify**:
- `cli/internal/crypto/crypto.go` - Add Argon2id

**Dependencies**:
```go
import "golang.org/x/crypto/argon2"

func DeriveKey(password, salt []byte) []byte {
    return argon2.IDKey(password, salt, 3, 64*1024, 4, 32)
}
```

#### 3.3 Secure Random Generation
**Priority**: MEDIUM
**Risk**: Predictable random values compromise security

**Implementation**:
- [ ] Use crypto/rand for all random generation
- [ ] Never use math/rand for security
- [ ] Verify entropy sources
- [ ] Add randomness tests
- [ ] Implement CSPRNGs correctly

**Files to Review**:
- All files using random generation

---

### Phase 4: Authentication & Access Control (Week 4)

#### 4.1 Multi-Factor Authentication (2FA/MFA)
**Priority**: HIGH
**Risk**: Credential compromise leads to full access

**Implementation**:
- [ ] TOTP support (Google Authenticator, Authy)
- [ ] Backup codes generation
- [ ] 2FA enforcement for admins
- [ ] Recovery process
- [ ] 2FA status in audit logs

**Files to Create**:
- `supabase/migrations/20251118000000_add_mfa.sql`
- `src/pages/Security2FA.tsx`
- `cli/cmd/mfa.go` - MFA setup command

**Database Schema**:
```sql
CREATE TABLE mfa_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

#### 4.2 Session Security
**Priority**: HIGH
**Risk**: Session hijacking, long-lived sessions

**Implementation**:
- [ ] Shorter session lifetimes (1 hour active, 24 hour refresh)
- [ ] Session token rotation on sensitive operations
- [ ] Concurrent session detection
- [ ] Session revocation API
- [ ] Device fingerprinting
- [ ] Geo-based anomaly detection

**Files to Modify**:
- `cli/internal/auth/auth.go` - Session management
- Backend session tables

#### 4.3 Role-Based Access Control (RBAC) Enforcement
**Priority**: MEDIUM
**Risk**: Privilege escalation, unauthorized access

**Implementation**:
- [ ] Enforce roles at database level
- [ ] Principle of least privilege
- [ ] Separate read/write permissions
- [ ] Admin-only operations protection
- [ ] Audit all permission checks

**Files to Modify**:
- All RPC functions - Add role checks
- `supabase/migrations/20251118010000_enhance_rbac.sql`

---

### Phase 5: Monitoring & Compliance (Week 5)

#### 5.1 Security Event Logging
**Priority**: HIGH
**Risk**: Security incidents go undetected

**Implementation**:
- [ ] Log all authentication attempts
- [ ] Log all failed operations
- [ ] Log permission denials
- [ ] Log unusual activity patterns
- [ ] Log key rotations
- [ ] Log exports/imports
- [ ] Log admin actions
- [ ] Centralized log aggregation

**Events to Log**:
- Login/logout (success/failure)
- Token generation/revocation
- Secret access (read/write/delete)
- Permission changes
- Environment creation/deletion
- Project access
- Sync operations
- Export operations

**Files to Modify**:
- Enhance existing audit_logs table
- Add real-time alerting

#### 5.2 Anomaly Detection
**Priority**: MEDIUM
**Risk**: Attacks not detected quickly

**Implementation**:
- [ ] Unusual access patterns (time, location, volume)
- [ ] Brute force detection
- [ ] Data exfiltration detection (large exports)
- [ ] Concurrent session anomalies
- [ ] Rapid secret changes
- [ ] Failed permission checks spike

**Files to Create**:
- `supabase/functions/security-monitoring/index.ts`

#### 5.3 Compliance Documentation
**Priority**: MEDIUM
**Risk**: Cannot demonstrate compliance to auditors

**Implementation**:
- [ ] GDPR compliance guide
- [ ] SOC 2 readiness documentation
- [ ] HIPAA compliance notes
- [ ] Data retention policies
- [ ] Privacy policy
- [ ] Incident response plan
- [ ] Security questionnaire responses

**Files to Create**:
- `docs/compliance/GDPR.md`
- `docs/compliance/SOC2.md`
- `docs/compliance/SECURITY_QUESTIONNAIRE.md`
- `docs/INCIDENT_RESPONSE.md`

---

### Phase 6: Code Security & Testing (Week 6)

#### 6.1 Dependency Security
**Priority**: HIGH
**Risk**: Vulnerable dependencies compromise system

**Implementation**:
- [ ] Automated dependency scanning (Dependabot, Snyk)
- [ ] Regular dependency updates
- [ ] Pin dependency versions
- [ ] Verify package checksums
- [ ] Review security advisories
- [ ] Supply chain attack prevention

**Files to Create**:
- `.github/dependabot.yml`
- `cli/go.sum` verification script

#### 6.2 Static Code Analysis
**Priority**: MEDIUM
**Risk**: Code vulnerabilities slip through

**Implementation**:
- [ ] Go: gosec, staticcheck
- [ ] TypeScript: eslint-plugin-security
- [ ] SQL: sqlcheck
- [ ] Secret scanning: truffleHog, git-secrets
- [ ] CI/CD integration

**Files to Create**:
- `.github/workflows/security-scan.yml`
- `scripts/security-scan.sh`

#### 6.3 Security Testing Suite
**Priority**: MEDIUM
**Risk**: Security regressions introduced

**Implementation**:
- [ ] Unit tests for security functions
- [ ] Integration tests for auth flows
- [ ] Fuzz testing for parsers
- [ ] Penetration testing (manual + automated)
- [ ] Security regression tests

**Files to Create**:
- `cli/internal/crypto/crypto_test.go` - Crypto tests
- `cli/internal/auth/auth_test.go` - Auth tests
- `tests/security/` - Security test suite

---

## Implementation Priority

### Immediate (Week 1-2) - CRITICAL
1. ✅ Memory security (secure wiping)
2. ✅ File permissions enforcement
3. ✅ Shell history protection
4. ✅ Rate limiting
5. ✅ Logging security (redaction)

### Short-term (Week 3-4) - HIGH
6. ✅ 2FA/MFA support
7. ✅ Key rotation mechanism
8. ✅ Session security improvements
9. ✅ Security headers
10. ✅ Request signing

### Medium-term (Week 5-6) - MEDIUM
11. ✅ Anomaly detection
12. ✅ Compliance documentation
13. ✅ Dependency scanning
14. ✅ Security testing
15. ✅ Static code analysis

---

## Success Metrics

### Security KPIs
- Zero data leak incidents
- 100% encrypted data at rest
- 100% encrypted data in transit
- < 1 second auth response time
- 99.9% uptime for security services
- 100% audit coverage
- < 24 hour incident response time

### Compliance Targets
- SOC 2 Type II ready (6 months)
- GDPR compliant (immediate)
- HIPAA-ready architecture (3 months)
- Zero critical vulnerabilities (continuous)
- < 30 day vulnerability patch time

---

## Risk Mitigation

### High-Risk Scenarios

**Scenario 1: Master Key Compromise**
- **Mitigation**: Key rotation mechanism, multi-key support
- **Detection**: Unusual decryption attempts
- **Response**: Emergency rotation procedure

**Scenario 2: Database Breach**
- **Mitigation**: All data encrypted, RLS, network isolation
- **Detection**: Unusual query patterns
- **Response**: Revoke all tokens, force re-encryption

**Scenario 3: Insider Threat**
- **Mitigation**: RBAC, audit logging, least privilege
- **Detection**: Anomaly detection, access patterns
- **Response**: Immediate access revocation, forensics

**Scenario 4: Supply Chain Attack**
- **Mitigation**: Dependency scanning, checksums, pinning
- **Detection**: Hash verification, behavior monitoring
- **Response**: Rollback, dependency audit

---

## Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | CLI Critical Security | Memory security, file permissions, shell protection |
| 2 | Backend Security | Rate limiting, headers, validation |
| 3 | Encryption | Key rotation, enhanced derivation |
| 4 | Auth & Access | 2FA, session security, RBAC |
| 5 | Monitoring | Event logging, anomaly detection, compliance docs |
| 6 | Testing | Dependency scanning, static analysis, security tests |

---

## Resources Required

### Tools
- Snyk or Dependabot (dependency scanning)
- gosec (Go security scanner)
- SonarQube or CodeQL (static analysis)
- OWASP ZAP (penetration testing)
- Sentry or LogRocket (error tracking)

### External Services
- SMS provider for 2FA (Twilio)
- Email service for security alerts
- Security audit firm (penetration testing)

---

## Acceptance Criteria

**For Production Deployment**:
- [ ] All CRITICAL items completed
- [ ] All HIGH items completed
- [ ] Security testing passed
- [ ] Penetration test completed
- [ ] Security documentation complete
- [ ] Incident response plan in place
- [ ] 2FA enforced for admin accounts
- [ ] Rate limiting active
- [ ] All secrets wiped from memory
- [ ] All files have secure permissions

**For Enterprise Sales**:
- [ ] SOC 2 documentation started
- [ ] Security questionnaire responses ready
- [ ] Compliance guides published
- [ ] Security whitepaper available
- [ ] Audit logging comprehensive
- [ ] Anomaly detection active

---

## Next Steps

1. **Review and approve this security plan**
2. **Start Phase 1 implementation** (CLI critical security)
3. **Set up security scanning tools**
4. **Create security testing framework**
5. **Begin compliance documentation**

---

**Document Owner**: Security Team
**Last Updated**: 2025-11-16
**Next Review**: 2025-11-23
