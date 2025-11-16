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

Download from the [releases page](https://github.com/dj-pearson/envvault/releases).

### Package Managers (Coming Soon)

```bash
# Homebrew
brew install envvault

# npm
npm install -g envvault
```

## Quick Start

```bash
# Initialize a new project
envvault init my-app

# Add environment variables
envvault set DATABASE_URL=postgres://localhost/mydb
envvault set API_KEY  # Hidden input for secrets

# List all variables (values masked by default)
envvault list

# Get a specific variable
envvault get DATABASE_URL

# Run a command with variables injected
envvault run npm start

# Export to .env file
envvault export --output .env
```

## Commands

### Project Management

```bash
envvault init [name]        # Initialize new project
envvault status             # Show project status
envvault projects           # List all projects
```

### Variable Management

```bash
envvault set KEY=value      # Set a variable
envvault get KEY            # Get a variable value
envvault list               # List all variables
envvault unset KEY          # Remove a variable
```

### Environment Management

```bash
envvault env list           # List environments
envvault env create NAME    # Create environment
envvault env delete NAME    # Delete environment
envvault env copy SRC DST   # Copy variables between environments
```

### Import/Export

```bash
envvault import .env        # Import from .env file
envvault export             # Export to stdout
envvault export -o .env     # Export to file
```

### Run Commands

```bash
envvault run <command>      # Run command with env vars
envvault run --env prod node server.js
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
~/.envvault/
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

- `ENVVAULT_CONFIG`: Custom config file path
- `ENVVAULT_DEBUG`: Enable debug logging

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

- Documentation: https://envvault.dev/docs
- Issues: https://github.com/dj-pearson/envvault/issues
- Email: support@envvault.dev
