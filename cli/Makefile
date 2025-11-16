# EnvVault CLI Makefile

.PHONY: build install test clean help

# Variables
BINARY_NAME=envvault
VERSION?=dev
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')
LDFLAGS=-ldflags "-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME)"

# Default target
all: build

# Build for current platform
build:
	@echo "Building $(BINARY_NAME)..."
	@go build $(LDFLAGS) -o bin/$(BINARY_NAME) .
	@echo "✓ Built bin/$(BINARY_NAME)"

# Install to GOPATH/bin
install:
	@echo "Installing $(BINARY_NAME)..."
	@go install $(LDFLAGS) .
	@echo "✓ Installed to $(shell go env GOPATH)/bin/$(BINARY_NAME)"

# Build for multiple platforms
build-all: clean
	@echo "Building for multiple platforms..."
	@mkdir -p dist

	@echo "Building for macOS (Intel)..."
	@GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o dist/$(BINARY_NAME)-darwin-amd64 .

	@echo "Building for macOS (Apple Silicon)..."
	@GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o dist/$(BINARY_NAME)-darwin-arm64 .

	@echo "Building for Linux (x64)..."
	@GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o dist/$(BINARY_NAME)-linux-amd64 .

	@echo "Building for Linux (ARM64)..."
	@GOOS=linux GOARCH=arm64 go build $(LDFLAGS) -o dist/$(BINARY_NAME)-linux-arm64 .

	@echo "Building for Windows (x64)..."
	@GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o dist/$(BINARY_NAME)-windows-amd64.exe .

	@echo "✓ Built binaries in dist/"

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✓ Coverage report: coverage.html"

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf bin/ dist/ coverage.out coverage.html
	@echo "✓ Cleaned build artifacts"

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy
	@echo "✓ Dependencies downloaded"

# Run linter
lint:
	@echo "Running linter..."
	@golangci-lint run ./...

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...
	@echo "✓ Code formatted"

# Development build with race detector
dev:
	@echo "Building development version..."
	@go build -race $(LDFLAGS) -o bin/$(BINARY_NAME)-dev .
	@echo "✓ Built bin/$(BINARY_NAME)-dev"

# Show help
help:
	@echo "EnvVault CLI Build Commands:"
	@echo ""
	@echo "  make build         Build for current platform"
	@echo "  make install       Install to GOPATH/bin"
	@echo "  make build-all     Build for all platforms"
	@echo "  make test          Run tests"
	@echo "  make test-coverage Run tests with coverage"
	@echo "  make clean         Clean build artifacts"
	@echo "  make deps          Download dependencies"
	@echo "  make lint          Run linter"
	@echo "  make fmt           Format code"
	@echo "  make dev           Build with race detector"
	@echo "  make help          Show this help"
	@echo ""
	@echo "Environment variables:"
	@echo "  VERSION            Set version (default: dev)"
