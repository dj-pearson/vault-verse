# EnvVault - Product Requirements Document
**Version:** 1.0  
**Last Updated:** November 15, 2025  
**Product Type:** Developer Tool - Environment Variable Management  
**Architecture:** Local-First with Optional Encrypted Sync

---

## Executive Summary

EnvVault is a secure, local-first environment variable management tool for developers and teams. It solves the problem of managing `.env` files across multiple environments (dev/staging/production) while maintaining zero-knowledge encryption - we never see or store user secrets.

**Key Differentiators:**
- Local-first: Works 100% offline with no account required
- Zero-knowledge encryption: We can't see your secrets
- Affordable: $8/user/month vs Doppler's $12/user/month
- Developer-friendly: CLI-first with optional web dashboard
- No vendor lock-in: Export to .env anytime

---

# PART 1: MARKETING WEBSITE & CONVERSION FLOW

## 1.1 Marketing Website Structure

### Homepage (/)

**Hero Section**
```
[Navigation: Logo | Features | Pricing | Docs | Sign In | Get Started]

Headline: "Manage Environment Variables Without the Pain"
Subheading: "Local-first, encrypted, and actually affordable. 
             Stop losing .env files and start shipping faster."

[Primary CTA: "Download CLI - Free"] [Secondary CTA: "Try Team Sync - $8/user"]

Visual: Terminal window showing:
$ envvault init myproject
✓ Project initialized locally
$ envvault set DATABASE_URL postgres://...
✓ Saved securely (encrypted at rest)
$ envvault run npm start
✓ Starting with 12 environment variables
```

**Trust Indicators**
- "Your secrets never leave your machine"
- "Open source CLI • Zero-knowledge encryption"
- "Used by 1,000+ developers" (when available)

**Problem/Solution Section**

The Problem:
```
[Icon: Messy Files]
"Lost in .env Files"
- Scattered across projects
- Different values per environment
- Shared via Slack (insecure)

[Icon: Onboarding Clock]
"Slow Onboarding"
- New devs wait hours for .env setup
- Copy-paste errors
- "It works on my machine"

[Icon: Expensive Tag]
"Expensive Solutions"
- Doppler: $12/user/month
- 1Password: $8/user/month
- DIY solutions break
```

The Solution:
```
[Icon: Lock on Laptop]
"Local-First & Encrypted"
- Works offline, no account needed
- Encrypted with your key
- We can't see your secrets

[Icon: Team]
"Team Sync When You Need It"
- Optional encrypted sync
- Onboard devs in minutes
- Audit who changed what

[Icon: Dollar Sign]
"Actually Affordable"
- Free for solo devs
- $8/user for teams
- No hidden costs
```

**How It Works**
```
1. Install CLI → brew install envvault
2. Initialize Project → envvault init myapp
3. Add Variables → envvault set DATABASE_URL postgres://...
4. Use Anywhere → envvault run npm start
[Optional] Team Sync → envvault sync --team
```

**Feature Comparison**

| Feature | EnvVault | Doppler | 1Password | .env Files |
|---------|----------|---------|-----------|------------|
| Local-First | ✅ | ❌ | ❌ | ✅ |
| Team Sync | ✅ | ✅ | ✅ | ❌ |
| Zero-Knowledge | ✅ | ❌ | ✅ | N/A |
| Works Offline | ✅ | ❌ | Partial | ✅ |
| Price (5 users) | $40/mo | $60/mo | $40/mo | Free |
| CLI-First | ✅ | ✅ | ❌ | N/A |
| Open Source | ✅ | ❌ | ❌ | N/A |

**Security Section**
"Your Secrets Are Yours. We Can't See Them."

EnvVault uses zero-knowledge encryption. Your environment variables are encrypted on your device before anything touches our servers. We store encrypted blobs that only you can decrypt.

**FAQ**
- How is this different from .env files?
- Do you store my secrets? (No - zero-knowledge)
- What if I lose my encryption key? (We can't recover it)
- Can I use without an account? (Yes - 100% local)

---

## 1.2 Pricing Page

**Pricing Tiers**

```
┌─────────────────────────────────────┐
│         FREE (Solo)                 │
│           $0 forever                │
│                                     │
│  ✓ Unlimited projects               │
│  ✓ Unlimited environments           │
│  ✓ Local encrypted storage          │
│  ✓ CLI access                       │
│  ✓ Import/export .env files         │
│  ✓ Open source                      │
│  ✗ Team sync                        │
│  ✗ Web dashboard                    │
│                                     │
│     [Download CLI - Free]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      TEAM (Most Popular)            │
│      $8 per user/month              │
│   (billed monthly or $80/year)      │
│                                     │
│  Everything in Free, plus:          │
│  ✓ Encrypted team sync              │
│  ✓ Web dashboard (metadata only)    │
│  ✓ Audit logs                       │
│  ✓ Team member management           │
│  ✓ Priority email support           │
│                                     │
│  Up to 25 team members              │
│                                     │
│   [Start 14-Day Free Trial]         │
│   No credit card required           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         ENTERPRISE                  │
│       Custom Pricing                │
│                                     │
│  Everything in Team, plus:          │
│  ✓ Unlimited team members           │
│  ✓ SSO (SAML, OIDC)                │
│  ✓ Advanced audit logs              │
│  ✓ SLA & dedicated support          │
│  ✓ Self-hosted option               │
│                                     │
│        [Contact Sales]              │
└─────────────────────────────────────┘
```

---

## 1.3 Account Creation & Onboarding

**Sign Up Page**

Free CLI Users (No Account Required):
```
Download CLI:
[macOS (Intel)]  [macOS (Apple Silicon)]  
[Windows]  [Linux (x64)]

Or install via package manager:
$ brew install envvault
$ npm install -g envvault
```

**Team Plan Signup**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Start Your 14-Day Free Trial
No credit card required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Work Email *
[ ] Team Name *
[ ] Password *
[ ] How many team members? *

☐ I agree to Terms & Privacy

[Create Account]
```

**Onboarding Flow**
```
Step 1: Install CLI
Step 2: Authenticate CLI (envvault login)
Step 3: Create First Project
```

---

## 1.4 Payment Flow

**Upgrade Modal**
```
Unlock Team Features

Start 14-day free trial:
✓ Encrypted team sync
✓ Web dashboard
✓ Audit logs
✓ Team member management

How many team members?
[Select: 2-5 → $16-40/month]

[Start Free Trial]
```

**Payment Method**
```
Team Plan - 5 members
$40/month or $400/year (17% off)

[Stripe Payment Element]
Card number: [________________]

Summary:
Team Plan (5 members)    $40.00
Due today               $40.00
Next billing: Dec 15, 2025

[Subscribe Now]
🔒 Secured by Stripe
```

---

# PART 2: USER DASHBOARD (WEB APP)

## 2.1 Dashboard Purpose

**Key Principle:** Dashboard shows METADATA only, never secret values. To view/edit actual environment variable values, users must use CLI. This reinforces zero-knowledge architecture.

---

## 2.2 Dashboard Layout

**Top Navigation**
```
[Logo] EnvVault

[Projects ▾] [Team ▾] [Settings ▾]     [Avatar ▾]

[Search projects...]               [CLI Docs]
```

---

## 2.3 Main Dashboard Page

**Projects List**
```
┌────────────────────────────────────────┐
│ my-saas-app          [Personal]        │
│ Production web application             │
│                                        │
│ 3 environments • 24 variables          │
│ Last sync: 2h ago                      │
│                                        │
│ [View Details] [CLI Setup] [Share]    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ api-service          [Team: Acme Inc]  │
│ Backend API microservice               │
│                                        │
│ 2 environments • 18 variables          │
│ Team members: alice, bob (+3)          │
│                                        │
│ [View Details] [Audit Log]             │
└────────────────────────────────────────┘
```

**Recent Activity**
```
Today
────────────────────────────────────────
🔄 alice@acme.com synced api-service
   2 hours ago

✏️  You updated my-saas-app (staging)
   3 hours ago

👥 bob@acme.com joined team
   5 hours ago
```

---

## 2.4 Project Detail Page

**Overview Tab**
```
Project: my-saas-app

Quick Actions:
────────────────────────────────────────
Clone this project:
$ envvault pull my-saas-app

View variables (CLI only):
$ envvault list my-saas-app

Add variable (CLI only):
$ envvault set KEY=value --env production
```

**Environments Tab**
```
┌────────────────────────────────────────┐
│ development              [Default]     │
│ 12 variables                           │
│ Last updated: 3 hours ago              │
│                                        │
│ Variable Names (values hidden):        │
│ DATABASE_URL                           │
│ API_KEY                                │
│ REDIS_URL                              │
│ ...and 9 more                          │
│                                        │
│ [View in CLI] [Copy Pull Command]     │
└────────────────────────────────────────┘

ℹ️  Security Note: 
Variable VALUES are never shown in dashboard.
Use CLI to view/edit:
$ envvault get DATABASE_URL --env production
```

**Access Tab (Team Projects)**
```
Team Members (3)
────────────────────────────────────────
alice@acme.com    [Admin] [You]
bob@acme.com      [Developer]  [Remove]
charlie@acme.com  [Developer]  [Remove]

[+ Invite Team Member]

Roles & Permissions:
• Admin: Full access, can invite/remove
• Developer: Read/write dev/staging, read-only prod
• Viewer: Read-only all environments
```

**Settings Tab**
```
General
────────────────────────────────────────
Project Name: [my-saas-app]
Description: [Production web app]
[Save Changes]

Sync Settings
────────────────────────────────────────
☑ Enable automatic sync
☐ Require approval for production changes

Danger Zone
────────────────────────────────────────
[Archive Project]
[Delete Project]
```

---

## 2.5 Team Management

**Members Tab**
```
alice@acme.com    [Owner] [You]
Joined: Oct 1, 2025
Projects: 4 • Last active: Now

bob@acme.com      [Admin]
Joined: Oct 5, 2025
Projects: 3 • Last active: 2 hours ago
[Change Role ▾] [Remove]
```

**Invite Modal**
```
Invite Team Member

Email: [teammate@acme.com]
Role: [Developer ▾]

Add to Projects (optional):
☐ my-saas-app
☑ api-service

[Send Invitation]
```

---

## 2.6 Audit Log

```
Audit Log - Track all changes

Filters: [All Projects ▾] [All Users ▾] [Last 30 Days ▾]

Nov 15, 2025 2:34 PM
────────────────────────────────────────
alice@acme.com updated variables
Project: api-service • Environment: production
Changed: 2 variables (names hidden)
IP: 192.168.1.100 • CLI v1.2.0

Nov 15, 2025 11:20 AM
────────────────────────────────────────
bob@acme.com created environment
Project: mobile-backend • Environment: staging
```

---

## 2.7 Billing & Subscription

**Current Plan**
```
Team Plan                    [Active]
5 team members
$40.00 / month (billed monthly)

Next billing: December 15, 2025

[Change Plan] [Cancel Subscription]
```

**Usage**
```
Team Members: 5 / 25
[████████░░░░░░░░░░] 20%

Projects: 4 / Unlimited
Storage: 2.4 MB / Unlimited
```

**Invoices**
```
Nov 15, 2025  $40.00  [Paid]  [Download ↓]
Oct 15, 2025  $40.00  [Paid]  [Download ↓]
```

---

## 2.8 User Settings

**Profile Tab**
```
Email: [you@company.com]
Display Name: [Alice Chen]
Time Zone: [America/New_York ▾]
[Save Changes]
```

**Security Tab**
```
Password
────────────────────────────────────────
Current Password: [••••••••]
New Password: [        ]
[Change Password]

Active Sessions
────────────────────────────────────────
[🖥️ Current Session] - Now
[💻 CLI Session] - 2h ago [Revoke]
```

**CLI Access Tab**
```
Personal Access Token
────────────────────────────────────────
[envt_a1b2c3d4e5f6g7h8...]
[Show Full] [Regenerate] [Copy]

⚠️  Keep this secret. Anyone with it can
    access your projects.

Usage:
$ envvault login --token envt_a1b2c3...
```

---

# PART 3: CLI SPECIFICATION

## 3.1 CLI Overview

**Name:** `envvault`  
**Language:** Go (single binary, cross-platform)  
**Installation:**
- `brew install envvault`
- `npm install -g envvault`
- Direct download

**Core Features:**
- Local encrypted storage (SQLite + AES-256)
- Multi-environment support
- Team sync (optional, encrypted)
- .env import/export
- Run commands with injected variables

---

## 3.2 Command Reference

### Global Flags
```bash
--help, -h          Show help
--version, -v       Show version
--quiet, -q         Suppress output
--json              Output JSON
--debug             Debug info
```

---

### 3.2.1 `envvault init`

**Initialize new project**

```bash
envvault init [project-name] [flags]

Flags:
  --team              Initialize for team sync
  --template TYPE     Use template (nodejs, python, rails)
  --env ENVIRONMENTS  Comma-separated environments

Examples:
$ envvault init my-app
$ envvault init my-app --team
$ envvault init my-app --env dev,staging,prod
```

**Interactive Flow:**
```bash
$ envvault init

? Project name: my-saas-app
? Environments [development,production]: development,staging,production
? Enable team sync? (y/n): y

✓ Project 'my-saas-app' initialized
✓ Created environments: development, staging, production
✓ Team sync enabled

Next steps:
  Add variables:    envvault set KEY=value
  View variables:   envvault list
  Run with env:     envvault run npm start
```

---

### 3.2.2 `envvault set`

**Set environment variable**

```bash
envvault set KEY=value [flags]
envvault set KEY [flags]  # Prompts for value (hidden)

Flags:
  --env ENVIRONMENT   Environment (default: development)
  --file FILE         Import from .env file
  --description DESC  Add description

Examples:
$ envvault set DATABASE_URL=postgres://localhost/mydb
$ envvault set API_KEY=sk_live_... --env production
$ envvault set API_KEY  # Hidden input prompt
$ envvault set --file .env.production --env production
```

---

### 3.2.3 `envvault get`

**Get variable value**

```bash
envvault get KEY [flags]

Flags:
  --env ENVIRONMENT   Environment (default: development)
  --show-description  Show description
  --format FORMAT     Output: plain, json, export

Examples:
$ envvault get DATABASE_URL
postgres://localhost/mydb

$ envvault get API_KEY --env production
sk_live_a1b2c3d4...

$ envvault get DATABASE_URL --format export
export DATABASE_URL="postgres://localhost/mydb"
```

---

### 3.2.4 `envvault list`

**List all variables**

```bash
envvault list [flags]

Flags:
  --env ENVIRONMENT   Environment (default: all)
  --show-values       Show actual values (default: hidden)
  --format FORMAT     Output: table, json, env
  --filter PATTERN    Filter by regex

Examples:
$ envvault list

Environment: development (12 variables)
──────────────────────────────────────────
DATABASE_URL         postgres://localhost/***
API_KEY              sk_test_***
REDIS_URL            redis://localhost/***

$ envvault list --show-values
DATABASE_URL=postgres://localhost/mydb
API_KEY=sk_test_a1b2c3d4

$ envvault list --format json
{
  "development": {
    "DATABASE_URL": "postgres://localhost/mydb"
  }
}
```

---

### 3.2.5 `envvault unset`

**Remove variable**

```bash
envvault unset KEY [flags]

Flags:
  --env ENVIRONMENT   Environment (default: development)
  --all-envs          Remove from all environments
  --force             Skip confirmation

Examples:
$ envvault unset OLD_API_KEY
? Remove OLD_API_KEY from development? (y/n): y
✓ Removed OLD_API_KEY

$ envvault unset TEMP_VAR --env staging --force
$ envvault unset DEPRECATED_KEY --all-envs
```

---

### 3.2.6 `envvault run`

**Run command with variables injected**

```bash
envvault run [command] [flags]

Flags:
  --env ENVIRONMENT   Environment (default: development)
  --preserve-env      Keep existing env vars

Examples:
$ envvault run npm start
$ envvault run --env production node server.js
$ envvault run python manage.py migrate
$ envvault run bash  # Interactive shell with vars
```

**How it works:**
```bash
$ envvault run --env production npm start

1. Read production variables
2. Inject into process environment
3. Execute: npm start
4. Variables only in that process
5. No .env files written
```

---

### 3.2.7 `envvault export`

**Export to .env format**

```bash
envvault export [flags]

Flags:
  --env ENVIRONMENT   Environment to export
  --output FILE       Output file (default: stdout)
  --format FORMAT     Format: dotenv, json, yaml

Examples:
$ envvault export
DATABASE_URL=postgres://localhost/mydb
API_KEY=sk_test_a1b2c3d4

$ envvault export --output .env
$ envvault export --env production --output .env.production
$ envvault export --format json > config.json
```

---

### 3.2.8 `envvault import`

**Import from .env file**

```bash
envvault import FILE [flags]

Flags:
  --env ENVIRONMENT   Target environment
  --overwrite         Overwrite existing
  --dry-run           Preview without importing

Examples:
$ envvault import .env
$ envvault import .env.production --env production
$ envvault import .env --dry-run
Would import 12 variables:
  DATABASE_URL (new)
  API_KEY (exists, would skip)
```

---

### 3.2.9 `envvault sync`

**Sync with cloud (team feature)**

```bash
envvault sync [flags]

Flags:
  --push              Push local to cloud
  --pull              Pull cloud to local
  --force             Force sync (override conflicts)

Examples:
$ envvault sync
↓ Pulling from cloud...
✓ Pulled 2 updates
↑ Pushing local changes...
✓ Pushed 1 new variable

$ envvault sync --push
$ envvault sync --pull
```

**Conflict Resolution:**
```bash
$ envvault sync

⚠ Conflicts detected:
  DATABASE_URL modified both locally and remotely

? How to resolve?
  > Keep local version
    Keep remote version
    Manual merge

✓ Conflict resolved
```

---

### 3.2.10 `envvault login`

**Authenticate CLI**

```bash
envvault login [flags]

Flags:
  --token TOKEN       Use personal access token
  --manual            Manual auth (no browser)

Examples:
$ envvault login
Opening browser for authentication...
✓ Logged in as alice@acme.com

$ envvault login --token envt_a1b2c3d4...
✓ Logged in as alice@acme.com
```

---

### 3.2.11 `envvault projects`

**List all projects**

```bash
envvault projects [flags]

Flags:
  --format FORMAT     Output: table, json

Examples:
$ envvault projects

Personal Projects
─────────────────────────────────────────
my-saas-app       3 envs    Local + Synced
side-project      2 envs    Local only

Team Projects (Acme Inc)
─────────────────────────────────────────
api-service       2 envs    Synced
mobile-backend    3 envs    Synced
```

---

### 3.2.12 `envvault env`

**Manage environments**

```bash
envvault env [subcommand]

Subcommands:
  list        List environments
  create      Create environment
  delete      Delete environment
  rename      Rename environment
  copy        Copy variables between envs

Examples:
$ envvault env list
development  (12 variables)
staging      (15 variables)
production   (18 variables)

$ envvault env create qa
✓ Created environment 'qa'

$ envvault env copy development staging
? Copy all 12 variables? (y/n): y
✓ Copied 12 variables
```

---

### 3.2.13 `envvault status`

**Show project status**

```bash
envvault status

Example:
$ envvault status

Project: my-saas-app
Status: Synced with cloud ✓

Environments:
  development    12 variables    Local + Cloud
  staging        15 variables    Local + Cloud
  production     18 variables    Local + Cloud

Last sync: 2 hours ago
Storage: 1.2 MB encrypted
Team: Acme Inc (5 members)
```

---

### 3.2.14 `envvault team`

**Manage team**

```bash
envvault team [subcommand]

Subcommands:
  list            List members
  invite EMAIL    Invite member
  remove EMAIL    Remove member

Examples:
$ envvault team list
Acme Inc (5 members)
alice@acme.com      Owner
bob@acme.com        Admin

$ envvault team invite frank@acme.com
? Role: Developer
✓ Invitation sent
```

---

## 3.3 CLI Architecture

### Local Storage
```
~/.envvault/
├── config.yml              Global CLI config
├── auth/
│   ├── session.json        Auth session
│   └── keys/
│       └── master.key      Encryption key
├── data/
│   └── projects.db         SQLite (encrypted)
└── cache/
```

### SQLite Schema
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team_id TEXT,
    sync_enabled BOOLEAN DEFAULT 0
);

CREATE TABLE environments (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    name TEXT NOT NULL
);

CREATE TABLE variables (
    id TEXT PRIMARY KEY,
    environment_id TEXT,
    key TEXT NOT NULL,
    encrypted_value BLOB NOT NULL,  -- AES-256
    description TEXT,
    UNIQUE(environment_id, key)
);
```

---

## 3.4 Encryption Details

**Local Encryption:**
```
1. Generate master key (256-bit) on first run
   Store in OS keychain

2. For each variable:
   plaintext → AES-256-GCM encrypt → encrypted_blob
   
3. Store encrypted_blob in SQLite

4. To read:
   encrypted_blob → decrypt → plaintext
```

**Team Sync (Zero-Knowledge):**
```
1. Generate project encryption key
2. Encrypt entire project database
3. Upload encrypted blob to cloud
4. Share key via secure invite link

Cloud stores:
{
  "project_id": "proj_123",
  "encrypted_data": "AES256_BLOB...",  // Can't decrypt
  "version": 3
}
```

**Security Principles:**
1. Master key never leaves machine
2. Project keys shared via invite, not stored on server
3. Cloud only stores encrypted blobs
4. No plaintext ever transmitted

---

# PART 4: TECHNICAL IMPLEMENTATION

## 4.1 Technology Stack

### Frontend
- React 18 + TypeScript
- Next.js 14 (App Router)
- Tailwind CSS
- Radix UI components

### Backend
- Node.js + Express (TypeScript)
- Alternative: Go with Gin
- PostgreSQL 16 (Supabase)
- Redis for sessions

### CLI
- Go 1.22
- SQLite (modernc.org/sqlite)
- Crypto (golang.org/x/crypto)
- OS Keychain (zalando/go-keyring)

### Infrastructure
- Backend: Railway/Fly.io ($20/month)
- Database: Supabase ($25/month)
- Storage: Cloudflare R2 ($5/month)
- Total: ~$50/month for 100 users

---

## 4.2 Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    max_members INTEGER DEFAULT 1
);

-- Projects (metadata only)
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_id UUID REFERENCES teams(id),
    owner_id UUID REFERENCES users(id)
);

-- Encrypted blobs (zero-knowledge)
CREATE TABLE encrypted_blobs (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    version INTEGER NOT NULL,
    encrypted_data BYTEA NOT NULL,  -- User encrypted
    checksum TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs (no secret values)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4.3 API Endpoints

**Authentication**
```
POST /v1/auth/login
POST /v1/auth/cli/token
```

**Projects**
```
GET    /v1/projects
POST   /v1/projects
GET    /v1/projects/:id
PATCH  /v1/projects/:id
DELETE /v1/projects/:id
```

**Sync**
```
POST /v1/sync/push
GET  /v1/sync/pull/:project_id
GET  /v1/sync/status
```

**Team**
```
GET    /v1/team/members
POST   /v1/team/invite
DELETE /v1/team/members/:id
```

**Audit**
```
GET /v1/audit/logs
```

---

## 4.4 Testing Strategy

### Unit Tests
- CLI: Encryption, commands, storage
- API: Endpoints, auth, validation

### Integration Tests
- Full sync cycle
- Team collaboration flows
- Payment processing

### Security Tests
- Encryption strength validation
- No plaintext storage verification
- Access control testing

---

## 4.5 Deployment Plan

### Week 1-2: CLI MVP
- Core commands (init, set, get, list, run)
- Local encryption
- Mac/Linux binaries

### Week 3-4: Team Sync
- Backend API
- Push/pull sync
- Windows binary

### Week 5-6: Web Dashboard
- User auth
- Project management
- Team features

### Week 7-8: Beta Launch
- Payment integration
- Product Hunt launch
- Bug fixes

---

## 4.6 Success Metrics

**Activation:**
- CLI download → First project: 80%
- Free → Paid conversion: 5%

**Engagement:**
- Daily active users: 40%
- Variables per project: 15+

**Revenue:**
- Month 3: $500 MRR
- Month 6: $5K MRR
- ARPU: $8-10/user

**Technical:**
- API uptime: >99.9%
- Sync success: >99%
- Data loss: 0

---

## 4.7 Rollout Timeline

**Week 1-2:** CLI MVP (local-only)  
**Week 3-4:** Backend + Sync  
**Week 5-6:** Web Dashboard  
**Week 7-8:** Payments + Beta  
**Week 9-10:** Public Launch

---

## 4.8 Risk Mitigation

### Security
- Keys in OS keychain (not plaintext)
- Zero-knowledge = server breach safe
- TLS 1.3 + certificate pinning

### Technical
- Auto backups (last 5 versions)
- Export before sync
- Semantic versioning

### Business
- Validate with beta first
- Can pivot to local-only if needed
- Open source on shutdown

---

## 4.9 Future Roadmap

### Q1 2026
- 2FA
- Custom environments
- Variable templates
- Import from competitors

### Q2 2026
- GitHub Actions integration
- Vercel/Netlify plugins
- Docker Compose support
- VS Code extension

### Q3 2026
- SSO (SAML, OIDC)
- Self-hosted option
- Advanced RBAC
- Compliance reports

---

## Conclusion

EnvVault solves environment variable management with:

1. **Local-First** - Works offline, no vendor lock-in
2. **Zero-Knowledge** - We never see secrets
3. **Developer-Friendly** - CLI-first, intuitive
4. **Affordable** - $8/user vs $12+ competitors
5. **Fast to Build** - 6-8 week MVP

**You store ZERO PII/secrets** - sleep well at night.

**Clear monetization** - Free local, $8/user for sync.

**Ready to build!**

---

**View full document:** [Download EnvVault PRD](computer:///mnt/user-data/outputs/EnvVault-Complete-PRD.md)
