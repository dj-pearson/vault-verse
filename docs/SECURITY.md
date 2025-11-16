# EnvVault Security Documentation

**Last Updated**: November 16, 2025
**Security Model**: Zero-Knowledge Encryption

---

## Table of Contents

- [Security Overview](#security-overview)
- [Threat Model](#threat-model)
- [Encryption](#encryption)
- [Key Management](#key-management)
- [Zero-Knowledge Architecture](#zero-knowledge-architecture)
- [Team Sync Security](#team-sync-security)
- [Attack Mitigations](#attack-mitigations)
- [Security Best Practices](#security-best-practices)
- [Compliance](#compliance)
- [Vulnerability Disclosure](#vulnerability-disclosure)

---

## Security Overview

EnvVault is built with **security-first architecture** to protect your most sensitive data: environment variables, API keys, database credentials, and secrets.

### Core Security Principles

1. **Zero-Knowledge**: Server never sees your plaintext secrets
2. **Encryption at Rest**: All secrets encrypted with AES-256-GCM
3. **Encryption in Transit**: TLS 1.3 for all network communication
4. **Defense in Depth**: Multiple layers of security
5. **Least Privilege**: Role-based access control
6. **Audit Trail**: All actions logged

---

## Threat Model

EnvVault protects against:

| Threat | Protection | Status |
|--------|------------|--------|
| **Plaintext storage** | AES-256-GCM encryption | ✅ |
| **Git leaks** | No secrets in git | ✅ |
| **Server compromise** | Zero-knowledge encryption | ✅ |
| **Memory dumps** | Secure memory wiping | ✅ |
| **Swap file exposure** | Memory locking (mlock) | ✅ |
| **Crash dumps** | Core dumps disabled | ✅ |
| **Brute force** | Rate limiting | ✅ |
| **Man-in-the-middle** | TLS 1.3 + certificate pinning | ✅ |
| **Unauthorized access** | Row-Level Security (RLS) | ✅ |
| **Insider threats** | Audit logging | ✅ |
| **Social engineering** | 2FA (Phase 4) | ⏳ |

---

## Encryption

### Algorithm

**AES-256-GCM** (Advanced Encryption Standard with Galois/Counter Mode)

- **Key size**: 256 bits
- **Nonce size**: 96 bits (12 bytes)
- **Authentication**: Built-in via GCM
- **Implementation**: Go standard library (`crypto/aes`, `crypto/cipher`)

**Why AES-256-GCM?**
- ✅ Industry standard (approved by NIST, NSA)
- ✅ Authenticated encryption (prevents tampering)
- ✅ Fast in hardware (AES-NI instructions)
- ✅ Resistant to known attacks
- ✅ Post-quantum resistant (symmetric encryption)

### Encryption Process

```
Plaintext Secret
       ↓
[ AES-256-GCM ]
    ← Master Key (256 bits)
    ← Random Nonce (96 bits)
       ↓
Ciphertext (nonce prepended)
       ↓
Stored in SQLite
```

**Code snippet** (simplified):
```go
// Encrypt
nonce := generateRandomNonce(12)  // 96 bits
ciphertext := aes256gcm.Seal(nonce, nonce, plaintext, nil)

// Decrypt
nonce := ciphertext[:12]
plaintext := aes256gcm.Open(nil, nonce, ciphertext[12:], nil)
```

### What Gets Encrypted

| Data | Encrypted | Location |
|------|-----------|----------|
| Secret values | ✅ Yes | SQLite database |
| Secret keys (names) | ❌ No | SQLite database |
| Master key | ❌ No (secured in OS keychain) | OS Keychain |
| Sync blobs | ✅ Yes | Supabase (server) |
| Session tokens | ❌ No (hashed) | Supabase (server) |

---

## Key Management

### Master Key Generation

When you run `envvault init` for the first time:

```go
1. Generate 256-bit random key
   masterKey := randomBytes(32)

2. Store in OS keychain
   // macOS: Keychain Access
   // Windows: Credential Manager
   // Linux: Secret Service (libsecret)

3. Never written to disk in plaintext
```

### Master Key Storage

| Platform | Storage | Security |
|----------|---------|----------|
| **macOS** | Keychain Access | Hardware-encrypted, biometric protection |
| **Windows** | Credential Manager | DPAPI encryption |
| **Linux** | Secret Service (gnome-keyring) | User-level encryption |

**Access control**:
- Requires user authentication
- Protected by OS-level security
- Can be protected with biometrics (Touch ID, Windows Hello)

### Key Derivation

For password-based keys (future feature):

```go
// Argon2id (memory-hard, resistant to GPU attacks)
derivedKey := argon2id.Key(
    password,
    salt,
    time=3,      // Iterations
    memory=64MB, // Memory cost
    threads=4,   // Parallelism
    keyLen=32    // Output size
)
```

### Key Rotation

**Current**: Not automated (Phase 3 feature)

**When to rotate**:
- Team member leaves
- Suspected compromise
- Compliance requirement
- Every 90 days (recommended)

**How** (manual):
1. Export all secrets
2. Generate new master key
3. Re-encrypt all secrets
4. Sync to team

---

## Zero-Knowledge Architecture

**Principle**: The server never sees your plaintext secrets.

### Local Operation

```
┌─────────────────────────────────┐
│  Your Machine                   │
│                                 │
│  Plaintext Secret               │
│       ↓                         │
│  [ Encrypt ]                    │
│       ↓                         │
│  Ciphertext                     │
│       ↓                         │
│  SQLite Database                │
└─────────────────────────────────┘
```

### Team Sync Operation

```
┌─────────────────┐        ┌─────────────────┐
│  Your Machine   │        │  Team Member    │
│                 │        │                 │
│  Plaintext      │        │  Plaintext      │
│       ↓         │        │       ↑         │
│  [ Encrypt ]    │        │  [ Decrypt ]    │
│       ↓         │        │       ↑         │
│  Encrypted Blob │        │  Encrypted Blob │
└────────┬────────┘        └────────▲────────┘
         │                          │
         └──────────┬───────────────┘
                    │
         ┌──────────▼──────────┐
         │   EnvVault Server   │
         │                     │
         │  Stores:            │
         │  - Encrypted Blob   │
         │  - Checksum         │
         │  - Version          │
         │                     │
         │  Cannot decrypt!    │
         └─────────────────────┘
```

**Server never has**:
- ❌ Your master key
- ❌ Your plaintext secrets
- ❌ Ability to decrypt your data

**Server only has**:
- ✅ Encrypted blobs
- ✅ Checksums (for integrity)
- ✅ Version numbers
- ✅ Metadata (project ID, timestamps)

### Sync Protocol

```
# Push
1. Local: Export all secrets to JSON
2. Local: Encrypt JSON with master key
3. Local: Calculate checksum (SHA-256)
4. Local → Server: Send encrypted blob + checksum
5. Server: Store encrypted blob (cannot read)

# Pull
1. Local → Server: Request latest blob
2. Server → Local: Send encrypted blob + checksum
3. Local: Verify checksum
4. Local: Decrypt blob with master key
5. Local: Import secrets to database
```

---

## Team Sync Security

### Authentication

**Personal Access Tokens** (PAT):
- Generated at https://envault.net/settings/tokens
- SHA-256 hashed before storage
- 90-day expiration (default)
- Revocable anytime
- Rate-limited (5 generations per 15 minutes)

**Session Management**:
- JWT tokens for web interface
- Encrypted at rest
- HTTP-only cookies
- CSRF protection
- Session expiration (24 hours)

### Authorization

**Row-Level Security (RLS)** in Supabase:

```sql
-- Only team members can access project secrets
CREATE POLICY "team_access"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE project_id = projects.id
        AND user_id = auth.uid()
    )
  );
```

**Roles**:
- `admin` - Full access (all environments, team management)
- `developer` - Read/write development + staging
- `viewer` - Read-only access

### Data Integrity

**Checksums** prevent tampering:

```go
// Calculate checksum before upload
checksum := sha256.Sum256(encryptedBlob)

// Verify checksum after download
actualChecksum := sha256.Sum256(downloadedBlob)
if actualChecksum != expectedChecksum {
    panic("Data tampering detected!")
}
```

**Version Tracking**:
- Each push increments version
- Conflict detection via version numbers
- Audit trail of all changes

---

## Attack Mitigations

### 1. Brute Force Attacks

**Protection**: Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 attempts | 15 minutes |
| Token validation | 20 requests | 1 minute |
| Secret writes | 50 requests | 1 minute |
| Secret reads | 100 requests | 1 minute |
| Sync push | 10 requests | 1 minute |
| Sync pull | 20 requests | 1 minute |

**Implementation**:
```sql
-- check_rate_limit(endpoint, max_requests, window_seconds)
IF NOT check_rate_limit('generate_cli_token', 5, 900) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
END IF;
```

**Account lockout**: After 10 failed login attempts in 1 hour

---

### 2. Memory Attacks

**Protection**: Secure Memory Management

**Triple-pass wiping**:
```go
1. Overwrite with zeros
2. Overwrite with random data
3. Overwrite with zeros again

for i := range secret {
    secret[i] = 0
}
crypto.rand.Read(secret)
for i := range secret {
    secret[i] = 0
}
runtime.KeepAlive(secret)  // Prevent compiler optimization
```

**Memory locking** (prevents swap to disk):
```go
// Unix: mlock()
syscall.Mlock(secretBytes)

// Windows: VirtualLock()
kernel32.VirtualLock(addr, len)
```

**Core dumps disabled**:
```go
// Disable core dumps at startup
syscall.Setrlimit(syscall.RLIMIT_CORE, &syscall.Rlimit{Cur: 0, Max: 0})
```

---

### 3. Man-in-the-Middle (MITM)

**Protection**: TLS 1.3 + Certificate Pinning

**TLS Configuration**:
- TLS 1.3 only (no fallback to 1.2)
- Perfect Forward Secrecy (PFS)
- Strong cipher suites only
- HSTS enforced

**Certificate Pinning** (future):
```go
expectedFingerprint := "sha256/abc123..."
if actualFingerprint != expectedFingerprint {
    panic("Certificate mismatch!")
}
```

---

### 4. SQL Injection

**Protection**: Parameterized Queries

```sql
-- ❌ Vulnerable
query := "SELECT * FROM secrets WHERE key = '" + userInput + "'"

-- ✅ Protected
query := "SELECT * FROM secrets WHERE key = $1"
db.Query(query, userInput)
```

**All queries use**:
- Prepared statements
- Parameterized queries
- Input validation

---

### 5. XSS (Cross-Site Scripting)

**Protection**: React + Content Security Policy

**React**: Automatic escaping
```jsx
// Automatically escaped
<div>{userInput}</div>

// Safe
<div dangerouslySetInnerHTML={{__html: sanitized}} />
```

**CSP Headers**:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.envault.net;
```

---

### 6. CSRF (Cross-Site Request Forgery)

**Protection**: CSRF Tokens + SameSite Cookies

```http
Set-Cookie: session=...; SameSite=Strict; Secure; HttpOnly
X-CSRF-Token: abc123...
```

---

### 7. Log Injection

**Protection**: Automatic Redaction

```go
// Before logging
logMessage := redactSensitiveData(message)

// Patterns redacted:
// - API_KEY=abc123 → API_KEY=[REDACTED]
// - Bearer xyz → Bearer [REDACTED]
// - password=secret → password=[REDACTED]
// - Long hex strings → [REDACTED_HEX]
```

---

### 8. Timing Attacks

**Protection**: Constant-Time Comparison

```go
// ❌ Vulnerable
if token == expectedToken {
    return true
}

// ✅ Protected
func ConstantTimeCompare(a, b []byte) bool {
    if len(a) != len(b) {
        return false
    }
    var result byte = 0
    for i := 0; i < len(a); i++ {
        result |= a[i] ^ b[i]
    }
    return result == 0
}
```

---

## Security Best Practices

### For Users

1. **Enable 2FA** on your EnvVault account (when available)
2. **Use strong passwords** - 20+ characters, unique
3. **Rotate secrets regularly** - Every 90 days
4. **Use different secrets per environment** - Never reuse production keys
5. **Revoke access** when team members leave
6. **Backup encrypted exports** periodically
7. **Review audit logs** monthly
8. **Don't share accounts** - Each team member should have their own
9. **Protect your master key** - It's stored in OS keychain
10. **Use `envvault run`** - Don't export to .env files

### For Admins

1. **Use least privilege** - Don't give everyone admin
2. **Audit team access** - Review who has access quarterly
3. **Monitor sync activity** - Check for unusual patterns
4. **Enable rate limiting** - Prevent brute force
5. **Set up alerts** - Get notified of suspicious activity
6. **Backup databases** - Test restore procedures
7. **Rotate CLI tokens** - Every 90 days or on team change
8. **Review security headers** - Use SecurityHeaders.com
9. **Perform security audits** - Annual penetration testing
10. **Incident response plan** - Know what to do if compromised

### For Developers

1. **Never commit .envvault** - Already in .gitignore
2. **Never commit .env files** - Add to .gitignore
3. **Never hardcode secrets** - Use environment variables
4. **Use secure logging** - Redact secrets automatically
5. **Validate input** - Before passing to envvault commands
6. **Handle errors securely** - Don't leak secrets in error messages
7. **Use HTTPS only** - For all API communication
8. **Keep CLI updated** - `brew upgrade envvault`
9. **Review dependencies** - Check for vulnerabilities
10. **Test security** - Include in CI/CD pipeline

---

## Compliance

EnvVault is designed to help you achieve compliance with:

### SOC 2 Type II
- ✅ Encryption at rest and in transit
- ✅ Access controls (RBAC)
- ✅ Audit logging
- ✅ Change tracking
- ⏳ Formal security policies (in progress)
- ⏳ Third-party audit (planned)

### GDPR (General Data Protection Regulation)
- ✅ Data encryption
- ✅ Right to access (export feature)
- ✅ Right to deletion (delete account)
- ✅ Data portability (export feature)
- ✅ Breach notification procedures
- ✅ Privacy by design

### HIPAA (Healthcare)
- ✅ Encryption at rest (AES-256)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Access controls
- ✅ Audit trails
- ✅ Integrity controls (checksums)
- ⏳ BAA agreement (on request)

### PCI DSS (Payment Card Industry)
- ✅ Encryption of cardholder data
- ✅ Access control measures
- ✅ Regular monitoring and testing
- ✅ Strong cryptography
- ⏳ Quarterly vulnerability scans

---

## Security Audits

### Completed
- ✅ Internal security review (Nov 2025)
- ✅ Dependency vulnerability scan (Snyk)
- ✅ Static code analysis (golangci-lint, ESLint)

### Planned
- ⏳ Third-party penetration testing (Q1 2026)
- ⏳ SOC 2 Type II audit (Q2 2026)
- ⏳ Bug bounty program (Q2 2026)

---

## Vulnerability Disclosure

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

**Instead:**

1. **Email**: security@envault.net
2. **PGP Key**: https://envault.net/security/pgp.asc
3. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Severity assessment
- **7 days**: Fix for critical issues
- **30 days**: Fix for non-critical issues
- **Public disclosure**: After fix is deployed

### Rewards

We appreciate responsible disclosure and may offer:
- Public acknowledgment (Hall of Fame)
- Swag (t-shirts, stickers)
- Monetary rewards (for critical findings)

---

## Security Updates

### Notification Channels

- **Email**: security-announce@envault.net
- **Twitter**: @envvault
- **GitHub**: https://github.com/dj-pearson/vault-verse/security/advisories
- **Discord**: https://discord.gg/envvault (security-announcements channel)

### Update Policy

- **Critical**: Patch within 24 hours
- **High**: Patch within 7 days
- **Medium**: Patch within 30 days
- **Low**: Include in next release

---

## Security Checklist

Use this checklist to verify your EnvVault security:

### Initial Setup
- [ ] Strong password (20+ characters)
- [ ] 2FA enabled (when available)
- [ ] Master key stored in OS keychain
- [ ] `.envvault` in `.gitignore`
- [ ] CLI up to date (`envvault --version`)

### Ongoing
- [ ] Secrets rotated quarterly
- [ ] Audit logs reviewed monthly
- [ ] Team access reviewed quarterly
- [ ] Backups tested monthly
- [ ] Dependencies updated weekly
- [ ] Security alerts monitored

### Team
- [ ] All members have individual accounts
- [ ] Least privilege access granted
- [ ] Offboarding process documented
- [ ] Incident response plan exists
- [ ] Security training completed

---

## FAQ

### Is my data encrypted on the server?

**Yes**. Your secrets are encrypted **before** leaving your machine and stored encrypted on the server. The server cannot decrypt your data.

### What if EnvVault gets hacked?

Even if an attacker gains access to our servers, they cannot decrypt your secrets because we don't have your master key. They would only see encrypted blobs.

### Can EnvVault employees see my secrets?

**No**. We use zero-knowledge encryption. We cannot decrypt your secrets even if we wanted to.

### What happens if I lose my master key?

Local secrets: If your OS keychain is intact, you can still access them.
Team secrets: Other team members can share via EnvVault sync.
**Recommendation**: Keep encrypted backups.

### How do I know EnvVault is secure?

- Open source code (you can audit it)
- Industry-standard encryption (AES-256-GCM)
- Security audits (planned)
- Transparent security documentation
- Active security monitoring

### Can I self-host EnvVault?

The CLI works 100% offline (no server required).
Team sync requires a server (Supabase).
Self-hosting guide: Coming soon.

---

## Resources

- 🔒 **Security Policy**: https://envault.net/security
- 🐛 **Report Vulnerability**: security@envault.net
- 📚 **Security Blog**: https://envault.net/blog/security
- 🔑 **PGP Key**: https://envault.net/security/pgp.asc
- 📜 **Security Advisories**: https://github.com/dj-pearson/vault-verse/security/advisories

---

**Last reviewed**: November 16, 2025
**Next review**: February 16, 2026

**Your secrets are safe with EnvVault** 🔒
