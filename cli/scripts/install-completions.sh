#!/usr/bin/env bash

# Shell completion installation script for envvault
# Automatically detects your shell and installs completions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect shell
detect_shell() {
    if [ -n "$BASH_VERSION" ]; then
        echo "bash"
    elif [ -n "$ZSH_VERSION" ]; then
        echo "zsh"
    elif [ -n "$FISH_VERSION" ]; then
        echo "fish"
    else
        # Try to detect from $SHELL variable
        case "$SHELL" in
            */bash)
                echo "bash"
                ;;
            */zsh)
                echo "zsh"
                ;;
            */fish)
                echo "fish"
                ;;
            *)
                echo "unknown"
                ;;
        esac
    fi
}

# Check if envvault is installed
check_envvault() {
    if ! command -v envvault &> /dev/null; then
        echo -e "${RED}Error: envvault is not installed or not in PATH${NC}"
        echo "Please install envvault first:"
        echo "  brew install envvault/tap/envvault"
        echo "  or"
        echo "  npm install -g @envvault/cli"
        exit 1
    fi
}

# Install bash completion
install_bash() {
    echo "Installing bash completion..."

    # Determine completion directory
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            COMPLETION_DIR="$(brew --prefix)/etc/bash_completion.d"
        else
            COMPLETION_DIR="$HOME/.bash_completion.d"
        fi
    else
        # Linux
        if [ -d "/etc/bash_completion.d" ] && [ -w "/etc/bash_completion.d" ]; then
            COMPLETION_DIR="/etc/bash_completion.d"
        else
            COMPLETION_DIR="$HOME/.bash_completion.d"
        fi
    fi

    # Create directory if it doesn't exist
    mkdir -p "$COMPLETION_DIR"

    # Generate and install completion
    envvault completion bash > "$COMPLETION_DIR/envvault"

    echo -e "${GREEN}✓ Bash completion installed to $COMPLETION_DIR/envvault${NC}"
    echo ""
    echo "To use completions, reload your shell or run:"
    echo "  source $COMPLETION_DIR/envvault"
}

# Install zsh completion
install_zsh() {
    echo "Installing zsh completion..."

    # Determine completion directory
    if [ -n "$ZDOTDIR" ]; then
        COMPLETION_DIR="$ZDOTDIR/completions"
    else
        COMPLETION_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/zsh/site-functions"
    fi

    # Create directory if it doesn't exist
    mkdir -p "$COMPLETION_DIR"

    # Generate and install completion
    envvault completion zsh > "$COMPLETION_DIR/_envvault"

    echo -e "${GREEN}✓ Zsh completion installed to $COMPLETION_DIR/_envvault${NC}"
    echo ""
    echo "Make sure the following is in your ~/.zshrc:"
    echo "  fpath=($COMPLETION_DIR \$fpath)"
    echo "  autoload -U compinit; compinit"
    echo ""
    echo "Then reload your shell or run:"
    echo "  exec zsh"
}

# Install fish completion
install_fish() {
    echo "Installing fish completion..."

    # Determine completion directory
    COMPLETION_DIR="$HOME/.config/fish/completions"

    # Create directory if it doesn't exist
    mkdir -p "$COMPLETION_DIR"

    # Generate and install completion
    envvault completion fish > "$COMPLETION_DIR/envvault.fish"

    echo -e "${GREEN}✓ Fish completion installed to $COMPLETION_DIR/envvault.fish${NC}"
    echo ""
    echo "Completions are automatically loaded in fish."
    echo "Start a new shell to use them."
}

# Main installation logic
main() {
    echo "EnvVault Shell Completion Installer"
    echo "===================================="
    echo ""

    # Check if envvault is installed
    check_envvault

    # Detect shell
    SHELL_TYPE=$(detect_shell)

    if [ "$SHELL_TYPE" = "unknown" ]; then
        echo -e "${YELLOW}Could not detect your shell.${NC}"
        echo "Please specify your shell:"
        echo "  1) bash"
        echo "  2) zsh"
        echo "  3) fish"
        read -p "Enter your choice (1-3): " choice

        case $choice in
            1) SHELL_TYPE="bash" ;;
            2) SHELL_TYPE="zsh" ;;
            3) SHELL_TYPE="fish" ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                exit 1
                ;;
        esac
    fi

    echo "Detected shell: $SHELL_TYPE"
    echo ""

    # Install completion for detected shell
    case $SHELL_TYPE in
        bash)
            install_bash
            ;;
        zsh)
            install_zsh
            ;;
        fish)
            install_fish
            ;;
    esac

    echo ""
    echo -e "${GREEN}Installation complete!${NC}"
}

# Run main function
main
