# EnvVault Homebrew Tap

This directory contains the Homebrew formula for EnvVault CLI.

## For Users

### Installation

```bash
brew tap envault/tap
brew install envault
```

Or install in one command:

```bash
brew install envault/tap/envault
```

### Usage

```bash
envault --help
```

## For Maintainers

### Creating the Homebrew Tap Repository

1. **Create GitHub repository**:
   ```bash
   # Repository name MUST be: homebrew-tap
   # URL will be: https://github.com/envault/homebrew-tap
   ```

2. **Initialize repository**:
   ```bash
   git clone https://github.com/envault/homebrew-tap.git
   cd homebrew-tap
   mkdir Formula
   ```

3. **Copy formula**:
   ```bash
   cp /path/to/vault-verse/cli/dist/homebrew/envault.rb Formula/
   ```

4. **Commit and push**:
   ```bash
   git add Formula/envault.rb
   git commit -m "Add EnvVault formula"
   git push origin main
   ```

### Updating the Formula

The formula is automatically updated by CI/CD on each release. Manual updates:

1. **Update version number**:
   - Change `VERSION_PLACEHOLDER` to actual version (e.g., `1.0.0`)

2. **Update SHA256 checksums**:
   ```bash
   # Download binaries
   curl -LO https://github.com/dj-pearson/vault-verse/releases/download/v1.0.0/envault-darwin-arm64

   # Calculate checksum
   shasum -a 256 envault-darwin-arm64
   # Output: abc123... envault-darwin-arm64

   # Update SHA256_ARM64_PLACEHOLDER with the hash
   ```

3. **Repeat for all platforms**:
   - `darwin-amd64` → `SHA256_AMD64_PLACEHOLDER`
   - `darwin-arm64` → `SHA256_ARM64_PLACEHOLDER`
   - `linux-amd64` → `SHA256_LINUX_AMD64_PLACEHOLDER`
   - `linux-arm64` → `SHA256_LINUX_ARM64_PLACEHOLDER`

4. **Test locally**:
   ```bash
   brew install --build-from-source Formula/envault.rb
   brew test envault
   brew audit --strict envault
   ```

5. **Commit and push**:
   ```bash
   git add Formula/envault.rb
   git commit -m "Update to version 1.0.0"
   git push origin main
   ```

### Automated Updates (CI/CD)

The formula is updated automatically by the release workflow in the main repository:

1. New tag pushed (e.g., `v1.0.0`)
2. GitHub Actions builds binaries
3. Checksums calculated
4. Formula updated via script
5. Changes pushed to homebrew-tap

See `.github/workflows/release.yml` for details.

### Testing the Formula

```bash
# Install from local formula
brew install --build-from-source Formula/envault.rb

# Test the formula
brew test envault

# Audit the formula
brew audit --strict envault

# Uninstall
brew uninstall envault
```

### Formula Template Variables

The formula template contains placeholders that are replaced during release:

- `VERSION_PLACEHOLDER` - Version number (e.g., `1.0.0`)
- `SHA256_AMD64_PLACEHOLDER` - SHA256 for macOS Intel
- `SHA256_ARM64_PLACEHOLDER` - SHA256 for macOS ARM
- `SHA256_LINUX_AMD64_PLACEHOLDER` - SHA256 for Linux x64
- `SHA256_LINUX_ARM64_PLACEHOLDER` - SHA256 for Linux ARM

### Troubleshooting

**Formula not found**:
```bash
brew update
brew tap envault/tap
```

**Checksum mismatch**:
- Recalculate checksums from actual release binaries
- Ensure version matches release tag

**Installation fails**:
- Check formula syntax: `brew audit Formula/envault.rb`
- Test locally before pushing
- Review CI/CD logs for errors

## Support

- Issues: https://github.com/dj-pearson/vault-verse/issues
- Discussions: https://github.com/dj-pearson/vault-verse/discussions
