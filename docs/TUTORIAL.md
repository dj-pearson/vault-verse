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
envault init --name "Awesome SaaS"
```

**Output:**
```
✓ Project initialized: Awesome SaaS (3e4a9c7b...)
✓ Created environment: development
✓ Added .envault to .gitignore

Next steps:
  envault set API_KEY "your-secret-key"
  envault list
```

**What happened:**
- Created `.envault` config file
- Initialized encrypted database in `~/.envault/`
- Generated master encryption key (stored in OS keychain)
- Added `.envault` to `.gitignore` automatically

---

### Step 2: Add Development Secrets

```bash
# Add database connection
envault set DATABASE_URL "postgresql://localhost:5432/awesome_dev"

# Add API keys
envault set STRIPE_SECRET_KEY "sk_test_abc123..."
envault set SENDGRID_API_KEY "SG.test123..."

# Add JWT secret
envault set JWT_SECRET "super-secret-jwt-key-dev"

# Add application settings
envault set APP_NAME "Awesome SaaS"
envault set APP_URL "http://localhost:3000"
```

**List all secrets:**
```bash
envault list
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
envault env create staging

# Add staging-specific secrets
envault set DATABASE_URL "postgresql://staging-db.example.com:5432/awesome" --env staging
envault set STRIPE_SECRET_KEY "sk_test_staging_xyz..." --env staging
envault set SENDGRID_API_KEY "SG.staging..." --env staging
envault set JWT_SECRET "staging-jwt-secret" --env staging
envault set APP_URL "https://staging.awesome-saas.com" --env staging

# Copy non-sensitive values from development
envault set APP_NAME "Awesome SaaS" --env staging
```

**Faster way - copy then override:**
```bash
# Copy all from development
envault env copy development staging

# Override environment-specific secrets
envault set DATABASE_URL "postgresql://staging..." --env staging
envault set STRIPE_SECRET_KEY "sk_test_staging..." --env staging
envault set APP_URL "https://staging..." --env staging
```

---

### Step 4: Create Production Environment

```bash
# Create production environment
envault env create production

# Add production secrets (NEVER use test keys in production!)
envault set DATABASE_URL "postgresql://prod-db.example.com:5432/awesome" --env production
envault set STRIPE_SECRET_KEY "sk_live_real_prod_key..." --env production
envault set SENDGRID_API_KEY "SG.prod..." --env production
envault set JWT_SECRET "$(openssl rand -base64 32)" --env production
envault set APP_URL "https://awesome-saas.com" --env production
envault set APP_NAME "Awesome SaaS" --env production
```

**View all environments:**
```bash
envault env list
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
envault run node app.js

# Run with staging secrets
envault run --env staging node app.js

# Run with production secrets
envault run --env production node app.js
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
envault import .env

# Verify import
envault list

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
envault export .env.production --env production

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
envault login
# Opens browser for authentication

# 3. Re-initialize project with sync
envault init --sync
# Links local project to cloud

# 4. Push secrets to team
envault sync --push
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
envault team invite alice@example.com --role developer
envault team invite bob@example.com --role developer

# Invite admin
envault team invite admin@example.com --role admin

# Invite viewer (read-only)
envault team invite manager@example.com --role viewer

# List team
envault team list
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
envault login

# 4. Clone repo
git clone https://github.com/team/awesome-saas
cd awesome-saas

# 5. Pull secrets
envault sync --pull
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
envault run node app.js
# Works! Secrets are synced
```

---

### Step 11: Making Changes (Team Workflow)

**Alice adds a new secret:**
```bash
# Add new secret
envault set REDIS_URL "redis://localhost:6379"

# Push to team
envault sync --push
```

**Bob pulls the change:**
```bash
# Regular sync (pull then push)
envault sync
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
        run: envault login --token ${{ secrets.ENVAULT_TOKEN }}

      - name: Pull production secrets
        run: envault sync --pull

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: envault run --env staging npm test

      - name: Deploy to production
        run: envault run --env production ./deploy.sh
```

**Setup:**
1. Get EnvVault token: https://envault.net/settings/tokens
2. Add to GitHub secrets: `ENVAULT_TOKEN`

**Now every push to main:**
1. Pulls latest secrets
2. Runs tests with staging secrets
3. Deploys with production secrets

---

### Step 13: Deploy to Vercel/Netlify

**Option 1: Export secrets to platform**

```bash
# Export production secrets
envault export --env production --format shell > prod-secrets.sh

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
    "vercel-build": "envault run --env production npm run build"
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
envault set STRIPE_SECRET_KEY "$NEW_KEY" --env development
envault set STRIPE_SECRET_KEY "$NEW_KEY" --env staging
envault set STRIPE_SECRET_KEY "$NEW_KEY" --env production

# 3. Push to team
envault sync --push

# 4. Deploy with new key
# (Team members pull automatically)
```

---

### Scenario: Developer Needs Production Access

**Admin:**
```bash
# Check current permissions
envault team list

# Upgrade developer to admin (temporarily)
# Note: This is done via web dashboard at envault.net

# Or create production-readonly environment
envault env create production-readonly
envault env copy production production-readonly
# Share production-readonly with developer
```

---

### Scenario: Environment Variable Audit

```bash
# Check what's set in each environment
envault list --env development
envault list --env staging
envault list --env production

# Export for comparison
envault export dev.json --env development --format json
envault export staging.json --env staging --format json
envault export prod.json --env production --format json

# Compare
diff dev.json staging.json
```

---

### Scenario: Backup All Secrets

```bash
# Export everything
envault export backup-$(date +%Y%m%d).json --all-envs --format json

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
envault init

# 2. Import each environment
envault import .env --env development
envault env create staging && envault import .env.staging --env staging
envault env create production && envault import .env.production --env production
envault env create test && envault import .env.test --env test

# 3. Verify imports
envault list --env development
envault list --env staging
envault list --env production

# 4. Update scripts in package.json
# Before: "start": "node app.js"
# After:  "start": "envault run node app.js"

# 5. Remove .env files
rm .env .env.*

# 6. Update .gitignore
echo ".env*" >> .gitignore

# 7. Commit
git add .envault .gitignore package.json
git commit -m "Migrate to EnvVault for secret management"
```

**After:**
```
├── .envault          (project config, git-ignored)
├── .gitignore         (updated)
├── package.json       (updated scripts)
└── app.js             (no changes needed!)
```

---

## Troubleshooting

### "Command not found: envault"

```bash
# Reinstall
curl -fsSL https://get.envault.net | sh

# Or with Homebrew
brew install envault/tap/envault

# Verify
which envault
envault --version
```

---

### "Project not initialized"

```bash
# Make sure you're in the right directory
pwd

# Check for .envault file
ls -la | grep envault

# If missing, initialize
envault init
```

---

### "Sync conflict detected"

```bash
# Pull first to see remote changes
envault sync --pull

# Review what changed
envault list

# If happy, push your changes
envault sync --push

# Or do two-way sync
envault sync
```

---

### Secrets not loading in app

```bash
# Check secrets are set
envault list --show-values

# Verify you're using envault run
# ❌ Wrong: node app.js
# ✅ Right: envault run node app.js

# Check environment
envault run --env production node app.js

# Debug mode
envault run --debug node app.js
```

---

## Best Practices Summary

### ✅ DO

1. **Always use `envault run`** - Never manually source .env files
2. **Different secrets per environment** - Don't reuse production keys in dev
3. **Sync regularly** - `envault sync` before starting work
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

- 💬 **Discord**: https://discord.gg/envault
- 🐛 **Issues**: https://github.com/dj-pearson/vault-verse/issues
- 📧 **Support**: support@envault.net

---

**Congrats!** You now know how to manage secrets like a pro 🎉
