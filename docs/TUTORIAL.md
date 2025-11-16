# EnvVault Tutorial: Build a Full-Stack App with Secure Secrets

**Time**: 30 minutes
**Level**: Beginner to Intermediate
**What you'll learn**: Real-world workflows for managing secrets

---

## What We'll Build

We'll build a simple full-stack application (Node.js API + React frontend) and manage all its secrets with EnvVault across different environments.

**By the end, you'll know how to:**
- Set up EnvVault for a real project
- Manage secrets across environments (dev, staging, prod)
- Import existing .env files
- Work with a team
- Deploy with CI/CD

---

## Prerequisites

- EnvVault CLI installed ([Installation Guide](./GETTING_STARTED.md))
- Node.js 18+ installed
- Basic terminal knowledge

---

## Part 1: Solo Developer Workflow (15 minutes)

### Step 1: Create a New Project

```bash
# Create project directory
mkdir awesome-saas
cd awesome-saas

# Initialize git
git init
echo "node_modules/" > .gitignore

# Initialize EnvVault
envvault init --name "Awesome SaaS"
```

**Output:**
```
✓ Project initialized: Awesome SaaS (3e4a9c7b...)
✓ Created environment: development
✓ Added .envvault to .gitignore

Next steps:
  envvault set API_KEY "your-secret-key"
  envvault list
```

**What happened:**
- Created `.envvault` config file
- Initialized encrypted database in `~/.envvault/`
- Generated master encryption key (stored in OS keychain)
- Added `.envvault` to `.gitignore` automatically

---

### Step 2: Add Development Secrets

```bash
# Add database connection
envvault set DATABASE_URL "postgresql://localhost:5432/awesome_dev"

# Add API keys
envvault set STRIPE_SECRET_KEY "sk_test_abc123..."
envvault set SENDGRID_API_KEY "SG.test123..."

# Add JWT secret
envvault set JWT_SECRET "super-secret-jwt-key-dev"

# Add application settings
envvault set APP_NAME "Awesome SaaS"
envvault set APP_URL "http://localhost:3000"
```

**List all secrets:**
```bash
envvault list
```

**Output:**
```
Environment: development (6 secrets)

DATABASE_URL        postg***dev  Set just now
STRIPE_SECRET_KEY   sk_te***123  Set just now
SENDGRID_API_KEY    SG.te***123  Set just now
JWT_SECRET          ****         Set just now
APP_NAME            Awesome SaaS Set just now
APP_URL             http://localhost:3000 Set just now
```

---

### Step 3: Create Staging Environment

```bash
# Create staging environment
envvault env create staging

# Add staging-specific secrets
envvault set DATABASE_URL "postgresql://staging-db.example.com:5432/awesome" --env staging
envvault set STRIPE_SECRET_KEY "sk_test_staging_xyz..." --env staging
envvault set SENDGRID_API_KEY "SG.staging..." --env staging
envvault set JWT_SECRET "staging-jwt-secret" --env staging
envvault set APP_URL "https://staging.awesome-saas.com" --env staging

# Copy non-sensitive values from development
envvault set APP_NAME "Awesome SaaS" --env staging
```

**Faster way - copy then override:**
```bash
# Copy all from development
envvault env copy development staging

# Override environment-specific secrets
envvault set DATABASE_URL "postgresql://staging..." --env staging
envvault set STRIPE_SECRET_KEY "sk_test_staging..." --env staging
envvault set APP_URL "https://staging..." --env staging
```

---

### Step 4: Create Production Environment

```bash
# Create production environment
envvault env create production

# Add production secrets (NEVER use test keys in production!)
envvault set DATABASE_URL "postgresql://prod-db.example.com:5432/awesome" --env production
envvault set STRIPE_SECRET_KEY "sk_live_real_prod_key..." --env production
envvault set SENDGRID_API_KEY "SG.prod..." --env production
envvault set JWT_SECRET "$(openssl rand -base64 32)" --env production
envvault set APP_URL "https://awesome-saas.com" --env production
envvault set APP_NAME "Awesome SaaS" --env production
```

**View all environments:**
```bash
envvault env list
```

**Output:**
```
Environments:
  development  6 secrets  (current)
  staging      6 secrets
  production   6 secrets
```

---

### Step 5: Run Your Application

Create a simple Node.js app:

```bash
# Install dependencies
npm init -y
npm install express pg stripe @sendgrid/mail jsonwebtoken

# Create app.js
cat > app.js << 'EOF'
const express = require('express');
const app = express();

// EnvVault will inject these
const {
  DATABASE_URL,
  STRIPE_SECRET_KEY,
  SENDGRID_API_KEY,
  JWT_SECRET,
  APP_NAME,
  APP_URL
} = process.env;

app.get('/', (req, res) => {
  res.json({
    app: APP_NAME,
    url: APP_URL,
    database: DATABASE_URL ? 'Connected' : 'Not configured',
    stripe: STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
    sendgrid: SENDGRID_API_KEY ? 'Configured' : 'Not configured'
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`${APP_NAME} running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
EOF
```

**Run with EnvVault:**
```bash
# Run with development secrets
envvault run node app.js

# Run with staging secrets
envvault run --env staging node app.js

# Run with production secrets
envvault run --env production node app.js
```

**Test it:**
```bash
# In another terminal
curl http://localhost:3000
```

**Output:**
```json
{
  "app": "Awesome SaaS",
  "url": "http://localhost:3000",
  "database": "Connected",
  "stripe": "Configured",
  "sendgrid": "Configured"
}
```

---

### Step 6: Import Existing .env Files

If you have existing `.env` files:

```bash
# Backup existing .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://localhost:5432/app
API_KEY=old-api-key
SECRET_TOKEN=old-secret
EOF

# Import into EnvVault
envvault import .env

# Verify import
envvault list

# Delete .env file (secrets now in EnvVault)
rm .env

# Add .env to .gitignore (if not already)
echo ".env*" >> .gitignore
```

---

### Step 7: Export for Deployment

For platforms that need .env files:

```bash
# Export production secrets to .env.production
envvault export .env.production --env production

# Use in Docker
docker build -t app --build-arg ENV_FILE=.env.production .

# Clean up (don't commit!)
rm .env.production
```

---

## Part 2: Team Collaboration (10 minutes)

### Step 8: Enable Team Sync

**Team Owner:**

```bash
# 1. Sign up at https://envault.net
# (Use GitHub OAuth or email)

# 2. Login to CLI
envvault login
# Opens browser for authentication

# 3. Re-initialize project with sync
envvault init --sync
# Links local project to cloud

# 4. Push secrets to team
envvault sync --push
```

**Output:**
```
Opening browser for authentication...
✓ Logged in as owner@example.com

↑ Pushing local changes...
✓ Pushed version 1 to cloud (3 environments, 18 secrets)
```

---

### Step 9: Invite Team Members

```bash
# Invite developers
envvault team invite alice@example.com --role developer
envvault team invite bob@example.com --role developer

# Invite admin
envvault team invite admin@example.com --role admin

# Invite viewer (read-only)
envvault team invite manager@example.com --role viewer

# List team
envvault team list
```

**Output:**
```
✓ Invitation sent to alice@example.com (Developer)
✓ Invitation sent to bob@example.com (Developer)

Team Members (4):
  owner@example.com       Admin      Owner
  alice@example.com       Developer  Pending
  bob@example.com         Developer  Pending
  admin@example.com       Admin      Pending
```

---

### Step 10: Team Member Joins

**Alice (New Team Member):**

```bash
# 1. Accept invitation email

# 2. Sign up at https://envault.net

# 3. Login to CLI
envvault login

# 4. Clone repo
git clone https://github.com/team/awesome-saas
cd awesome-saas

# 5. Pull secrets
envvault sync --pull
```

**Output:**
```
↓ Pulling from cloud...
✓ Pulled version 1 from cloud (18 secrets, 3 environments)
  Created environment: development
  Created environment: staging
  Created environment: production
```

**Alice can now run the app:**
```bash
envvault run node app.js
# Works! Secrets are synced
```

---

### Step 11: Making Changes (Team Workflow)

**Alice adds a new secret:**
```bash
# Add new secret
envvault set REDIS_URL "redis://localhost:6379"

# Push to team
envvault sync --push
```

**Bob pulls the change:**
```bash
# Regular sync (pull then push)
envvault sync
```

**Output:**
```
↓ Pulling from cloud...
✓ Pulled version 2 from cloud (1 secret updated)
  REDIS_URL added

↑ Pushing local changes...
  No local changes to push
```

---

## Part 3: Production Deployment (5 minutes)

### Step 12: Deploy with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install EnvVault
        run: curl -fsSL https://get.envault.net | sh

      - name: Login to EnvVault
        run: envvault login --token ${{ secrets.ENVVAULT_TOKEN }}

      - name: Pull production secrets
        run: envvault sync --pull

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: envvault run --env staging npm test

      - name: Deploy to production
        run: envvault run --env production ./deploy.sh
```

**Setup:**
1. Get EnvVault token: https://envault.net/settings/tokens
2. Add to GitHub secrets: `ENVVAULT_TOKEN`

**Now every push to main:**
1. Pulls latest secrets
2. Runs tests with staging secrets
3. Deploys with production secrets

---

### Step 13: Deploy to Vercel/Netlify

**Option 1: Export secrets to platform**

```bash
# Export production secrets
envvault export --env production --format shell > prod-secrets.sh

# Add to Vercel
source prod-secrets.sh
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"
# ... etc

# Clean up
rm prod-secrets.sh
```

**Option 2: Use EnvVault in build**

Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "envvault run --env production npm run build"
  }
}
```

---

## Part 4: Advanced Workflows

### Scenario: Rotating API Keys

```bash
# 1. Generate new key in service dashboard
NEW_KEY="sk_live_new_key_123"

# 2. Add to all environments
envvault set STRIPE_SECRET_KEY "$NEW_KEY" --env development
envvault set STRIPE_SECRET_KEY "$NEW_KEY" --env staging
envvault set STRIPE_SECRET_KEY "$NEW_KEY" --env production

# 3. Push to team
envvault sync --push

# 4. Deploy with new key
# (Team members pull automatically)
```

---

### Scenario: Developer Needs Production Access

**Admin:**
```bash
# Check current permissions
envvault team list

# Upgrade developer to admin (temporarily)
# Note: This is done via web dashboard at envault.net

# Or create production-readonly environment
envvault env create production-readonly
envvault env copy production production-readonly
# Share production-readonly with developer
```

---

### Scenario: Environment Variable Audit

```bash
# Check what's set in each environment
envvault list --env development
envvault list --env staging
envvault list --env production

# Export for comparison
envvault export dev.json --env development --format json
envvault export staging.json --env staging --format json
envvault export prod.json --env production --format json

# Compare
diff dev.json staging.json
```

---

### Scenario: Backup All Secrets

```bash
# Export everything
envvault export backup-$(date +%Y%m%d).json --all-envs --format json

# Encrypt backup
gpg --encrypt backup-20250117.json

# Store in secure location
mv backup-20250117.json.gpg ~/Documents/Encrypted-Backups/

# Clean up plaintext
rm backup-20250117.json
```

---

### Scenario: Migrate from .env to EnvVault

**Before:**
```
├── .env
├── .env.staging
├── .env.production
├── .env.test
└── app.js
```

**Migration:**
```bash
# 1. Initialize EnvVault
envvault init

# 2. Import each environment
envvault import .env --env development
envvault env create staging && envvault import .env.staging --env staging
envvault env create production && envvault import .env.production --env production
envvault env create test && envvault import .env.test --env test

# 3. Verify imports
envvault list --env development
envvault list --env staging
envvault list --env production

# 4. Update scripts in package.json
# Before: "start": "node app.js"
# After:  "start": "envvault run node app.js"

# 5. Remove .env files
rm .env .env.*

# 6. Update .gitignore
echo ".env*" >> .gitignore

# 7. Commit
git add .envvault .gitignore package.json
git commit -m "Migrate to EnvVault for secret management"
```

**After:**
```
├── .envvault          (project config, git-ignored)
├── .gitignore         (updated)
├── package.json       (updated scripts)
└── app.js             (no changes needed!)
```

---

## Troubleshooting

### "Command not found: envvault"

```bash
# Reinstall
curl -fsSL https://get.envault.net | sh

# Or with Homebrew
brew install envvault/tap/envvault

# Verify
which envvault
envvault --version
```

---

### "Project not initialized"

```bash
# Make sure you're in the right directory
pwd

# Check for .envvault file
ls -la | grep envvault

# If missing, initialize
envvault init
```

---

### "Sync conflict detected"

```bash
# Pull first to see remote changes
envvault sync --pull

# Review what changed
envvault list

# If happy, push your changes
envvault sync --push

# Or do two-way sync
envvault sync
```

---

### Secrets not loading in app

```bash
# Check secrets are set
envvault list --show-values

# Verify you're using envvault run
# ❌ Wrong: node app.js
# ✅ Right: envvault run node app.js

# Check environment
envvault run --env production node app.js

# Debug mode
envvault run --debug node app.js
```

---

## Best Practices Summary

### ✅ DO

1. **Always use `envvault run`** - Never manually source .env files
2. **Different secrets per environment** - Don't reuse production keys in dev
3. **Sync regularly** - `envvault sync` before starting work
4. **Use descriptive names** - `STRIPE_SECRET_KEY` not `KEY1`
5. **Rotate secrets** - Especially after team member leaves
6. **Backup periodically** - Export to encrypted backup
7. **Use roles properly** - Not everyone needs admin access
8. **Enable 2FA** - On your EnvVault account

### ❌ DON'T

1. **Never commit .env files** - Use EnvVault instead
2. **Never share secrets in Slack** - Use EnvVault sync
3. **Never hardcode secrets** - Always use environment variables
4. **Don't use test keys in production** - Separate environments!
5. **Don't give everyone production access** - Use roles
6. **Don't skip the sync** - Team members need latest secrets

---

## Next Steps

Now that you've completed the tutorial:

- 📖 Read [Security Documentation](./SECURITY.md) to understand the encryption
- 👥 Set up [Team Collaboration](./TEAM_COLLABORATION.md) properly
- 🚀 Configure [CI/CD Integration](./CI_CD_INTEGRATION.md) for your stack
- 🔧 Explore [CLI Reference](./CLI_REFERENCE.md) for all commands

---

## Get Help

- 💬 **Discord**: https://discord.gg/envvault
- 🐛 **Issues**: https://github.com/dj-pearson/vault-verse/issues
- 📧 **Support**: support@envault.net

---

**Congrats!** You now know how to manage secrets like a pro 🎉
