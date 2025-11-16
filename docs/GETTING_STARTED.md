# Getting Started with EnvVault

Welcome to EnvVault! This guide will help you get up and running in less than 5 minutes.

---

## What is EnvVault?

EnvVault is a **secure environment variable management system** that helps developers and teams:

- ✅ **Store secrets securely** with AES-256-GCM encryption
- ✅ **Never commit secrets** to version control
- ✅ **Share secrets safely** with your team
- ✅ **Sync across machines** with zero-knowledge encryption
- ✅ **Work offline** - everything stored locally first

**Zero-knowledge architecture**: Your secrets are encrypted on your machine before syncing. The server never sees your plaintext secrets.

---

## Quick Start (3 Steps)

### Step 1: Install the CLI

Choose your platform:

#### macOS (Homebrew)
```bash
brew tap envault/tap
brew install envault
```

#### macOS/Linux (curl)
```bash
curl -fsSL https://get.envault.net | sh
```

#### npm (all platforms)
```bash
npm install -g @envault/cli
```

#### Manual Download
Download the binary for your platform from [GitHub Releases](https://github.com/dj-pearson/vault-verse/releases/latest)

**Verify installation:**
```bash
envault --version
```

---

### Step 2: Create Your First Project

```bash
# Navigate to your project directory
cd my-project

# Initialize EnvVault
envault init

# You'll be prompted for:
# - Project name (default: folder name)
# - Enable team sync? (y/n)
```

This creates:
- `.envault` file (project configuration)
- `~/.envault/` directory (encrypted database)
- Automatically adds `.envault` to `.gitignore`

---

### Step 3: Add Your First Secret

```bash
# Add a secret
envault set DATABASE_URL "postgresql://localhost/mydb"

# View your secrets
envault list

# Get a specific secret
envault get DATABASE_URL

# Run a command with secrets injected
envault run npm start
```

**That's it!** Your secrets are now encrypted and stored securely.

---

## Common Workflows

### 💻 Solo Developer Workflow

```bash
# 1. Initialize project
cd my-app
envault init

# 2. Add secrets
envault set API_KEY "sk_live_..."
envault set DATABASE_URL "postgresql://..."

# 3. Create different environments
envault env create staging
envault env create production

# 4. Add environment-specific secrets
envault set --env staging DATABASE_URL "postgresql://staging-db/app"
envault set --env production DATABASE_URL "postgresql://prod-db/app"

# 5. Run commands with the right environment
envault run --env development npm run dev
envault run --env staging npm run test
envault run --env production npm start
```

---

### 👥 Team Workflow

```bash
# Team Admin:
# 1. Sign up at https://envault.net
# 2. Login to CLI
envault login

# 3. Initialize project with sync
cd team-project
envault init --sync

# 4. Add secrets and push to team
envault set DATABASE_URL "postgresql://..."
envault sync --push

# Team Members:
# 1. Login to CLI
envault login

# 2. Clone the repo
git clone <repo-url>
cd team-project

# 3. Pull secrets from team
envault sync --pull

# 4. Start working!
envault run npm start

# Whenever secrets change:
envault sync  # Two-way sync
```

---

### 📦 Import from Existing .env Files

```bash
# Import from .env file
envault import .env

# Import to specific environment
envault import .env.staging --env staging

# Import from JSON
envault import secrets.json --format json

# Import from YAML
envault import config.yaml --format yaml
```

---

### 📤 Export to .env Files

```bash
# Export current environment to .env
envault export .env

# Export specific environment
envault export .env.production --env production

# Export to JSON (all environments)
envault export secrets.json --format json --all-envs

# Export to shell format
envault export vars.sh --format shell
```

**⚠️ Warning**: Exported files contain plaintext secrets! Add them to `.gitignore`.

---

## Understanding Environments

EnvVault supports multiple environments per project:

```bash
# Create environments
envault env create development
envault env create staging
envault env create production

# List all environments
envault env list

# Copy secrets between environments
envault env copy development staging

# Delete an environment
envault env delete old-env
```

**Default environment**: `development`

---

## Security Best Practices

### ✅ DO

- ✅ Use EnvVault for ALL secrets (API keys, passwords, tokens)
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Enable team sync for collaboration
- ✅ Review audit logs periodically
- ✅ Use strong passwords for your EnvVault account

### ❌ DON'T

- ❌ Commit `.env` files to git
- ❌ Share secrets via Slack/email
- ❌ Use the same secrets in development and production
- ❌ Give everyone production access
- ❌ Skip the `envault run` command (secrets stay encrypted)

---

## FAQ

### Where are my secrets stored?

**Locally**: Encrypted in `~/.envault/data/projects.db` using AES-256-GCM
**Team sync**: Encrypted blobs in Supabase (server never sees plaintext)
**Master key**: Stored in your OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

### How do I backup my secrets?

```bash
# Export all environments
envault export backup.json --format json --all-envs

# Store backup.json in a secure location (encrypted storage)
```

### Can I use EnvVault in CI/CD?

Yes! Two approaches:

**Approach 1: CLI in CI**
```yaml
# GitHub Actions example
- name: Load secrets
  run: |
    envault login --token ${{ secrets.ENVAULT_TOKEN }}
    envault sync --pull
    envault run npm test
```

**Approach 2: Export to CI secrets**
```bash
# Export and set as GitHub secrets manually
envault export --format shell
```

### How do I share secrets with new team members?

```bash
# Admin adds team member in dashboard
# Team member runs:
envault login
cd project
envault sync --pull
```

### What if I forget my password?

- Local secrets: Protected by OS keychain, still accessible
- Team secrets: Use account recovery at envault.net
- **Important**: No one (including us) can decrypt your secrets without your master key

### Is EnvVault open source?

Yes! EnvVault is open source under the MIT license.
- GitHub: https://github.com/dj-pearson/vault-verse
- Issues: https://github.com/dj-pearson/vault-verse/issues
- Contributions welcome!

---

## Next Steps

- 📖 Read the [CLI Reference](./CLI_REFERENCE.md) for all commands
- 🎓 Follow the [Tutorial](./TUTORIAL.md) for advanced features
- 🔒 Review [Security](./SECURITY.md) documentation
- 👥 Set up [Team Collaboration](./TEAM_COLLABORATION.md)
- 🚀 Deploy with [CI/CD Integration](./CI_CD_INTEGRATION.md)

---

## Getting Help

- 📚 **Documentation**: https://docs.envault.net
- 💬 **Discord**: https://discord.gg/envault
- 🐛 **Report bugs**: https://github.com/dj-pearson/vault-verse/issues
- 📧 **Email support**: support@envault.net

---

**Ready to secure your secrets?** `envault init` 🚀
