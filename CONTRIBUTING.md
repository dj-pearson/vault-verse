# Contributing to EnvVault

Thank you for your interest in contributing to EnvVault! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vault-verse.git
   cd vault-verse
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/dj-pearson/vault-verse.git
   ```

## Development Setup

### Prerequisites

- **Node.js** >= 14.0.0 (for frontend)
- **Go** 1.22+ (for CLI)
- **npm** >= 6.0.0
- **Git**

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### CLI Setup

```bash
cd cli

# Install dependencies
go mod download

# Build CLI
make build

# Run CLI
./bin/envault --help
```

### Database Setup

The project uses Supabase for the backend. You'll need:

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Run migrations in `supabase/migrations/` in order
4. Update `.env` with your Supabase credentials

## Project Structure

```
vault-verse/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (Sentry, analytics)
│   └── integrations/      # External integrations
├── cli/                   # Go CLI tool
│   ├── cmd/              # CLI commands
│   ├── internal/         # Internal packages
│   └── dist/             # Distribution files
├── supabase/             # Backend (migrations)
│   └── migrations/       # SQL migrations
├── docs/                 # Documentation
└── .github/              # GitHub Actions workflows
```

## Making Changes

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (create PRs against this)
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Urgent production fixes

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(cli): add update command
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Code Style

#### Frontend (TypeScript/React)

- Use TypeScript for all new files
- Follow ESLint configuration
- Use functional components with hooks
- Format with Prettier (run `npm run lint`)

#### Backend (Go)

- Follow Go standard style
- Run `go fmt` before committing
- Use `make lint` to check for issues
- Write tests for new functionality

### Adding Features

1. **Check existing issues** - See if the feature is already planned
2. **Create an issue** - Discuss the feature before implementing
3. **Get approval** - Wait for maintainer feedback
4. **Implement** - Create a feature branch and implement
5. **Test** - Write tests for new functionality
6. **Document** - Update documentation as needed

## Testing

### Frontend Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### CLI Tests

```bash
cd cli

# Run tests
make test

# Run tests with coverage
make test-coverage
```

### Manual Testing

Before submitting a PR, test:

1. **Frontend**: Build and preview
   ```bash
   npm run build
   npm run preview
   ```

2. **CLI**: Build and test commands
   ```bash
   cd cli
   make build
   ./bin/envault init test-project
   ./bin/envault set KEY=value
   ```

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Create a branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make your changes**:
   - Write clean, well-documented code
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Create a Pull Request**:
   - Go to GitHub and create a PR from your branch to `develop`
   - Fill out the PR template
   - Link any related issues
   - Wait for review

### PR Review Process

- All PRs require at least one approval
- CI/CD checks must pass
- Code must follow style guidelines
- Tests must pass
- Documentation must be updated

## Release Process

Releases are managed by maintainers:

1. **Version bump**: Update version in appropriate files
2. **Changelog**: Update CHANGELOG.md
3. **Tag**: Create git tag (e.g., `v1.0.0`)
4. **Push**: `git push origin v1.0.0`
5. **CI/CD**: Automated release process:
   - Builds binaries for all platforms
   - Creates GitHub Release
   - Updates Homebrew formula
   - Publishes to npm
   - Sends notifications

## Getting Help

- **Issues**: https://github.com/dj-pearson/vault-verse/issues
- **Discussions**: https://github.com/dj-pearson/vault-verse/discussions
- **Documentation**: https://envault.net/docs

## Development Tips

### Debugging Frontend

- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log` or debugger statements
- Check Network tab for API calls

### Debugging CLI

- Use `--debug` flag: `envault --debug <command>`
- Add debug prints: `fmt.Printf("debug: %+v\n", data)`
- Use Go debugger (Delve): `dlv debug`

### Common Issues

**Frontend won't start**:
- Check `.env` file exists and is configured
- Run `npm install` to ensure dependencies are installed
- Clear node_modules and reinstall

**CLI won't build**:
- Run `go mod tidy` to update dependencies
- Check Go version is 1.22+
- Ensure you're in the `cli/` directory

**Database errors**:
- Verify Supabase credentials in `.env`
- Check migrations are run in order
- Verify RLS policies are not blocking access

## License

By contributing to EnvVault, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or start a discussion if you have questions!
