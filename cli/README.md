# EnvVault CLI

Secure, local-first environment variable management with zero-knowledge encryption.

## Features

- 🔒 **Local-First**: Works 100% offline, no account required
- 🔐 **Zero-Knowledge Encryption**: AES-256-GCM encryption, keys stored in OS keychain
- 🌍 **Multi-Environment**: Manage dev, staging, production, and custom environments
- 🚀 **Fast**: Single binary written in Go, no dependencies
- 🔄 **Team Sync**: Optional encrypted sync for team collaboration
- 📦 **Import/Export**: Work with existing .env files

## Installation

### From Source

```bash
cd cli
make build
make install
```

### Pre-built Binaries

Download from the [releases page](https://github.com/dj-pearson/envault/releases).

### Package Managers (Coming Soon)

```bash
# Homebrew
brew install envault

# npm
npm install -g envault
```

## Quick Start

```bash
# Initialize a new project
envault init my-app

# Add environment variables
envault set DATABASE_URL=postgres://localhost/mydb
envault set API_KEY  # Hidden input for secrets

# List all variables (values masked by default)
envault list

# Get a specific variable
envault get DATABASE_URL

# Run a command with variables injected
envault run npm start

# Export to .env file
envault export --output .env
```

## Commands

### Project Management

```bash
envault init [name]        # Initialize new project
envault status             # Show project status
envault projects           # List all projects
```

### Variable Management

```bash
envault set KEY=value      # Set a variable
envault get KEY            # Get a variable value
envault list               # List all variables
envault unset KEY          # Remove a variable
```

### Environment Management

```bash
envault env list           # List environments
envault env create NAME    # Create environment
envault env delete NAME    # Delete environment
envault env copy SRC DST   # Copy variables between environments
```

### Import/Export

```bash
envault import .env        # Import from .env file
envault export             # Export to stdout
envault export -o .env     # Export to file
```

### Run Commands

```bash
envault run <command>      # Run command with env vars
envault run --env prod node server.js
```

## Security Features

### Encryption

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Storage**: OS keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)
- **No Plaintext**: Variables are never stored unencrypted on disk
- **Zero-Knowledge**: When using team sync, server can't decrypt your secrets

### Safeguards

The CLI includes multiple safety features:

1. **Production Warnings**: Alerts when performing dangerous operations on production
2. **Confirmation Prompts**: Requires confirmation for destructive actions
3. **Key Validation**: Prevents invalid environment variable names
4. **File Path Detection**: Warns if you accidentally set a file path as a value
5. **Gitignore Management**: Automatically adds exports to .gitignore

## Architecture

### Local Storage

```
~/.envault/
├── config.yml              # Global configuration
├── auth/
│   ├── session.json        # Authentication session
│   └── keys/
│       └── master.key      # Encryption key (in OS keychain)
├── data/
│   └── projects.db         # SQLite database (encrypted)
└── cache/
```

### Database Schema

```sql
projects          # Project metadata
environments      # Environments (dev, staging, production)
secrets           # Encrypted variables
audit_logs        # Change history
sync_metadata     # Sync state tracking
```

### How Encryption Works

```
1. On first run:
   - Generate 256-bit master key
   - Store in OS keychain (NOT on disk)

2. Setting a variable:
   plaintext → AES-256-GCM encrypt → SQLite

3. Reading a variable:
   SQLite → decrypt → plaintext (only in memory)

4. Team sync (optional):
   - Project encrypted with shared key
   - Upload encrypted blob to cloud
   - Cloud can't decrypt (zero-knowledge)
```

## Environment Variables

The CLI respects these environment variables:

- `ENVAULT_CONFIG`: Custom config file path
- `ENVAULT_DEBUG`: Enable debug logging

## Development

### Build

```bash
make build          # Build for current platform
make build-all      # Build for all platforms
make install        # Install to $GOPATH/bin
```

### Test

```bash
make test           # Run tests
make test-coverage  # Run tests with coverage
```

### Code Quality

```bash
make fmt            # Format code
make lint           # Run linter
```

## Comparison

| Feature | EnvVault | Doppler | 1Password | .env Files |
|---------|----------|---------|-----------|------------|
| Local-First | ✅ | ❌ | ❌ | ✅ |
| Works Offline | ✅ | ❌ | Partial | ✅ |
| Zero-Knowledge | ✅ | ❌ | ✅ | N/A |
| Team Sync | ✅ | ✅ | ✅ | ❌ |
| CLI-First | ✅ | ✅ | ❌ | N/A |
| Price (5 users) | $40/mo | $60/mo | $40/mo | Free |

## License

MIT

## Support

- Documentation: https://envault.dev/docs
- Issues: https://github.com/dj-pearson/envault/issues
- Email: support@envault.dev
