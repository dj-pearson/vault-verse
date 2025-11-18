import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default function CLIReference() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Terminal className="h-10 w-10 text-primary" />
          CLI Reference
        </h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for all ENVault CLI commands
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault init</h2>
        <p className="text-sm text-muted-foreground mb-3">Initialize a new project</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault init [project-name] [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --team              Enable team sync</div>
          <div>  --env ENVIRONMENTS  Comma-separated environments</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault set</h2>
        <p className="text-sm text-muted-foreground mb-3">Set an environment variable</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault set KEY=value [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Target environment (default: development)</div>
          <div>  --file FILE         Import from .env file</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault get</h2>
        <p className="text-sm text-muted-foreground mb-3">Get a variable value</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault get KEY [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Target environment</div>
          <div>  --format FORMAT     Output format: plain, json, export</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault list</h2>
        <p className="text-sm text-muted-foreground mb-3">List all variables</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault list [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Filter by environment</div>
          <div>  --show-values       Show actual values (default: hidden)</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault delete</h2>
        <p className="text-sm text-muted-foreground mb-3">Delete a variable</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault delete KEY [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Target environment</div>
          <div>  --force             Skip confirmation prompt</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault run</h2>
        <p className="text-sm text-muted-foreground mb-3">Run command with injected variables</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault run [command] [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Use variables from environment</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault import</h2>
        <p className="text-sm text-muted-foreground mb-3">Import variables from .env file</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault import FILE [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Target environment</div>
          <div>  --overwrite         Overwrite existing variables</div>
          <div>  --dry-run           Preview without importing</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault export</h2>
        <p className="text-sm text-muted-foreground mb-3">Export variables to file</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault export [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --env ENVIRONMENT   Export from environment</div>
          <div>  --output FILE       Output file (default: stdout)</div>
          <div>  --format FORMAT     Format: dotenv, json, yaml</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault login</h2>
        <p className="text-sm text-muted-foreground mb-3">Authenticate CLI for team features</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault login [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --token TOKEN      Use personal access token</div>
          <div>  --manual           Manual authentication</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault logout</h2>
        <p className="text-sm text-muted-foreground mb-3">Sign out from your account</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault logout</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault sync</h2>
        <p className="text-sm text-muted-foreground mb-3">Sync project with team (encrypted)</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault sync [flags]</div>
          <div className="mt-2 text-terminal-comment">Flags:</div>
          <div>  --push             Push local changes only</div>
          <div>  --pull             Pull cloud changes only</div>
          <div>  --force            Force sync (override conflicts)</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault env</h2>
        <p className="text-sm text-muted-foreground mb-3">Manage environments</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault env [subcommand]</div>
          <div className="mt-2 text-terminal-comment">Subcommands:</div>
          <div>  list               List all environments</div>
          <div>  create NAME        Create new environment</div>
          <div>  delete NAME        Delete environment</div>
          <div>  copy SRC DST       Copy variables between environments</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault team</h2>
        <p className="text-sm text-muted-foreground mb-3">Manage team members</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault team [subcommand]</div>
          <div className="mt-2 text-terminal-comment">Subcommands:</div>
          <div>  list               List team members</div>
          <div>  invite EMAIL       Invite team member</div>
          <div>  remove EMAIL       Remove team member</div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">envault project</h2>
        <p className="text-sm text-muted-foreground mb-3">Manage projects</p>
        <div className="bg-terminal-bg text-terminal-text p-3 rounded font-mono text-sm">
          <div>envault project [subcommand]</div>
          <div className="mt-2 text-terminal-comment">Subcommands:</div>
          <div>  list               List all projects</div>
          <div>  switch NAME        Switch to different project</div>
          <div>  delete NAME        Delete project</div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <p className="text-sm">
          <strong>Pro tip:</strong> Use <code className="bg-background px-1.5 py-0.5 rounded">envault [command] --help</code> for detailed information about any command.
        </p>
      </Card>
    </div>
  );
}
