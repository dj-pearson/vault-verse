# EnvVault CLI Reference

Complete reference for all EnvVault CLI commands.

---

## Table of Contents

- [Global Flags](#global-flags)
- [Project Management](#project-management)
  - [init](#envault-init)
  - [status](#envault-status)
  - [projects](#envault-projects)
- [Secret Management](#secret-management)
  - [set](#envault-set)
  - [get](#envault-get)
  - [list](#envault-list)
  - [unset](#envault-unset)
- [Environment Management](#environment-management)
  - [env list](#envault-env-list)
  - [env create](#envault-env-create)
  - [env delete](#envault-env-delete)
  - [env copy](#envault-env-copy)
- [Import/Export](#importexport)
  - [import](#envault-import)
  - [export](#envault-export)
- [Execution](#execution)
  - [run](#envault-run)
- [Team Collaboration](#team-collaboration)
  - [login](#envault-login)
  - [logout](#envault-logout)
  - [sync](#envault-sync)
  - [team](#envault-team)

---

## Global Flags

These flags work with any command:

| Flag | Description | Example |
|------|-------------|---------|
| `--env <name>` | Specify environment | `envault set KEY=value --env production` |
| `--quiet` | Suppress output | `envault list --quiet` |
| `--json` | Output in JSON format | `envault list --json` |
| `--debug` | Enable debug logging | `envault sync --debug` |
| `--help` | Show command help | `envault set --help` |
| `--version` | Show CLI version | `envault --version` |

---

## Project Management

### `envault init`

Initialize a new EnvVault project in the current directory.

**Usage:**
```bash
envault init [flags]
```

**Flags:**
- `--name <string>` - Project name (default: directory name)
- `--sync` - Enable team synchronization
- `--force` - Overwrite existing `.envault` file

**Examples:**
```bash
# Basic initialization
envault init

# Custom name with sync enabled
envault init --name "My API" --sync

# Force re-initialization
envault init --force
```

**What it does:**
1. Creates `.envault` file with project configuration
2. Initializes local encrypted database in `~/.envault/`
3. Creates default `development` environment
4. Adds `.envault` to `.gitignore` (if exists)
5. Generates master encryption key (stored in OS keychain)

**Output:**
```
✓ Project initialized: my-app (id: 550e8400...)
✓ Created environment: development
✓ Added .envault to .gitignore

Next steps:
  envault set API_KEY "your-secret-key"
  envault list
  envault run npm start
```

---

### `envault status`

Show project status and statistics.

**Usage:**
```bash
envault status [flags]
```

**Flags:**
- `--json` - Output in JSON format

**Examples:**
```bash
# Show project status
envault status

# Get status as JSON
envault status --json
```

**Output:**
```
Project: my-app (550e8400...)
Environments: 3 (development, staging, production)
Total Secrets: 15
Sync: Enabled (last sync: 2 hours ago)

Environment Breakdown:
  development: 8 secrets
  staging:     5 secrets
  production:  2 secrets
```

---

### `envault projects`

List all EnvVault projects on this machine.

**Usage:**
```bash
envault projects [flags]
```

**Flags:**
- `--json` - Output in JSON format

**Examples:**
```bash
# List all projects
envault projects
```

**Output:**
```
Projects:
  my-app        /Users/dev/projects/my-app
  api-service   /Users/dev/work/api-service
  website       /Users/dev/personal/website
```

---

## Secret Management

### `envault set`

Set or update an environment variable.

**Usage:**
```bash
envault set <KEY> <value> [flags]
envault set <KEY=value> [KEY2=value2...] [flags]
```

**Flags:**
- `--env <name>` - Environment (default: development)
- `--description <string>` - Secret description
- `--force` - Skip confirmation for sensitive keys

**Examples:**
```bash
# Set a secret
envault set API_KEY "sk_live_abc123"

# Set with description
envault set DATABASE_URL "postgresql://..." --description "Production database"

# Set for specific environment
envault set API_KEY "sk_test_xyz" --env staging

# Set multiple secrets
envault set API_KEY=abc123 SECRET_KEY=def456

# Read from stdin (safe from shell history)
echo "super-secret-value" | envault set PASSWORD

# Read from file
envault set SSH_KEY "$(cat ~/.ssh/id_rsa)"
```

**Security Warnings:**
- 🔐 Detects sensitive keys (PASSWORD, SECRET, API_KEY, etc.)
- ⚠️  Warns if setting sensitive keys in development
- 📁 Warns if value looks like a file path
- 🐚 Warns about shell history exposure

**Interactive Mode:**
```bash
# Set secret interactively (value not shown)
envault set DATABASE_PASSWORD
# Prompts: Enter value for DATABASE_PASSWORD:
# (input hidden)
```

---

### `envault get`

Retrieve an environment variable value.

**Usage:**
```bash
envault get <KEY> [flags]
```

**Flags:**
- `--env <name>` - Environment (default: development)
- `--quiet` - Output only the value (for piping)

**Examples:**
```bash
# Get a secret
envault get API_KEY

# Get from specific environment
envault get DATABASE_URL --env production

# Use in scripts (quiet mode)
export DB_URL=$(envault get DATABASE_URL --quiet)

# Pipe to another command
envault get SSH_PRIVATE_KEY --quiet | ssh-add -
```

**Output:**
```bash
# Normal mode
API_KEY=sk_live_abc123defghi (set 2 days ago)

# Quiet mode
sk_live_abc123defghi
```

---

### `envault list`

List all environment variables for an environment.

**Usage:**
```bash
envault list [flags]
```

**Flags:**
- `--env <name>` - Environment (default: development)
- `--show-values` - Show decrypted values (⚠️ use with caution)
- `--json` - Output in JSON format
- `--keys-only` - Show only keys

**Examples:**
```bash
# List all secrets (values hidden)
envault list

# List for specific environment
envault list --env production

# Show actual values
envault list --show-values

# Get only keys
envault list --keys-only

# JSON output
envault list --json
```

**Output:**
```
Environment: development (8 secrets)

API_KEY          sk_li***ghi  Set 2 days ago
DATABASE_URL     postg***app  Set 1 week ago
JWT_SECRET       ****         Set 3 weeks ago
STRIPE_KEY       pk_te***key  Set 5 days ago
```

With `--show-values`:
```
API_KEY          sk_live_abc123defghi
DATABASE_URL     postgresql://localhost/app
JWT_SECRET       very-secret-jwt-key
STRIPE_KEY       pk_test_abc123key
```

---

### `envault unset`

Delete an environment variable.

**Usage:**
```bash
envault unset <KEY> [flags]
```

**Flags:**
- `--env <name>` - Environment (default: development)
- `--force` - Skip confirmation

**Examples:**
```bash
# Delete a secret (with confirmation)
envault unset OLD_API_KEY

# Delete from specific environment
envault unset DATABASE_URL --env staging

# Delete without confirmation
envault unset TEMP_KEY --force
```

**Confirmation:**
```
⚠  Are you sure you want to delete 'DATABASE_URL' from development? [y/N]: y
✓ Deleted DATABASE_URL from development
```

---

## Environment Management

### `envault env list`

List all environments in the current project.

**Usage:**
```bash
envault env list [flags]
```

**Flags:**
- `--json` - Output in JSON format

**Examples:**
```bash
envault env list
```

**Output:**
```
Environments:
  development  8 secrets  (current)
  staging      5 secrets
  production   2 secrets
```

---

### `envault env create`

Create a new environment.

**Usage:**
```bash
envault env create <name> [flags]
```

**Examples:**
```bash
# Create new environment
envault env create staging

# Create and switch to it
envault env create production && export ENVAULT_ENV=production
```

**Output:**
```
✓ Created environment: staging
```

---

### `envault env delete`

Delete an environment and all its secrets.

**Usage:**
```bash
envault env delete <name> [flags]
```

**Flags:**
- `--force` - Skip confirmation

**Examples:**
```bash
# Delete environment (with confirmation)
envault env delete old-staging

# Force delete
envault env delete temp --force
```

**Confirmation:**
```
⚠  WARNING: This will delete the 'old-staging' environment and all 12 secrets.
This action cannot be undone!

Are you sure? [y/N]: y
✓ Deleted environment: old-staging
```

**Protection:** Cannot delete the last remaining environment.

---

### `envault env copy`

Copy all secrets from one environment to another.

**Usage:**
```bash
envault env copy <source> <destination> [flags]
```

**Flags:**
- `--overwrite` - Overwrite existing secrets in destination
- `--merge` - Merge (keep existing secrets in destination)

**Examples:**
```bash
# Copy development to staging
envault env copy development staging

# Copy with overwrite
envault env copy development production --overwrite

# Merge (keep existing production secrets)
envault env copy development production --merge
```

**Output:**
```
Copying from development to staging...
✓ Copied 8 secrets
⚠  Skipped 2 secrets (already exist, use --overwrite to replace)
```

---

## Import/Export

### `envault import`

Import secrets from a file.

**Usage:**
```bash
envault import <file> [flags]
```

**Flags:**
- `--env <name>` - Target environment (default: development)
- `--format <type>` - Format: dotenv, json, yaml (auto-detected)
- `--overwrite` - Overwrite existing secrets
- `--merge` - Merge with existing secrets (default)

**Supported Formats:**

**1. Dotenv (.env)**
```bash
API_KEY=abc123
DATABASE_URL=postgresql://localhost/db
```

**2. JSON**
```json
{
  "API_KEY": "abc123",
  "DATABASE_URL": "postgresql://localhost/db"
}
```

**3. YAML**
```yaml
API_KEY: abc123
DATABASE_URL: postgresql://localhost/db
```

**Examples:**
```bash
# Import from .env file
envault import .env

# Import to specific environment
envault import .env.production --env production

# Import JSON
envault import secrets.json

# Import YAML with overwrite
envault import config.yaml --overwrite

# Import from stdin
cat .env | envault import -
```

**Output:**
```
Importing from .env...
✓ Imported 15 secrets to development
⚠  Skipped 3 secrets (already exist)
```

---

### `envault export`

Export secrets to a file.

**Usage:**
```bash
envault export <file> [flags]
```

**Flags:**
- `--env <name>` - Source environment (default: development)
- `--format <type>` - Format: dotenv, json, yaml, shell
- `--all-envs` - Export all environments (JSON/YAML only)
- `--force` - Overwrite existing file

**Formats:**

**1. Dotenv (.env)**
```bash
API_KEY=abc123
DATABASE_URL=postgresql://localhost/db
```

**2. JSON**
```json
{
  "API_KEY": "abc123",
  "DATABASE_URL": "postgresql://localhost/db"
}
```

**3. YAML**
```yaml
API_KEY: abc123
DATABASE_URL: postgresql://localhost/db
```

**4. Shell**
```bash
export API_KEY=abc123
export DATABASE_URL=postgresql://localhost/db
```

**Examples:**
```bash
# Export to .env
envault export .env

# Export production to .env.production
envault export .env.production --env production

# Export as JSON
envault export secrets.json --format json

# Export all environments
envault export backup.json --all-envs

# Export to stdout
envault export - | pbcopy  # Copy to clipboard

# Export as shell exports
envault export vars.sh --format shell
source vars.sh  # Load into shell
```

**Security Warning:**
```
⚠  WARNING: Exported files contain plaintext secrets!

Ensure you:
1. Add .env* to .gitignore
2. Encrypt the file if storing
3. Securely delete after use

✓ Exported 15 secrets to .env
📝 Added .env to .gitignore
```

---

## Execution

### `envault run`

Run a command with environment variables injected.

**Usage:**
```bash
envault run [flags] -- <command> [args...]
```

**Flags:**
- `--env <name>` - Environment to use (default: development)

**Examples:**
```bash
# Run Node.js app with secrets
envault run npm start

# Run with specific environment
envault run --env production npm start

# Run Python script
envault run python app.py

# Run with arguments
envault run -- node server.js --port 3000

# Run in Docker
envault run docker-compose up

# Run tests
envault run npm test

# Run database migration
envault run npx prisma migrate deploy
```

**How it works:**
1. Decrypts all secrets for specified environment
2. Sets them as environment variables
3. Executes the command in a child process
4. Secrets are wiped from memory after execution

**Process replacement:**
On Unix systems, `envault run` uses `exec()` to replace itself with your command, ensuring no parent process can see the environment variables.

**Example with debugging:**
```bash
# See what would be injected (without running command)
envault list --show-values --env production
envault run --env production --debug npm start
```

---

## Team Collaboration

### `envault login`

Authenticate with EnvVault cloud for team sync.

**Usage:**
```bash
envault login [flags]
```

**Flags:**
- `--token <string>` - Personal access token (for CI/CD)
- `--browser` - Open browser for OAuth (default)

**Examples:**
```bash
# Interactive login (opens browser)
envault login

# Login with token (for CI/CD)
envault login --token envt_abc123...

# Manual token entry
envault login
# Prompts for token if browser unavailable
```

**Browser Flow:**
```
Opening browser for authentication...
✓ Logged in as user@example.com
✓ Session saved (expires in 90 days)
```

**Token Flow:**
```bash
envault login --token envt_abc123def456
✓ Logged in as user@example.com
```

**Getting a token:**
1. Go to https://envault.net/settings/tokens
2. Create new token
3. Copy and use with `--token` flag

---

### `envault logout`

Log out and clear session.

**Usage:**
```bash
envault logout
```

**Examples:**
```bash
envault logout
```

**Output:**
```
✓ Logged out successfully
✓ Session cleared
```

---

### `envault sync`

Synchronize secrets with your team.

**Usage:**
```bash
envault sync [flags]
```

**Flags:**
- `--push` - Push local changes only
- `--pull` - Pull remote changes only
- `--force` - Force sync (overwrite conflicts)

**Examples:**
```bash
# Two-way sync (pull then push)
envault sync

# Push local changes to team
envault sync --push

# Pull team changes
envault sync --pull

# Force sync (resolve conflicts)
envault sync --force
```

**Two-way sync (default):**
```
↓ Pulling from cloud...
  ✓ Pulled version 15 (3 secrets updated)
  Created environment: staging

↑ Pushing local changes...
  ✓ Pushed version 16 (2 environments, 12 secrets)
```

**Push only:**
```
↑ Pushing local changes...
✓ Pushed version 16 to cloud (3 environments, 24 secrets)
```

**Pull only:**
```
↓ Pulling from cloud...
✓ Pulled version 17 from cloud (5 secrets, 1 new environment)
```

**Conflict handling:**
```
⚠  Conflict detected: Remote has changes since last sync
Options:
  1. Pull first, review changes, then push
  2. Force push (overwrite remote)
  3. Force pull (overwrite local)

Choose: 1
```

**How it works:**
1. All secrets encrypted locally before upload
2. Server stores encrypted blobs + checksums
3. Checksums verified on download
4. Zero-knowledge: server never sees plaintext

---

### `envault team`

Manage team members.

**Usage:**
```bash
envault team <command> [args] [flags]
```

**Subcommands:**
- `list` - List team members
- `invite` - Invite new team member
- `remove` - Remove team member

**Examples:**
```bash
# List team members
envault team list

# Invite new member
envault team invite user@example.com --role developer

# Remove member
envault team remove user@example.com
```

---

#### `envault team list`

List all team members and their roles.

**Usage:**
```bash
envault team list [flags]
```

**Flags:**
- `--json` - Output in JSON format

**Output:**
```
Team Members (3):
  admin@example.com        Admin      Owner
  dev@example.com          Developer  Joined 2 weeks ago
  viewer@example.com       Viewer     Joined 1 day ago
```

---

#### `envault team invite`

Invite a new team member.

**Usage:**
```bash
envault team invite <email> [flags]
```

**Flags:**
- `--role <role>` - Role: admin, developer, viewer (default: developer)
- `--message <string>` - Custom invitation message

**Roles:**
- `admin` - Full access (manage team, all environments)
- `developer` - Read/write to development and staging
- `viewer` - Read-only access

**Examples:**
```bash
# Invite as developer
envault team invite newdev@example.com

# Invite as admin
envault team invite admin@example.com --role admin

# Invite with custom message
envault team invite dev@example.com --message "Welcome to the team!"
```

**Output:**
```
✓ Invitation sent to newdev@example.com
  Role: Developer
  They will receive an email with setup instructions
```

---

#### `envault team remove`

Remove a team member.

**Usage:**
```bash
envault team remove <email> [flags]
```

**Flags:**
- `--force` - Skip confirmation

**Examples:**
```bash
# Remove member (with confirmation)
envault team remove olddev@example.com

# Force remove
envault team remove temp@example.com --force
```

**Confirmation:**
```
⚠  Remove olddev@example.com from the team?
They will lose access to all project secrets. [y/N]: y
✓ Removed olddev@example.com from team
```

---

## Exit Codes

The CLI uses standard exit codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Misuse of command (invalid arguments) |
| 3 | Permission denied |
| 4 | Not found (project, secret, environment) |
| 5 | Already exists |
| 6 | Rate limit exceeded |
| 130 | Interrupted (Ctrl+C) |

**Usage in scripts:**
```bash
if envault get API_KEY > /dev/null 2>&1; then
  echo "API_KEY exists"
else
  echo "API_KEY not found"
  exit 1
fi
```

---

## Configuration Files

### `.envault` (Project Config)

Located in project root. **DO NOT COMMIT TO GIT.**

```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "project_name": "my-app",
  "sync_enabled": true,
  "default_environment": "development"
}
```

### `~/.envault/config.yml` (Global Config)

Optional global configuration:

```yaml
# Default environment for new projects
default_environment: development

# Disable telemetry
telemetry: false

# Custom API endpoint (for self-hosted)
api_endpoint: https://api.envault.net
```

---

## Environment Variables

These environment variables affect CLI behavior:

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVAULT_ENV` | Default environment | `export ENVAULT_ENV=production` |
| `ENVAULT_API_URL` | Custom API endpoint | `https://api.envault.net` |
| `ENVAULT_DEBUG` | Enable debug mode | `ENVAULT_DEBUG=1` |
| `ENVAULT_NO_COLOR` | Disable colored output | `ENVAULT_NO_COLOR=1` |
| `ENVAULT_TOKEN` | API token (for CI) | `envt_abc123...` |

---

## Tips & Tricks

### 1. Shell Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias ev="envault"
alias evr="envault run"
alias evl="envault list --show-values"
alias evs="envault sync"
```

### 2. Per-Project Environment
```bash
# Set default environment for project
cd my-app
export ENVAULT_ENV=production

# Now all commands use production by default
envault list  # Lists production secrets
```

### 3. Scripting
```bash
#!/bin/bash
# deploy.sh

# Check if logged in
if ! envault team list > /dev/null 2>&1; then
  echo "Please login first: envault login"
  exit 1
fi

# Sync latest secrets
envault sync --pull

# Deploy with production secrets
envault run --env production ./deploy_app.sh
```

### 4. Docker Integration
```dockerfile
# Install EnvVault in Docker
RUN curl -fsSL https://get.envault.net | sh

# Use in entrypoint
ENTRYPOINT ["envault", "run", "--"]
CMD ["npm", "start"]
```

### 5. Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Ensure .envault is not committed
if git diff --cached --name-only | grep -q '^\.envault$'; then
  echo "Error: Attempting to commit .envault file!"
  echo "Run: git reset HEAD .envault"
  exit 1
fi
```

---

## Troubleshooting

### "Project not initialized"
```
Error: no envault project found in current directory

Solution: Run `envault init` first
```

### "Failed to access keychain"
```
Error: failed to get master key: keychain access denied

Solutions:
- macOS: Grant Terminal access in System Preferences > Security
- Linux: Ensure secret-service is running
- Windows: Check Credential Manager permissions
```

### "Rate limit exceeded"
```
Error: Rate limit exceeded. Please try again in a few moments.

Solution: Wait 60 seconds or contact support if persistent
```

### "Sync conflict"
```
Warning: Conflict detected: Remote has changes since last sync

Solution:
1. Pull first: envault sync --pull
2. Review changes: envault list
3. Push: envault sync --push
```

---

## See Also

- [Getting Started](./GETTING_STARTED.md)
- [Tutorial](./TUTORIAL.md)
- [Security](./SECURITY.md)
- [Team Collaboration](./TEAM_COLLABORATION.md)
- [CI/CD Integration](./CI_CD_INTEGRATION.md)

---

**Need help?** `envault <command> --help`
