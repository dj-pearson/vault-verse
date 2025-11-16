#!/usr/bin/env bash

# Update Homebrew formula with new release version and checksums
# Usage: ./update-formula.sh <version> <darwin-amd64-sha> <darwin-arm64-sha> <linux-amd64-sha> <linux-arm64-sha>

set -e

VERSION=$1
SHA_DARWIN_AMD64=$2
SHA_DARWIN_ARM64=$3
SHA_LINUX_AMD64=$4
SHA_LINUX_ARM64=$5

if [ -z "$VERSION" ] || [ -z "$SHA_DARWIN_AMD64" ] || [ -z "$SHA_DARWIN_ARM64" ] || [ -z "$SHA_LINUX_AMD64" ] || [ -z "$SHA_LINUX_ARM64" ]; then
    echo "Usage: $0 <version> <darwin-amd64-sha> <darwin-arm64-sha> <linux-amd64-sha> <linux-arm64-sha>"
    exit 1
fi

# Remove 'v' prefix if present
VERSION=${VERSION#v}

echo "Updating formula to version $VERSION..."

# Update the formula
sed -i.bak \
    -e "s/VERSION_PLACEHOLDER/$VERSION/g" \
    -e "s/SHA256_AMD64_PLACEHOLDER/$SHA_DARWIN_AMD64/g" \
    -e "s/SHA256_ARM64_PLACEHOLDER/$SHA_DARWIN_ARM64/g" \
    -e "s/SHA256_LINUX_AMD64_PLACEHOLDER/$SHA_LINUX_AMD64/g" \
    -e "s/SHA256_LINUX_ARM64_PLACEHOLDER/$SHA_LINUX_ARM64/g" \
    envvault.rb

# Remove backup file
rm envvault.rb.bak

echo "✓ Formula updated successfully"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff envvault.rb"
echo "2. Test locally: brew install --build-from-source envvault.rb"
echo "3. Commit: git add envvault.rb && git commit -m 'Update to version $VERSION'"
echo "4. Push: git push origin main"
