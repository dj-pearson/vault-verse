import { Card } from "@/components/ui/card";
import { Shield, Lock, Key, Database, Eye, CheckCircle2, AlertCircle, Server, FileKey, UserCheck } from "lucide-react";

export default function Security() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          Security Architecture
        </h1>
        <p className="text-xl text-muted-foreground">
          Your secrets are yours. We can't see them, and we never will.
        </p>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex gap-4">
          <Lock className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-3">Zero-Knowledge Encryption</h2>
            <p className="text-muted-foreground mb-4">
              ENVault uses zero-knowledge encryption architecture. This means your environment variables are encrypted on your device before anything touches our servers. We store encrypted blobs that only you (and your authorized team members) can decrypt.
            </p>
            <div className="bg-background p-4 rounded">
              <p className="text-sm font-semibold mb-2">What this means for you:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We never see your actual secrets in plaintext</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Even if our servers are compromised, your data stays safe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Only you and your team can decrypt your variables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We can't recover lost encryption keys (so keep them safe!)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          Encryption Details
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded">
            <div className="flex items-start gap-3">
              <FileKey className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Algorithm: AES-256-GCM</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode, providing both confidentiality and authenticity.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Key Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Cryptographically secure random keys generated using your OS's secure random number generator (crypto.getRandomValues in browser, crypto/rand in Go).
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Key Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Master encryption keys are stored in your operating system's secure keychain:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• macOS: Keychain Access</li>
                  <li>• Windows: Credential Manager</li>
                  <li>• Linux: Secret Service API (gnome-keyring, kwallet)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Server className="h-6 w-6 text-primary" />
          What We Store
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold">Data Type</th>
                <th className="text-left py-3 px-2 font-semibold">Storage Method</th>
                <th className="text-left py-3 px-2 font-semibold">Can We See It?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Variable Names</td>
                <td className="py-3 px-2">Encrypted</td>
                <td className="py-3 px-2 text-green-600 font-semibold">No</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Variable Values</td>
                <td className="py-3 px-2">Encrypted</td>
                <td className="py-3 px-2 text-green-600 font-semibold">No</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Project Name</td>
                <td className="py-3 px-2">Plaintext</td>
                <td className="py-3 px-2 text-blue-600 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Project Description</td>
                <td className="py-3 px-2">Plaintext</td>
                <td className="py-3 px-2 text-blue-600 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Team Member Emails</td>
                <td className="py-3 px-2">Plaintext</td>
                <td className="py-3 px-2 text-blue-600 font-semibold">Yes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Encryption Keys</td>
                <td className="py-3 px-2">Never stored on servers</td>
                <td className="py-3 px-2 text-green-600 font-semibold">No</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-2">Audit Logs (metadata)</td>
                <td className="py-3 px-2">Plaintext</td>
                <td className="py-3 px-2 text-blue-600 font-semibold">Yes (who/when only)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          We only see basic metadata needed to provide the service. Your secrets remain completely private.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Threat Model
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded">
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Protected Against</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Server Breach:</strong> Encrypted data is useless without keys</li>
                  <li>• <strong>Insider Threat:</strong> ENVault employees cannot access your secrets</li>
                  <li>• <strong>Man-in-the-Middle:</strong> All data encrypted before transmission</li>
                  <li>• <strong>Database Leak:</strong> Only encrypted blobs would be exposed</li>
                  <li>• <strong>Subpoena/Legal Requests:</strong> We can't provide what we don't have</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Your Responsibility</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Device Security:</strong> Keep your computer secure (full disk encryption, strong passwords)</li>
                  <li>• <strong>Key Management:</strong> Safely backup your master encryption keys</li>
                  <li>• <strong>Phishing:</strong> Verify you're on the real ENVault website/app</li>
                  <li>• <strong>Team Access:</strong> Only invite trusted team members</li>
                  <li>• <strong>Account Security:</strong> Use strong passwords and enable 2FA</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Authentication & Authorization
        </h2>
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Multi-Factor Authentication (2FA)</h3>
            <p className="text-sm text-muted-foreground">
              Optional but strongly recommended. Supports TOTP authenticator apps (Google Authenticator, Authy, 1Password).
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Session Management</h3>
            <p className="text-sm text-muted-foreground">
              Secure session tokens with automatic expiration. View and revoke active sessions from your dashboard.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">CLI Token Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Generate personal access tokens for CLI access. Tokens can be scoped to specific projects and have expiration dates.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Role-Based Access Control (RBAC)</h3>
            <p className="text-sm text-muted-foreground">
              Granular permissions: Admin, Member, Read-Only. Control who can read, write, or manage secrets.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Infrastructure Security</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Hosting</h3>
            <p className="text-sm text-muted-foreground">
              Hosted on enterprise-grade cloud infrastructure with SOC 2 compliance
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Network Security</h3>
            <p className="text-sm text-muted-foreground">
              TLS 1.3 for all connections, strict firewall rules, DDoS protection
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Database Encryption</h3>
            <p className="text-sm text-muted-foreground">
              Encrypted at rest, automated backups with point-in-time recovery
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Monitoring & Alerts</h3>
            <p className="text-sm text-muted-foreground">
              24/7 security monitoring, automated threat detection, incident response plan
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Audit & Compliance</h2>
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Audit Logging</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Every action is logged with timestamp, user, and IP address:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Variable creation, updates, and deletions</li>
              <li>• Team member invitations and removals</li>
              <li>• Login attempts and session activity</li>
              <li>• Project settings changes</li>
            </ul>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Data Retention</h3>
            <p className="text-sm text-muted-foreground">
              Audit logs retained for 90 days. Deleted data is permanently removed within 30 days.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">GDPR Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Full data portability, right to deletion, transparent data processing.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Vulnerability Management</h2>
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Security Updates</h3>
            <p className="text-sm text-muted-foreground">
              Regular security patches, automated dependency updates, immediate critical vulnerability fixes.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Responsible Disclosure</h3>
            <p className="text-sm text-muted-foreground">
              Found a security issue? Email security@envault.net. We respond within 24 hours and reward responsible disclosure.
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded">
            <h3 className="font-semibold mb-2">Open Source</h3>
            <p className="text-sm text-muted-foreground">
              CLI is open source - audit our code yourself. Community security reviews welcome.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h2 className="text-2xl font-bold mb-4">Security Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Enable full disk encryption on your device</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Use strong, unique passwords for your account</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Enable 2FA on your ENVault account</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Backup your master key securely (offline)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Rotate sensitive credentials regularly</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Review audit logs for suspicious activity</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Use environment-specific access controls</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Regularly review and remove inactive team members</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Use read-only tokens for CI/CD where possible</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm">Keep your CLI and dependencies up to date</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-primary/20">
        <h2 className="text-2xl font-bold mb-3">Questions About Security?</h2>
        <p className="text-muted-foreground mb-4">
          We take security seriously. If you have questions about our security practices or want to report a vulnerability:
        </p>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Security Contact:</strong> <a href="mailto:security@envault.net" className="text-primary hover:underline">security@envault.net</a>
          </p>
          <p>
            <strong>Documentation:</strong> Full security whitepaper available on request
          </p>
          <p>
            <strong>Compliance:</strong> SOC 2, GDPR compliant
          </p>
        </div>
      </Card>
    </div>
  );
}
