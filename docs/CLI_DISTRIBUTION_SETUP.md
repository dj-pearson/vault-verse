# CLI Distribution Setup Guide

This document explains how to set up and manage EnvVault CLI distribution across multiple channels: Homebrew, npm, and direct downloads.

## Overview

EnvVault CLI is distributed through:

1. **Homebrew** (macOS & Linux) - `brew install envvault/tap/envvault`
2. **npm** (All platforms) - `npm install -g @envvault/cli`
3. **GitHub Releases** (Direct downloads) - Manual binary downloads
4. **curl Installer** (Quick install) - `curl -fsSL https://get.envvault.com | sh`

## Prerequisites

Before setting up distribution:

- [ ] GitHub repository with releases enabled
- [ ] npm account with organization access (@envvault)
- [ ] GitHub Personal Access Token for Homebrew tap
- [ ] npm auth token for publishing
- [ ] Versioning strategy established

## 1. Homebrew Tap Setup

### Create Homebrew Tap Repository

1. **Create new GitHub repository**:
   ```bash
   # Repository name: homebrew-tap
   # URL: https://github.com/envvault/homebrew-tap
   ```

2. **Clone and set up**:
   ```bash
   git clone https://github.com/envvault/homebrew-tap.git
   cd homebrew-tap
   mkdir Formula
   ```

3. **Add formula**:
   ```bash
   # Copy template
   cp /path/to/vault-verse/cli/dist/homebrew/envvault.rb Formula/envvault.rb

   # Initial commit
   git add Formula/envvault.rb
   git commit -m "Add EnvVault formula"
   git push origin main
   ```

### Formula Structure

The Homebrew formula (`Formula/envvault.rb`) includes:

- Version and metadata
- Platform-specific binary URLs
- SHA256 checksums (security)
- Installation instructions
- Shell completion generation
- Test suite

### Update Formula on Release

Formula is automatically updated by CI/CD:

1. Release triggered (new tag pushed)
2. Binaries built and uploaded to GitHub Releases
3. SHA256 checksums calculated
4. Formula updated with new version and checksums
5. Changes pushed to homebrew-tap repository

### Manual Formula Update

If you need to update manually:

```bash
# 1. Download the binary
curl -LO https://github.com/dj-pearson/vault-verse/releases/download/v1.0.0/envvault-darwin-arm64

# 2. Calculate SHA256
shasum -a 256 envvault-darwin-arm64

# 3. Update Formula/envvault.rb with:
#    - New version number
#    - New SHA256 checksums
#    - New download URLs

# 4. Test formula
brew install --build-from-source Formula/envvault.rb
brew test envvault

# 5. Commit and push
git add Formula/envvault.rb
git commit -m "Update to version 1.0.0"
git push origin main
```

### Test Homebrew Installation

```bash
# Uninstall if already installed
brew uninstall envvault

# Install from tap
brew install envvault/tap/envvault

# Verify installation
which envvault
envvault --version

# Test completions
envvault completion bash
```

## 2. npm Package Setup

### Create npm Organization

1. **Create npm account**: https://www.npmjs.com/signup
2. **Create organization**: https://www.npmjs.com/org/create
   - Organization name: `envvault`
   - Make it public (free)

3. **Invite team members**:
   - Go to https://www.npmjs.com/settings/envvault/members
   - Add team members with appropriate permissions

### Package Structure

The npm package (`cli/dist/npm/`) includes:

- `package.json` - Package metadata
- `install.js` - Post-install script (downloads binary)
- `README.md` - npm package documentation
- `bin/` - Downloaded binaries (created on install)

### Publish to npm

**Initial publish** (first time):

```bash
cd cli/dist/npm

# 1. Login to npm
npm login

# 2. Verify you're logged in
npm whoami

# 3. Publish package
npm publish --access public

# 4. Verify publication
npm view @envvault/cli
```

**Subsequent publishes** (automated by CI/CD):

1. Update version in `package.json`
2. CI/CD automatically publishes on release
3. Uses `NPM_TOKEN` secret for authentication

### Test npm Installation

```bash
# Uninstall if already installed
npm uninstall -g @envvault/cli

# Install from npm
npm install -g @envvault/cli

# Verify installation
which envvault
envvault --version

# Test that binary works
envvault --help
```

### npm Package Versioning

Follow semantic versioning:

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

Update version before release:

```bash
# In cli/dist/npm/package.json
# Change "version": "1.0.0" to "version": "1.1.0"
```

## 3. GitHub Releases Setup

### Release Workflow

GitHub Releases are automatically created by CI/CD when you push a tag:

```bash
# 1. Update version in code
# Update VERSION variable in relevant files

# 2. Commit changes
git add .
git commit -m "Bump version to 1.0.0"
git push

# 3. Create and push tag
git tag v1.0.0
git push origin v1.0.0

# 4. CI/CD automatically:
#    - Builds binaries for all platforms
#    - Calculates SHA256 checksums
#    - Creates GitHub Release
#    - Uploads binaries
#    - Updates Homebrew formula
#    - Publishes to npm
```

### Release Assets

Each release includes:

- `envvault-darwin-amd64` - macOS Intel binary
- `envvault-darwin-arm64` - macOS Apple Silicon binary
- `envvault-linux-amd64` - Linux x64 binary
- `envvault-linux-arm64` - Linux ARM64 binary
- `envvault-windows-amd64.exe` - Windows x64 binary
- `envvault-windows-arm64.exe` - Windows ARM64 binary
- `checksums.txt` - SHA256 checksums for all binaries

### Manual GitHub Release

If you need to create a release manually:

1. **Build binaries**:
   ```bash
   cd cli
   make build-all
   ```

2. **Calculate checksums**:
   ```bash
   cd dist
   shasum -a 256 * > checksums.txt
   ```

3. **Create release**:
   - Go to https://github.com/dj-pearson/vault-verse/releases/new
   - Tag: `v1.0.0`
   - Title: `EnvVault CLI v1.0.0`
   - Description: Release notes
   - Upload all binaries and checksums.txt
   - Publish release

## 4. curl Installer Setup

### Create get.envvault.com

The curl installer provides a quick one-line installation:

```bash
curl -fsSL https://get.envvault.com | sh
```

**Setup**:

1. **Create installer script** (`scripts/install.sh`):
   ```bash
   #!/bin/sh
   # Detects platform and downloads appropriate binary
   # Similar to Rust's rustup installer
   ```

2. **Host on CDN**:
   - Option 1: GitHub Pages (free)
   - Option 2: Cloudflare Pages (free)
   - Option 3: Custom domain with CDN

3. **Set up redirect**:
   - `get.envvault.com` → GitHub raw URL or CDN
   - Or serve directly from CDN

### Installer Script

Create `cli/scripts/install.sh`:

```bash
#!/bin/sh
set -e

# EnvVault CLI Installer
# Usage: curl -fsSL https://get.envvault.com | sh

REPO="dj-pearson/vault-verse"
INSTALL_DIR="${ENVVAULT_INSTALL_DIR:-$HOME/.local/bin}"

# Detect platform
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case $OS in
        darwin) OS="darwin" ;;
        linux) OS="linux" ;;
        *) echo "Unsupported OS: $OS"; exit 1 ;;
    esac

    case $ARCH in
        x86_64) ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac

    echo "${OS}-${ARCH}"
}

# Get latest version
get_latest_version() {
    curl -s https://api.github.com/repos/$REPO/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/'
}

# Main installation
main() {
    echo "Installing EnvVault CLI..."

    PLATFORM=$(detect_platform)
    VERSION=$(get_latest_version)

    echo "Platform: $PLATFORM"
    echo "Version: $VERSION"

    # Download binary
    URL="https://github.com/$REPO/releases/download/v$VERSION/envvault-$PLATFORM"
    mkdir -p "$INSTALL_DIR"
    curl -fsSL "$URL" -o "$INSTALL_DIR/envvault"
    chmod +x "$INSTALL_DIR/envvault"

    echo "✓ EnvVault CLI installed to $INSTALL_DIR/envvault"
    echo ""
    echo "Add to PATH by adding this to your ~/.bashrc or ~/.zshrc:"
    echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
}

main
```

## 5. CI/CD Automation

### Release Workflow (`.github/workflows/release.yml`)

Automates the entire release process:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.22'

      - name: Build binaries
        run: |
          cd cli
          make build-all

      - name: Calculate checksums
        run: |
          cd cli/dist
          sha256sum * > checksums.txt

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: cli/dist/*
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Update Homebrew formula
        run: |
          # Update formula with new version and checksums
          # Push to homebrew-tap repository
        env:
          HOMEBREW_TAP_TOKEN: ${{ secrets.HOMEBREW_TAP_TOKEN }}

      - name: Publish to npm
        run: |
          cd cli/dist/npm
          echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
          npm publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 6. Version Management

### Versioning Strategy

- **Git tags**: Source of truth for versions
- **Format**: `v1.2.3` (semantic versioning)
- **Changelog**: Auto-generated from commits

### Creating a New Release

1. **Update version**:
   ```bash
   # Update version in code
   VERSION="1.0.0"
   ```

2. **Update CHANGELOG.md**:
   ```bash
   # Add release notes
   ```

3. **Commit and tag**:
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

4. **CI/CD takes over**:
   - Builds binaries
   - Creates GitHub Release
   - Updates Homebrew formula
   - Publishes to npm

## 7. Testing Distribution

### Test Checklist

Before each release, test all distribution methods:

**Homebrew**:
- [ ] `brew uninstall envvault` (if installed)
- [ ] `brew install envvault/tap/envvault`
- [ ] `envvault --version` shows correct version
- [ ] Completions work: `envvault completion bash`

**npm**:
- [ ] `npm uninstall -g @envvault/cli` (if installed)
- [ ] `npm install -g @envvault/cli`
- [ ] `envvault --version` shows correct version
- [ ] Binary downloads correctly for platform

**Direct Download**:
- [ ] Download binary from GitHub Releases
- [ ] Verify checksum matches
- [ ] Binary is executable
- [ ] `./envvault --version` works

**curl Installer**:
- [ ] `curl -fsSL https://get.envvault.com | sh`
- [ ] Binary installs to correct location
- [ ] PATH instructions are correct

## 8. Troubleshooting

### Homebrew Issues

**Issue**: Formula not found
**Solution**:
```bash
brew update
brew tap envvault/tap
brew install envvault
```

**Issue**: Checksum mismatch
**Solution**:
- Recalculate checksums
- Update formula
- Clear Homebrew cache: `brew cleanup`

### npm Issues

**Issue**: Binary download fails
**Solution**:
- Check GitHub Release exists
- Verify download URL in install.js
- Check network/firewall

**Issue**: Permission denied
**Solution**:
```bash
# Use sudo or install locally
npm install -g @envvault/cli --unsafe-perm
# Or use nvm for per-user npm
```

### GitHub Releases Issues

**Issue**: Release workflow fails
**Solution**:
- Check GitHub Actions logs
- Verify secrets are configured
- Ensure tag format is correct (v1.0.0)

## Support & Resources

- **Homebrew Tap**: https://github.com/envvault/homebrew-tap
- **npm Package**: https://www.npmjs.com/package/@envvault/cli
- **GitHub Releases**: https://github.com/dj-pearson/vault-verse/releases
- **Documentation**: https://envvault.com/docs

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Next Review**: 2026-01-16
