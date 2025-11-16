# GitHub Secrets Setup Guide

This document lists all GitHub Secrets required for CI/CD pipelines and provides instructions for obtaining and configuring them.

## Overview

GitHub Secrets are encrypted environment variables used in GitHub Actions workflows. They allow workflows to access sensitive credentials without exposing them in code.

**Location**: Repository Settings > Secrets and variables > Actions

## Required Secrets (Critical - Needed for CI/CD)

### 1. Supabase Configuration

#### `VITE_SUPABASE_URL`
- **Description**: Supabase project URL (production)
- **Used in**: Frontend build and deployment
- **Format**: `https://your-project.supabase.co`
- **How to obtain**:
  1. Go to https://app.supabase.com
  2. Select your project
  3. Go to Settings > API
  4. Copy "Project URL"

#### `VITE_SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public key (production)
- **Used in**: Frontend build and deployment
- **Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **How to obtain**:
  1. Go to https://app.supabase.com
  2. Select your project
  3. Go to Settings > API
  4. Copy "anon" key under "Project API keys"

#### `SUPABASE_DB_URL`
- **Description**: PostgreSQL connection string (production)
- **Used in**: Database migrations
- **Format**: `postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres`
- **How to obtain**:
  1. Go to https://app.supabase.com
  2. Select your project
  3. Go to Settings > Database
  4. Copy "Connection string" > "URI"
  5. Replace `[YOUR-PASSWORD]` with your database password

#### `SUPABASE_ACCESS_TOKEN`
- **Description**: Supabase Management API access token
- **Used in**: Running migrations, managing project
- **Format**: `sbp_xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://app.supabase.com/account/tokens
  2. Click "Generate new token"
  3. Name it "GitHub Actions"
  4. Set expiry (recommend: 1 year)
  5. Copy the token (shown only once!)

### 2. Frontend Deployment

#### `VERCEL_TOKEN`
- **Description**: Vercel deployment token (if using Vercel for production)
- **Used in**: Automated frontend deployment
- **Format**: `xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://vercel.com/account/tokens
  2. Click "Create"
  3. Name: "GitHub Actions - EnvVault"
  4. Scope: Full Access
  5. Expiration: No expiration (or 1 year)
  6. Copy the token
- **Alternative**: If using Lovable or other platform, this may not be needed

### 3. Monitoring & Error Tracking

#### `SENTRY_AUTH_TOKEN`
- **Description**: Sentry authentication token for release tracking
- **Used in**: Source map upload, release creation
- **Format**: `sntrys_xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://sentry.io/settings/account/api/auth-tokens/
  2. Click "Create New Token"
  3. Name: "GitHub Actions - EnvVault"
  4. Scopes: `project:releases`, `org:read`
  5. Copy the token

#### `VITE_SENTRY_DSN`
- **Description**: Sentry Data Source Name (public, but kept secret)
- **Used in**: Frontend build (error reporting endpoint)
- **Format**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **How to obtain**:
  1. Go to https://sentry.io
  2. Create project "EnvVault Frontend" (React)
  3. Go to Settings > Client Keys (DSN)
  4. Copy the DSN

### 4. CLI Distribution

#### `HOMEBREW_TAP_TOKEN`
- **Description**: GitHub Personal Access Token for updating Homebrew tap
- **Used in**: Automated Homebrew formula updates
- **Format**: `ghp_xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token" > "Classic"
  3. Name: "Homebrew Tap - EnvVault"
  4. Expiration: 1 year (or no expiration)
  5. Scopes: `repo` (full control of private repositories)
  6. Click "Generate token"
  7. Copy the token

#### `NPM_TOKEN`
- **Description**: npm authentication token for publishing packages
- **Used in**: Publishing CLI to npm registry
- **Format**: `npm_xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  2. Click "Generate New Token" > "Automation"
  3. Copy the token
- **Note**: You must have an npm account and be added to the @envvault org

## Optional Secrets (For Enhanced Features)

### 5. Notifications

#### `SLACK_WEBHOOK_URL`
- **Description**: Slack webhook for deployment notifications
- **Used in**: Sending deployment status to Slack
- **Format**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
- **How to obtain**:
  1. Go to https://api.slack.com/apps
  2. Create new app or select existing
  3. Go to "Incoming Webhooks"
  4. Click "Add New Webhook to Workspace"
  5. Select channel (e.g., #deployments)
  6. Copy the Webhook URL

### 6. Analytics (Optional)

#### `VITE_POSTHOG_KEY`
- **Description**: PostHog project API key
- **Used in**: Frontend analytics tracking
- **Format**: `phc_xxxxxxxxxxxxxxxxxxxx`
- **How to obtain**:
  1. Go to https://app.posthog.com
  2. Create project or select existing
  3. Go to Project Settings
  4. Copy "Project API Key"

#### `VITE_POSTHOG_HOST`
- **Description**: PostHog instance URL
- **Used in**: Frontend analytics endpoint
- **Format**: `https://app.posthog.com` or `https://eu.posthog.com`
- **How to obtain**:
  - Use `https://app.posthog.com` (US)
  - Or `https://eu.posthog.com` (EU)

## Configuration Steps

### Step 1: Create Secrets in GitHub

1. Go to your repository: https://github.com/dj-pearson/vault-verse
2. Click "Settings" tab
3. In the left sidebar, click "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Enter the name and value for each secret
6. Click "Add secret"

### Step 2: Verify Secrets

After adding all secrets, verify they're configured correctly:

**Via GitHub UI:**
1. Go to Settings > Secrets and variables > Actions
2. Verify all required secrets are listed
3. Secrets cannot be viewed after creation (only names are visible)

**Via GitHub Actions:**
1. Trigger a workflow run (push a commit or manual trigger)
2. Check workflow logs for authentication errors
3. Secrets are masked in logs (shown as `***`)

### Step 3: Update .env.example (If Needed)

If you add new secrets, update `.env.example` to document them:

```bash
# Add to .env.example
# NEW_SECRET=your-value-here  # Description of what it's for
```

## Secret Security Best Practices

### Do's ✅

- **Use granular scopes**: Give tokens minimum required permissions
- **Set expiration dates**: Rotate tokens annually
- **Use separate environments**: Different secrets for dev/staging/prod
- **Document secrets**: Keep this document updated
- **Use environment-specific secrets**: Prefix with `PROD_`, `STAGING_`, etc.

### Don'ts ❌

- **Don't commit secrets to code**: Never put secrets in source files
- **Don't share secrets**: Each developer should use their own tokens
- **Don't log secrets**: Ensure they're not printed in CI logs
- **Don't reuse secrets**: Use different tokens for different purposes
- **Don't store locally**: Use password managers, not text files

## Troubleshooting

### "Secret not found" Error

**Cause**: Secret name in workflow doesn't match GitHub secret name

**Solution**:
1. Check spelling and case (secrets are case-sensitive)
2. Verify secret exists in repository settings
3. Check if secret is in repository, not organization or environment

### "Invalid credentials" Error

**Cause**: Secret value is incorrect or expired

**Solution**:
1. Regenerate the token/key from the source service
2. Update the secret value in GitHub
3. Trigger workflow again

### "Permission denied" Error

**Cause**: Token doesn't have required permissions

**Solution**:
1. Check token scopes in source service
2. Add required permissions (e.g., `repo`, `write:packages`)
3. Generate new token with correct scopes
4. Update secret in GitHub

### Secrets Not Working in Fork

**Cause**: Secrets are not accessible in forked repositories (security feature)

**Solution**:
- Forks cannot access repository secrets
- Contributors must add their own secrets to test workflows
- Or run workflows in original repository only

## Secrets Rotation Schedule

| Secret | Rotation Frequency | Next Rotation |
|--------|-------------------|---------------|
| `SUPABASE_ACCESS_TOKEN` | Annually | 2026-11-16 |
| `HOMEBREW_TAP_TOKEN` | Annually | 2026-11-16 |
| `NPM_TOKEN` | Annually | 2026-11-16 |
| `SENTRY_AUTH_TOKEN` | Annually | 2026-11-16 |
| `VERCEL_TOKEN` | Annually | 2026-11-16 |
| `SLACK_WEBHOOK_URL` | As needed | N/A |
| `VITE_SENTRY_DSN` | Never (public) | N/A |
| `VITE_SUPABASE_ANON_KEY` | Never (public) | N/A |

## Checklist

### Initial Setup
- [ ] Create Sentry project and get DSN
- [ ] Create Sentry auth token
- [ ] Get Supabase production credentials
- [ ] Create Vercel deployment token (if using Vercel)
- [ ] Create Homebrew tap GitHub token
- [ ] Create npm authentication token
- [ ] Set up Slack webhook (optional)
- [ ] Add all secrets to GitHub repository settings
- [ ] Test CI/CD pipeline with new secrets
- [ ] Document secret names and purposes

### Monthly Review
- [ ] Check for expired tokens
- [ ] Review access logs for suspicious activity
- [ ] Verify all secrets are still working
- [ ] Update rotation schedule if needed

### Annual Rotation
- [ ] Generate new tokens/keys
- [ ] Update GitHub secrets
- [ ] Test workflows with new secrets
- [ ] Revoke old tokens/keys
- [ ] Update documentation

## Emergency Procedures

### If Secret is Compromised

**Immediate actions:**
1. **Revoke the compromised secret** at the source service
2. **Generate new secret** with same permissions
3. **Update GitHub secret** with new value
4. **Monitor for suspicious activity** in service logs
5. **Notify team** via Slack/email
6. **Document the incident** for future reference

**Within 24 hours:**
1. Review all recent activities using the compromised secret
2. Check for unauthorized access or changes
3. Rotate related secrets (if they share permissions)
4. Update security procedures if needed

### If Multiple Secrets are Compromised

**Immediate actions:**
1. **Revoke all compromised secrets** immediately
2. **Pause CI/CD pipelines** until secrets are rotated
3. **Alert all team members**
4. **Generate new secrets** for all affected services
5. **Update all GitHub secrets** at once
6. **Resume CI/CD** after verification

## Support & Resources

- **GitHub Secrets Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Supabase API Docs**: https://supabase.com/docs/reference/api
- **Vercel API Docs**: https://vercel.com/docs/rest-api
- **npm Token Docs**: https://docs.npmjs.com/creating-and-viewing-access-tokens
- **Sentry API Docs**: https://docs.sentry.io/api/

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Next Review**: 2025-12-16
