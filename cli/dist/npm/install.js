#!/usr/bin/env node

/**
 * npm post-install script
 * Downloads the appropriate EnvVault CLI binary for the current platform
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const VERSION = require('./package.json').version;
const GITHUB_REPO = 'dj-pearson/vault-verse';
const BIN_DIR = path.join(__dirname, 'bin');

// Platform and architecture mapping
const PLATFORM_MAP = {
  darwin: {
    x64: 'darwin-amd64',
    arm64: 'darwin-arm64'
  },
  linux: {
    x64: 'linux-amd64',
    arm64: 'linux-arm64'
  },
  win32: {
    x64: 'windows-amd64.exe',
    arm64: 'windows-arm64.exe'
  }
};

/**
 * Get the binary name for the current platform
 */
function getBinaryName() {
  const platform = process.platform;
  const arch = process.arch;

  if (!PLATFORM_MAP[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  if (!PLATFORM_MAP[platform][arch]) {
    throw new Error(`Unsupported architecture: ${arch} on ${platform}`);
  }

  return PLATFORM_MAP[platform][arch];
}

/**
 * Download file from URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    console.log(`Downloading ${url}...`);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Main installation logic
 */
async function install() {
  try {
    console.log('Installing EnvVault CLI...');
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Version: ${VERSION}`);

    // Get binary name for platform
    const binaryName = getBinaryName();
    const isWindows = process.platform === 'win32';
    const outputName = isWindows ? 'envault.exe' : 'envault';

    // Create bin directory
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    // Construct download URL
    const url = `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/envault-${binaryName}`;
    const dest = path.join(BIN_DIR, outputName);

    // Download binary
    await downloadFile(url, dest);

    // Make executable (Unix only)
    if (!isWindows) {
      fs.chmodSync(dest, '755');
    }

    console.log('✓ EnvVault CLI installed successfully!');
    console.log(`Binary location: ${dest}`);
    console.log('');
    console.log('To get started, run:');
    console.log('  envault --help');
    console.log('');
    console.log('For shell completions, run:');
    console.log('  envault completion <bash|zsh|fish>');

  } catch (error) {
    console.error('Failed to install EnvVault CLI:');
    console.error(error.message);
    console.error('');
    console.error('Please install manually from:');
    console.error(`https://github.com/${GITHUB_REPO}/releases/latest`);
    process.exit(1);
  }
}

// Run installation
install();
