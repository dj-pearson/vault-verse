# EnVault - Secure Environment Variable Management

[![Website](https://img.shields.io/badge/Website-envault.net-blue)](https://envault.net)
[![npm CLI](https://badge.fury.io/js/envault-cli.svg)](https://www.npmjs.com/package/envault-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, local-first environment variable management for developers and teams. Keep your secrets safe while maintaining seamless collaboration.

## 🚀 Quick Start

### Install the CLI

```bash
# npm
npm install -g envault-cli

# Homebrew (macOS/Linux)
brew install dj-pearson/tap/envault

# Direct download
# Download from https://github.com/dj-pearson/vault-verse/releases/latest
```

### Basic Usage

```bash
# Initialize a new project
envault init my-app

# Set environment variables
envault set DATABASE_URL=postgresql://localhost/mydb
envault set API_KEY=your-secret-key

# List variables (masked by default)
envault list

# Export to .env file
envault export -o .env

# Run command with environment variables
envault run npm start
```

## ✨ Features

- 🔒 **Zero-knowledge encryption** - Your secrets never leave your machine unencrypted
- 💻 **Local-first** - Works 100% offline, no account required
- 🌍 **Multi-environment** - Manage dev, staging, production, and custom environments
- 👥 **Team sync** - Optional encrypted team collaboration
- 🔄 **Import/Export** - Seamless migration from .env files
- 🚀 **Fast & lightweight** - Built in Go, zero dependencies
- 🌐 **Cross-platform** - macOS, Linux, Windows (Intel & ARM)

## 📦 What's in this Repo

This is a monorepo containing:

- **Web Application** (`/src`) - React + TypeScript dashboard for managing environments via web interface
- **CLI Tool** (`/cli`) - Go-based command-line interface for local environment management
- **Documentation** (`/docs`) - Guides, tutorials, and API documentation

## 🌐 Web Application

### Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Cloudflare Pages

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dj-pearson/vault-verse.git
cd vault-verse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Cloudflare Pages or any static hosting service.

## 🔧 CLI Development

The CLI is located in the `/cli` directory and is written in Go.

### Prerequisites

- Go 1.22 or later
- Make (optional, for convenience scripts)

### Building the CLI

```bash
cd cli

# Build for your platform
go build -o envault

# Or build for all platforms
make build-all
```

### Running Tests

```bash
cd cli
go test ./...
```

## 📖 Documentation

- **CLI Reference**: [/docs/CLI_REFERENCE.md](/docs/CLI_REFERENCE.md)
- **Getting Started Guide**: [/docs/GETTING_STARTED.md](/docs/GETTING_STARTED.md)
- **Security Overview**: [/docs/SECURITY.md](/docs/SECURITY.md)
- **Full Documentation**: [envault.net/docs](https://envault.net/docs)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [envault.net](https://envault.net)
- **Documentation**: [envault.net/docs](https://envault.net/docs)
- **CLI Package**: [npmjs.com/package/envault-cli](https://www.npmjs.com/package/envault-cli)
- **Issues**: [github.com/dj-pearson/vault-verse/issues](https://github.com/dj-pearson/vault-verse/issues)
- **Discussions**: [github.com/dj-pearson/vault-verse/discussions](https://github.com/dj-pearson/vault-verse/discussions)

## 💬 Support

- 📧 Email: support@envault.net
- 💬 GitHub Discussions: [Start a discussion](https://github.com/dj-pearson/vault-verse/discussions)
- 🐛 Bug Reports: [Create an issue](https://github.com/dj-pearson/vault-verse/issues)

---

Made with ❤️ by the EnVault Team
