#!/bin/sh
# EnvVault CLI Installer
# Usage: curl -fsSL https://get.envvault.com | sh

set -e

REPO="dj-pearson/vault-verse"
INSTALL_DIR="${ENVVAULT_INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="envvault"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect platform
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case $OS in
        darwin) OS="darwin" ;;
        linux) OS="linux" ;;
        msys*|mingw*|cygwin*) OS="windows" ;;
        *)
            echo "${RED}Error: Unsupported OS: $OS${NC}"
            echo "Please download manually from https://github.com/$REPO/releases/latest"
            exit 1
            ;;
    esac

    case $ARCH in
        x86_64|amd64) ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        *)
            echo "${RED}Error: Unsupported architecture: $ARCH${NC}"
            echo "Please download manually from https://github.com/$REPO/releases/latest"
            exit 1
            ;;
    esac

    # Add .exe extension for Windows
    if [ "$OS" = "windows" ]; then
        BINARY_NAME="envvault.exe"
    fi

    echo "${OS}-${ARCH}"
}

# Get latest version
get_latest_version() {
    VERSION=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

    if [ -z "$VERSION" ]; then
        echo "${RED}Error: Could not determine latest version${NC}"
        exit 1
    fi

    echo "$VERSION"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Download and install
install() {
    echo "EnvVault CLI Installer"
    echo "======================"
    echo ""

    # Check for required commands
    if ! command_exists curl; then
        echo "${RED}Error: curl is required but not installed${NC}"
        exit 1
    fi

    # Detect platform
    PLATFORM=$(detect_platform)
    echo "Platform: $PLATFORM"

    # Get latest version
    VERSION=$(get_latest_version)
    echo "Version: v$VERSION"
    echo ""

    # Construct download URL
    if [ "$PLATFORM" = "windows-amd64" ] || [ "$PLATFORM" = "windows-arm64" ]; then
        URL="https://github.com/$REPO/releases/download/v$VERSION/envvault-$PLATFORM.exe"
    else
        URL="https://github.com/$REPO/releases/download/v$VERSION/envvault-$PLATFORM"
    fi

    # Create install directory
    mkdir -p "$INSTALL_DIR"

    # Download binary
    echo "Downloading from $URL..."
    TMP_FILE=$(mktemp)

    if ! curl -fsSL "$URL" -o "$TMP_FILE"; then
        echo "${RED}Error: Failed to download binary${NC}"
        echo "URL: $URL"
        rm -f "$TMP_FILE"
        exit 1
    fi

    # Move to install directory
    mv "$TMP_FILE" "$INSTALL_DIR/$BINARY_NAME"

    # Make executable (Unix only)
    if [ "$PLATFORM" != "windows-amd64" ] && [ "$PLATFORM" != "windows-arm64" ]; then
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    fi

    echo "${GREEN}✓ EnvVault CLI installed successfully!${NC}"
    echo ""
    echo "Binary location: $INSTALL_DIR/$BINARY_NAME"
    echo ""

    # Check if install directory is in PATH
    case ":${PATH}:" in
        *":$INSTALL_DIR:"*)
            echo "You can now use: ${GREEN}envvault --help${NC}"
            ;;
        *)
            echo "${YELLOW}Note: $INSTALL_DIR is not in your PATH${NC}"
            echo ""
            echo "Add to PATH by adding this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
            echo "  export PATH=\"$INSTALL_DIR:\$PATH\""
            echo ""
            echo "Then reload your shell or run:"
            echo "  source ~/.bashrc  # or ~/.zshrc"
            ;;
    esac

    echo ""
    echo "Quick start:"
    echo "  envvault init my-app        # Initialize a new project"
    echo "  envvault set KEY=value      # Set environment variable"
    echo "  envvault list               # List all variables"
    echo "  envvault --help             # Show all commands"
    echo ""
    echo "For shell completions, run:"
    echo "  envvault completion bash|zsh|fish"
    echo ""
    echo "Documentation: https://envvault.com/docs"
}

# Run installation
install
