import { execSync } from 'child_process';
import * as vscode from 'vscode';

export interface Secret {
  key: string;
  value: string;
  description?: string;
}

export interface Environment {
  name: string;
  variableCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  syncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  projectId: string;
  action: string;
  metadata: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  key: string;
  value: string;
  version: number;
  createdAt: string;
}

export class CLIService {
  private cliPath: string;

  constructor() {
    const config = vscode.workspace.getConfiguration('envault');
    this.cliPath = config.get<string>('cliPath') || 'envault';
  }

  /**
   * Execute a CLI command and return the output
   */
  private exec(command: string, options: { cwd?: string; json?: boolean } = {}): string {
    try {
      const fullCommand = `${this.cliPath} ${command}`;
      const result = execSync(fullCommand, {
        encoding: 'utf-8',
        cwd: options.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
        env: process.env,
      });
      return result.trim();
    } catch (error: any) {
      throw new Error(`EnVault CLI error: ${error.message}`);
    }
  }

  /**
   * Check if the CLI is installed and accessible
   */
  async checkCLI(): Promise<boolean> {
    try {
      this.exec('--version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize a new EnVault project
   */
  async init(projectName?: string, options?: { team?: boolean; env?: string[] }): Promise<void> {
    let command = 'init';
    if (projectName) {
      command += ` ${projectName}`;
    }
    if (options?.team) {
      command += ' --team';
    }
    if (options?.env && options.env.length > 0) {
      command += ` --env ${options.env.join(',')}`;
    }
    this.exec(command);
  }

  /**
   * List all secrets for an environment
   */
  async listSecrets(environment: string = 'development'): Promise<Record<string, Secret>> {
    const output = this.exec(`list --json --env ${environment}`);
    if (!output) {
      return {};
    }

    const data = JSON.parse(output);
    const envData = data[environment] || {};

    // Convert to Secret objects
    const secrets: Record<string, Secret> = {};
    for (const [key, value] of Object.entries(envData)) {
      secrets[key] = {
        key,
        value: typeof value === 'string' ? value : String(value),
      };
    }
    return secrets;
  }

  /**
   * Get a specific secret value
   */
  async getSecret(key: string, environment: string = 'development'): Promise<string> {
    const output = this.exec(`get ${key} --env ${environment} --format plain`);
    return output;
  }

  /**
   * Set a secret value
   */
  async setSecret(key: string, value: string, environment: string = 'development', description?: string): Promise<void> {
    let command = `set ${key}="${value}" --env ${environment}`;
    if (description) {
      command += ` --description "${description}"`;
    }
    this.exec(command);
  }

  /**
   * Delete a secret
   */
  async deleteSecret(key: string, environment: string = 'development'): Promise<void> {
    this.exec(`unset ${key} --env ${environment}`);
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<Project[]> {
    const output = this.exec('projects --format json');
    if (!output) {
      return [];
    }
    return JSON.parse(output);
  }

  /**
   * List all environments for the current project
   */
  async listEnvironments(): Promise<string[]> {
    try {
      const output = this.exec('env list');
      // Parse text output (no JSON flag available)
      const lines = output.split('\n').filter(line => line.trim());
      return lines;
    } catch {
      return ['development', 'staging', 'production'];
    }
  }

  /**
   * Create a new environment
   */
  async createEnvironment(name: string): Promise<void> {
    this.exec(`env create ${name}`);
  }

  /**
   * Delete an environment
   */
  async deleteEnvironment(name: string): Promise<void> {
    this.exec(`env delete ${name}`);
  }

  /**
   * Sync secrets with team
   */
  async sync(options?: { push?: boolean; pull?: boolean; force?: boolean }): Promise<void> {
    let command = 'sync';
    if (options?.push) {
      command += ' --push';
    }
    if (options?.pull) {
      command += ' --pull';
    }
    if (options?.force) {
      command += ' --force';
    }
    this.exec(command);
  }

  /**
   * Pull secrets from team
   */
  async pull(): Promise<void> {
    await this.sync({ pull: true });
  }

  /**
   * Push secrets to team
   */
  async push(): Promise<void> {
    await this.sync({ push: true });
  }

  /**
   * Export secrets to .env file
   */
  async exportToEnv(environment: string = 'development', outputPath?: string): Promise<void> {
    let command = `export --env ${environment} --format dotenv`;
    if (outputPath) {
      command += ` --output ${outputPath}`;
    }
    this.exec(command);
  }

  /**
   * Import secrets from .env file
   */
  async importFromEnv(filePath: string, environment: string = 'development'): Promise<void> {
    this.exec(`set --file ${filePath} --env ${environment}`);
  }

  /**
   * Get audit log
   */
  async getAuditLog(limit: number = 50): Promise<AuditLogEntry[]> {
    const output = this.exec(`audit --json --limit ${limit}`);
    if (!output) {
      return [];
    }
    return JSON.parse(output);
  }

  /**
   * Get secret history
   */
  async getSecretHistory(key: string, environment: string = 'development', limit: number = 20): Promise<HistoryEntry[]> {
    const output = this.exec(`history ${key} --env ${environment} --limit ${limit} --json`);
    if (!output) {
      return [];
    }
    return JSON.parse(output);
  }

  /**
   * Login to EnVault
   */
  async login(token: string): Promise<void> {
    this.exec(`login --token ${token}`);
  }

  /**
   * Logout from EnVault
   */
  async logout(): Promise<void> {
    this.exec('logout');
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Try to run a command that requires auth
      this.exec('sync --help');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get project status
   */
  async getStatus(): Promise<string> {
    return this.exec('status');
  }

  /**
   * Check if current directory has an EnVault project
   */
  async hasProject(): Promise<boolean> {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        return false;
      }

      const fs = require('fs');
      const path = require('path');
      const envaultFile = path.join(workspaceRoot, '.envault');

      return fs.existsSync(envaultFile);
    } catch {
      return false;
    }
  }

  /**
   * Get current project info from .envault file
   */
  async getProjectInfo(): Promise<{ projectId: string; projectName: string } | null> {
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        return null;
      }

      const fs = require('fs');
      const path = require('path');
      const envaultFile = path.join(workspaceRoot, '.envault');

      if (!fs.existsSync(envaultFile)) {
        return null;
      }

      const content = fs.readFileSync(envaultFile, 'utf-8');
      const lines = content.split('\n');
      const info: any = {};

      for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
          info[key.trim()] = value.trim();
        }
      }

      return {
        projectId: info.project_id,
        projectName: info.project_name,
      };
    } catch {
      return null;
    }
  }
}
