/**
 * Git safety utilities to prevent accidental secret exposure
 */

import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface GitSafetyCheck {
  isSafe: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * Check if .env files are tracked in git
 */
export async function checkEnvFilesInGit(workspaceRoot: string): Promise<GitSafetyCheck> {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check if this is a git repository
    const gitDir = path.join(workspaceRoot, '.git');
    if (!fs.existsSync(gitDir)) {
      return { isSafe: true, warnings, recommendations };
    }

    // Check for tracked .env files
    const trackedFiles = execSync('git ls-files', {
      cwd: workspaceRoot,
      encoding: 'utf-8',
    }).split('\n');

    const envFiles = trackedFiles.filter(
      (file) =>
        file.match(/\.env$/) ||
        file.match(/\.env\..+$/) ||
        file.includes('.envault.db') ||
        file.includes('secrets.')
    );

    if (envFiles.length > 0) {
      warnings.push('🔴 SECRET FILES ARE TRACKED IN GIT!');
      warnings.push(`Found ${envFiles.length} tracked file(s):`);
      envFiles.forEach((file) => warnings.push(`  - ${file}`));

      recommendations.push('Immediately run: git rm --cached <file>');
      recommendations.push('Add these patterns to .gitignore:');
      recommendations.push('  .env');
      recommendations.push('  .env.*');
      recommendations.push('  .envault.db');
      recommendations.push('  secrets.*');

      return { isSafe: false, warnings, recommendations };
    }

    // Check if .gitignore exists and has proper rules
    const gitignorePath = path.join(workspaceRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

      const hasEnvRule = gitignoreContent.includes('.env');
      const hasEnvaultRule =
        gitignoreContent.includes('.envault.db') || gitignoreContent.includes('*.db');

      if (!hasEnvRule || !hasEnvaultRule) {
        warnings.push('⚠️ .gitignore missing important rules');

        if (!hasEnvRule) {
          recommendations.push('Add to .gitignore: .env and .env.*');
        }
        if (!hasEnvaultRule) {
          recommendations.push('Add to .gitignore: .envault.db');
        }

        return { isSafe: false, warnings, recommendations };
      }
    } else {
      warnings.push('⚠️ No .gitignore file found');
      recommendations.push('Create .gitignore with:');
      recommendations.push('  .env');
      recommendations.push('  .env.*');
      recommendations.push('  .envault.db');
      recommendations.push('  *.db');

      return { isSafe: false, warnings, recommendations };
    }

    return { isSafe: true, warnings, recommendations };
  } catch (error) {
    // Not a git repo or git not available - that's fine
    return { isSafe: true, warnings, recommendations };
  }
}

/**
 * Scan workspace for hardcoded secrets
 */
export async function scanForHardcodedSecrets(
  workspaceRoot: string,
  secretKeys: string[]
): Promise<string[]> {
  const findings: string[] = [];

  try {
    // Common file extensions to scan
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rb', '.php', '.java'];

    // Build grep pattern
    const pattern = secretKeys.map((key) => `${key}\\s*=\\s*["'][^"']+["']`).join('|');

    if (pattern) {
      try {
        const results = execSync(`git grep -n -E "${pattern}" -- ${extensions.join(' ')}`, {
          cwd: workspaceRoot,
          encoding: 'utf-8',
        });

        if (results) {
          findings.push('⚠️ Possible hardcoded secrets found:');
          results
            .split('\n')
            .filter((line) => line.trim())
            .forEach((line) => findings.push(`  ${line}`));
        }
      } catch {
        // No matches found - this is good!
      }
    }
  } catch (error) {
    // Git grep not available or not a git repo
  }

  return findings;
}

/**
 * Check production environment safety
 */
export function checkProductionSafety(environment: string): { warnings: string[] } {
  const warnings: string[] = [];

  if (environment === 'production' || environment === 'prod') {
    warnings.push('🔥 YOU ARE IN PRODUCTION ENVIRONMENT');
    warnings.push('⚠️ Changes will affect live systems');
    warnings.push('⚠️ Double-check all values before saving');
  }

  return { warnings };
}

/**
 * Auto-fix .gitignore
 */
export async function autoFixGitignore(workspaceRoot: string): Promise<boolean> {
  try {
    const gitignorePath = path.join(workspaceRoot, '.gitignore');
    let content = '';

    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, 'utf-8');
    }

    const rules = [
      '',
      '# EnVault - Environment Variables & Secrets',
      '.env',
      '.env.*',
      '.envault.db',
      '*.db',
      'secrets.*',
      '',
    ];

    const needsRules = rules.some((rule) => rule && !content.includes(rule));

    if (needsRules) {
      content += '\n' + rules.join('\n');
      fs.writeFileSync(gitignorePath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
