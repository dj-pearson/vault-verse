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
brew tap envvault/tap
brew install envvault
```

#### macOS/Linux (curl)
```bash
curl -fsSL https://get.envvault.com | sh
```

#### npm (all platforms)
```bash
npm install -g @envvault/cli
```

#### Manual Download
Download the binary for your platform from [GitHub Releases](https://github.com/dj-pearson/vault-verse/releases/latest)

**Verify installation:**
```bash
envvault --version
```

---

### Step 2: Create Your First Project

```bash
# Navigate to your project directory
cd my-project

# Initialize EnvVault
envvault init

# You'll be prompted for:
# - Project name (default: folder name)
# - Enable team sync? (y/n)
```

This creates:
- `.envvault` file (project configuration)
- `~/.envvault/` directory (encrypted database)
- Automatically adds `.envvault` to `.gitignore`

---

### Step 3: Add Your First Secret

```bash
# Add a secret
envvault set DATABASE_URL "postgresql://localhost/mydb"

# View your secrets
envvault list

# Get a specific secret
envvault get DATABASE_URL

# Run a command with secrets injected
envvault run npm start
```

**That's it!** Your secrets are now encrypted and stored securely.

---

## Common Workflows

### 💻 Solo Developer Workflow

```bash
# 1. Initialize project
cd my-app
envvault init

# 2. Add secrets
envvault set API_KEY "sk_live_..."
envvault set DATABASE_URL "postgresql://..."

# 3. Create different environments
envvault env create staging
envvault env create production

# 4. Add environment-specific secrets
envvault set --env staging DATABASE_URL "postgresql://staging-db/app"
envvault set --env production DATABASE_URL "postgresql://prod-db/app"

# 5. Run commands with the right environment
envvault run --env development npm run dev
envvault run --env staging npm run test
envvault run --env production npm start
```

---

### 👥 Team Workflow

```bash
# Team Admin:
# 1. Sign up at https://envvault.com
# 2. Login to CLI
envvault login

# 3. Initialize project with sync
cd team-project
envvault init --sync

# 4. Add secrets and push to team
envvault set DATABASE_URL "postgresql://..."
envvault sync --push

# Team Members:
# 1. Login to CLI
envvault login

# 2. Clone the repo
git clone <repo-url>
cd team-project

# 3. Pull secrets from team
envvault sync --pull

# 4. Start working!
envvault run npm start

# Whenever secrets change:
envvault sync  # Two-way sync
```

---

### 📦 Import from Existing .env Files

```bash
# Import from .env file
envvault import .env

# Import to specific environment
envvault import .env.staging --env staging

# Import from JSON
envvault import secrets.json --format json

# Import from YAML
envvault import config.yaml --format yaml
```

---

### 📤 Export to .env Files

```bash
# Export current environment to .env
envvault export .env

# Export specific environment
envvault export .env.production --env production

# Export to JSON (all environments)
envvault export secrets.json --format json --all-envs

# Export to shell format
envvault export vars.sh --format shell
```

**⚠️ Warning**: Exported files contain plaintext secrets! Add them to `.gitignore`.

---

## Understanding Environments

EnvVault supports multiple environments per project:

```bash
# Create environments
envvault env create development
envvault env create staging
envvault env create production

# List all environments
envvault env list

# Copy secrets between environments
envvault env copy development staging

# Delete an environment
envvault env delete old-env
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
- ❌ Skip the `envvault run` command (secrets stay encrypted)

---

## FAQ

### Where are my secrets stored?

**Locally**: Encrypted in `~/.envvault/data/projects.db` using AES-256-GCM
**Team sync**: Encrypted blobs in Supabase (server never sees plaintext)
**Master key**: Stored in your OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

### How do I backup my secrets?

```bash
# Export all environments
envvault export backup.json --format json --all-envs

# Store backup.json in a secure location (encrypted storage)
```

### Can I use EnvVault in CI/CD?

Yes! Two approaches:

**Approach 1: CLI in CI**
```yaml
# GitHub Actions example
- name: Load secrets
  run: |
    envvault login --token ${{ secrets.ENVVAULT_TOKEN }}
    envvault sync --pull
    envvault run npm test
```

**Approach 2: Export to CI secrets**
```bash
# Export and set as GitHub secrets manually
envvault export --format shell
```

### How do I share secrets with new team members?

```bash
# Admin adds team member in dashboard
# Team member runs:
envvault login
cd project
envvault sync --pull
```

### What if I forget my password?

- Local secrets: Protected by OS keychain, still accessible
- Team secrets: Use account recovery at envvault.com
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

- 📚 **Documentation**: https://docs.envvault.com
- 💬 **Discord**: https://discord.gg/envvault
- 🐛 **Report bugs**: https://github.com/dj-pearson/vault-verse/issues
- 📧 **Email support**: support@envvault.com

---

**Ready to secure your secrets?** `envvault init` 🚀
