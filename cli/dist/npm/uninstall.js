#!/usr/bin/env node

/**
 * npm pre-uninstall script
 * Cleans up EnvVault CLI binary on uninstall
 */

const fs = require('fs');
const path = require('path');

const BIN_DIR = path.join(__dirname, 'bin');

/**
 * Clean up binaries
 */
function cleanup() {
  try {
    if (fs.existsSync(BIN_DIR)) {
      console.log('Cleaning up EnvVault CLI binaries...');

      // Remove all files in bin directory
      const files = fs.readdirSync(BIN_DIR);
      files.forEach(file => {
        const filePath = path.join(BIN_DIR, file);
        fs.unlinkSync(filePath);
      });

      // Remove bin directory
      fs.rmdirSync(BIN_DIR);

      console.log('✓ Cleanup complete');
    }
  } catch (error) {
    // Silently fail on cleanup errors
    // Don't prevent uninstall if cleanup fails
  }
}

// Run cleanup
cleanup();
