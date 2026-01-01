# CLAUDE.md - EnVault Project Guide

## Project Overview

EnVault is a secure, local-first environment variable management platform for developers and teams. It provides zero-knowledge encryption, CLI-first workflow, and optional team sync capabilities.

**Live Site:** envault.net
**Repository:** github.com/dj-pearson/vault-verse

## Architecture

### Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Library:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **CLI:** Go-based command-line interface
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Analytics:** PostHog, Sentry for error tracking

### Directory Structure

```
vault-verse/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── project/         # Project-related components
│   │   └── settings/        # Settings tab components
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom hooks (useProjects, useSecrets, etc.)
│   ├── integrations/        # Supabase client & types
│   ├── lib/                 # Utilities (utils, sentry, analytics)
│   └── pages/               # Page components
│       └── docs/            # Documentation pages
├── cli/                     # Go CLI source code
└── public/                  # Static assets
```

### Key Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Home | No |
| `/features` | Features | No |
| `/pricing` | Pricing | No |
| `/docs/*` | DocsLayout | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/dashboard` | Dashboard | Yes |
| `/dashboard/team` | Team | Yes |
| `/dashboard/projects/:id` | ProjectDetail | Yes |
| `/dashboard/settings` | Settings | Yes |
| `/admin` | Admin | Yes (Admin) |

### Data Models

- **Projects** - User projects containing environments and secrets
- **Environments** - Environment configurations (dev, staging, prod)
- **Secrets** - Encrypted environment variables
- **Teams** - Team membership and roles
- **Audit Logs** - Activity tracking
- **Subscriptions** - Plan and billing information
- **CLI Tokens** - Personal access tokens for CLI authentication

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useProjects` | CRUD operations for projects |
| `useSecrets` | Manage environment variables |
| `useEnvironments` | Environment management |
| `useUserRole` | User permission checking |
| `usePlanLimits` | Subscription limits |
| `useAuditLogs` | Activity logging |
| `useSubscription` | Billing and plan info |
| `useCLITokens` | CLI token management |

## Conventions

### Code Style

- TypeScript strict mode enabled
- ESLint with React hooks plugin
- Prefer functional components with hooks
- Use `@/` alias for imports from src/

### Component Patterns

- Components use shadcn/ui primitives
- Dialogs/modals use controlled state pattern
- Forms use react-hook-form with zod schemas
- Loading states handled with TanStack Query

### Naming Conventions

- Components: PascalCase (e.g., `SecretManager.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSecrets.ts`)
- Pages: PascalCase matching route (e.g., `Dashboard.tsx`)
- Utils: camelCase (e.g., `utils.ts`)

## Security Features

- Zero-knowledge encryption (AES-256-GCM)
- Secrets encrypted client-side before storage
- OS keychain for master key storage
- Secure session management
- Rate limiting on sensitive operations

## Current Status (January 2026)

### Recently Completed
- Security improvements with secure headers and session IDs
- Enterprise readiness checklist
- Core platform functionality (projects, secrets, environments, teams)
- CLI token management
- Audit logging
- Subscription/billing integration

### Documentation Pages
- Overview (`/docs`)
- Installation (`/docs/installation`)
- Quick Start (`/docs/quickstart`)
- CLI Reference (`/docs/cli`)
- Team Setup (`/docs/team`)
- Security (`/docs/security`)

## Environment Variables

Required for development:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## CLI Commands Reference

```bash
envault init [name]     # Initialize project
envault set KEY=value   # Set variable
envault get KEY         # Get variable
envault list            # List variables
envault delete KEY      # Delete variable
envault run [cmd]       # Run with env vars
envault import FILE     # Import from .env
envault export          # Export to file
envault login           # Authenticate CLI
envault sync            # Team sync
envault env [cmd]       # Manage environments
envault team [cmd]      # Manage team
envault project [cmd]   # Manage projects
```
