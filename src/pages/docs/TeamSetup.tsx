import { Card } from "@/components/ui/card";
import { TerminalWindow, TerminalLine } from "@/components/TerminalWindow";
import { Users, Shield, Key, UserPlus } from "lucide-react";

export default function TeamSetup() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          Team Setup
        </h1>
        <p className="text-xl text-muted-foreground">
          Share secrets securely with your team using zero-knowledge encryption
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          Step 1: Enable Team Sync
        </h2>
        <p className="text-muted-foreground mb-4">
          First, authenticate with ENVault to enable team features:
        </p>
        <TerminalWindow>
          <TerminalLine prompt>envault login</TerminalLine>
          <div className="text-terminal-text/70">Opening browser for authentication...</div>
          <TerminalLine success>Logged in as you@company.com</TerminalLine>
          <div className="h-2" />
          <TerminalLine prompt>envault init my-team-project --team</TerminalLine>
          <TerminalLine success>Project 'my-team-project' created</TerminalLine>
          <TerminalLine success>Team sync enabled</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Step 2: Invite Team Members
        </h2>
        <p className="text-muted-foreground mb-4">
          You can invite team members through the web dashboard or CLI:
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">Via Web Dashboard</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Navigate to your project → Team → Invite Members
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">Via CLI</h3>
        <TerminalWindow>
          <TerminalLine prompt>envault team invite alice@company.com</TerminalLine>
          <TerminalLine success>Invitation sent to alice@company.com</TerminalLine>
          <div className="h-2" />
          <TerminalLine prompt>envault team invite bob@company.com</TerminalLine>
          <TerminalLine success>Invitation sent to bob@company.com</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Step 3: Team Members Join</h2>
        <p className="text-muted-foreground mb-4">
          Team members receive an email invitation and can access the project:
        </p>
        <TerminalWindow>
          <div className="text-terminal-text/50"># Team member logs in</div>
          <TerminalLine prompt>envault login</TerminalLine>
          <TerminalLine success>Logged in as alice@company.com</TerminalLine>
          <div className="h-2" />
          <div className="text-terminal-text/50"># Pull the shared project</div>
          <TerminalLine prompt>envault pull my-team-project</TerminalLine>
          <TerminalLine success>Pulled 24 variables (encrypted)</TerminalLine>
          <TerminalLine success>Project ready to use</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Step 4: Sync Changes</h2>
        <p className="text-muted-foreground mb-4">
          Keep your team in sync with automatic or manual synchronization:
        </p>
        <TerminalWindow>
          <div className="text-terminal-text/50"># Push your changes to the team</div>
          <TerminalLine prompt>envault sync --push</TerminalLine>
          <TerminalLine success>Pushed 3 updated variables</TerminalLine>
          <div className="h-2" />
          <div className="text-terminal-text/50"># Pull latest changes from team</div>
          <TerminalLine prompt>envault sync --pull</TerminalLine>
          <TerminalLine success>Pulled 2 updated variables</TerminalLine>
          <div className="h-2" />
          <div className="text-terminal-text/50"># Bidirectional sync</div>
          <TerminalLine prompt>envault sync</TerminalLine>
          <TerminalLine success>Synced successfully</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          How Team Sync Works (Zero-Knowledge)
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <div>
              <strong>Local Encryption:</strong> Variables are encrypted on your device before upload using AES-256-GCM
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <div>
              <strong>Secure Key Sharing:</strong> Project encryption key is shared via secure invite link (only accessible by invited members)
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <div>
              <strong>Local Decryption:</strong> Team members decrypt variables locally with the shared key
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">4.</span>
            <div>
              <strong>Zero Server Knowledge:</strong> ENVault servers never see plaintext values - only encrypted blobs
            </div>
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Team Members</h2>
        <p className="text-muted-foreground mb-4">
          View and manage your team members:
        </p>
        <TerminalWindow>
          <div className="text-terminal-text/50"># List all team members</div>
          <TerminalLine prompt>envault team list</TerminalLine>
          <div className="text-terminal-text/70">alice@company.com (Admin)</div>
          <div className="text-terminal-text/70">bob@company.com (Member)</div>
          <div className="h-2" />
          <div className="text-terminal-text/50"># Remove a team member</div>
          <TerminalLine prompt>envault team remove bob@company.com</TerminalLine>
          <TerminalLine success>bob@company.com removed from team</TerminalLine>
        </TerminalWindow>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Role-Based Access Control</h2>
        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded">
            <strong className="block mb-1">Admin</strong>
            <p className="text-sm text-muted-foreground">
              Full access: read, write, delete variables, invite/remove members, manage project settings
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <strong className="block mb-1">Member</strong>
            <p className="text-sm text-muted-foreground">
              Read and write variables, view team members (cannot invite/remove members or delete project)
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded">
            <strong className="block mb-1">Read-Only</strong>
            <p className="text-sm text-muted-foreground">
              View variables only (useful for CI/CD, deployment scripts)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Use separate projects for different applications/services</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Regularly review team members and remove those who no longer need access</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Use role-based access - grant minimum necessary permissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Enable audit logging to track who changed what and when</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Sync regularly to keep the team updated with latest changes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Use environment-specific access control for production secrets</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
