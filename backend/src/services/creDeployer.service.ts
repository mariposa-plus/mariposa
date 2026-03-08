import { spawn } from 'child_process';
import CREProject from '../models/CREProject';
import { wsService } from './websocket.service';
import { creAuth } from './creAuth.service';
import { creProjectManager } from './creProjectManager.service';

const CRE_CLI_PATH = process.env.CRE_CLI_PATH || 'cre';
const DEPLOY_TIMEOUT = 120000; // 120 seconds

class CREDeployerService {
  /**
   * Request deployment access via `cre account access`
   */
  async requestAccess(projectId: string): Promise<void> {
    const authStatus = await creAuth.checkStatus();
    if (!authStatus.authenticated) {
      throw new Error('CRE authentication required. Please login first.');
    }

    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    await creProjectManager.ensureProjectFiles(projectId);

    project.deploymentStatus = 'access-requested';
    project.deploymentLogs = [];
    await project.save();

    const logs: string[] = [];

    return new Promise<void>((resolve, reject) => {
      const child = spawn(
        CRE_CLI_PATH,
        ['account', 'access', '--target', 'staging-settings'],
        {
          cwd: project.workspacePath,
          env: {
            ...process.env,
            ...this.loadEnvFile(project.workspacePath),
          },
          shell: true,
        }
      );

      const timeout = setTimeout(async () => {
        child.kill('SIGTERM');
        const timeoutMsg = `Access request timed out after ${DEPLOY_TIMEOUT / 1000}s`;
        logs.push(timeoutMsg);
        wsService.emitDeploymentLog(projectId, timeoutMsg);
        wsService.emitDeploymentComplete(projectId, false, -1, 'access');

        project.deploymentStatus = 'deploy-failed';
        project.deploymentLogs = logs.slice(-500);
        await project.save();
        reject(new Error(timeoutMsg));
      }, DEPLOY_TIMEOUT);

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        logs.push(trimmed);
        wsService.emitDeploymentLog(projectId, trimmed);
      };

      let stdoutBuffer = '';
      child.stdout?.on('data', (data: Buffer) => {
        stdoutBuffer += data.toString();
        const lines = stdoutBuffer.split('\n');
        stdoutBuffer = lines.pop() || '';
        lines.forEach(line => processLine(line));
      });

      let stderrBuffer = '';
      child.stderr?.on('data', (data: Buffer) => {
        stderrBuffer += data.toString();
        const lines = stderrBuffer.split('\n');
        stderrBuffer = lines.pop() || '';
        lines.forEach(line => processLine(line));
      });

      child.on('close', async (code) => {
        clearTimeout(timeout);

        if (stdoutBuffer.trim()) processLine(stdoutBuffer);
        if (stderrBuffer.trim()) processLine(stderrBuffer);

        const success = code === 0;
        wsService.emitDeploymentComplete(projectId, success, code || 0, 'access');

        project.deploymentStatus = success ? 'access-granted' : 'deploy-failed';
        project.deploymentLogs = logs.slice(-500);
        await project.save();

        if (success) {
          resolve();
        } else {
          reject(new Error(`Access request failed with exit code ${code}`));
        }
      });

      child.on('error', async (error) => {
        clearTimeout(timeout);
        const errorMsg = `Failed to start access request: ${error.message}`;
        logs.push(errorMsg);
        wsService.emitDeploymentLog(projectId, errorMsg);
        wsService.emitDeploymentComplete(projectId, false, -1, 'access');

        project.deploymentStatus = 'deploy-failed';
        project.deploymentLogs = logs.slice(-500);
        await project.save();

        reject(error);
      });
    });
  }

  /**
   * Deploy workflow via `cre workflow deploy` then `cre workflow activate`
   */
  async deploy(projectId: string, workflowName: string, target: string): Promise<void> {
    const authStatus = await creAuth.checkStatus();
    if (!authStatus.authenticated) {
      throw new Error('CRE authentication required. Please login first.');
    }

    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    await creProjectManager.ensureProjectFiles(projectId);

    project.status = 'deploying';
    project.deploymentStatus = 'deploying';
    project.deploymentLogs = [];
    await project.save();

    const logs: string[] = [];

    // Step 1: Deploy
    await this.runCommand(
      projectId,
      project.workspacePath,
      ['workflow', 'deploy', workflowName, '--target', target, '--yes'],
      logs,
      'deploy'
    );

    // Step 2: Activate (only if deploy succeeded)
    logs.push('--- Activating workflow ---');
    wsService.emitDeploymentLog(projectId, '--- Activating workflow ---');

    await this.runCommand(
      projectId,
      project.workspacePath,
      ['workflow', 'activate', workflowName, '--target', target, '--yes'],
      logs,
      'deploy'
    );

    // Both steps succeeded
    const updatedProject = await CREProject.findById(projectId);
    if (updatedProject) {
      updatedProject.status = 'ready';
      updatedProject.deploymentStatus = 'deployed';
      updatedProject.deploymentLogs = logs.slice(-500);
      updatedProject.lastDeployedAt = new Date();
      await updatedProject.save();
    }
  }

  /**
   * Run a single CRE CLI command and stream output
   */
  private runCommand(
    projectId: string,
    cwd: string,
    args: string[],
    logs: string[],
    step: 'access' | 'deploy'
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(CRE_CLI_PATH, args, {
        cwd,
        env: {
          ...process.env,
          ...this.loadEnvFile(cwd),
        },
        shell: true,
      });

      const timeout = setTimeout(async () => {
        child.kill('SIGTERM');
        const timeoutMsg = `Command timed out after ${DEPLOY_TIMEOUT / 1000}s`;
        logs.push(timeoutMsg);
        wsService.emitDeploymentLog(projectId, timeoutMsg);
        wsService.emitDeploymentComplete(projectId, false, -1, step);

        const project = await CREProject.findById(projectId);
        if (project) {
          project.status = 'error';
          project.deploymentStatus = 'deploy-failed';
          project.deploymentLogs = logs.slice(-500);
          await project.save();
        }
        reject(new Error(timeoutMsg));
      }, DEPLOY_TIMEOUT);

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        logs.push(trimmed);
        wsService.emitDeploymentLog(projectId, trimmed);
      };

      let stdoutBuffer = '';
      child.stdout?.on('data', (data: Buffer) => {
        stdoutBuffer += data.toString();
        const lines = stdoutBuffer.split('\n');
        stdoutBuffer = lines.pop() || '';
        lines.forEach(line => processLine(line));
      });

      let stderrBuffer = '';
      child.stderr?.on('data', (data: Buffer) => {
        stderrBuffer += data.toString();
        const lines = stderrBuffer.split('\n');
        stderrBuffer = lines.pop() || '';
        lines.forEach(line => processLine(line));
      });

      child.on('close', async (code) => {
        clearTimeout(timeout);

        if (stdoutBuffer.trim()) processLine(stdoutBuffer);
        if (stderrBuffer.trim()) processLine(stderrBuffer);

        const success = code === 0;

        if (!success) {
          wsService.emitDeploymentComplete(projectId, false, code || 0, step);

          const project = await CREProject.findById(projectId);
          if (project) {
            project.status = 'error';
            project.deploymentStatus = 'deploy-failed';
            project.errorMessage = `Deploy command failed with exit code ${code}`;
            project.deploymentLogs = logs.slice(-500);
            await project.save();
          }
          reject(new Error(`Command failed with exit code ${code}`));
        } else {
          resolve();
        }
      });

      child.on('error', async (error) => {
        clearTimeout(timeout);
        const errorMsg = `Failed to start command: ${error.message}`;
        logs.push(errorMsg);
        wsService.emitDeploymentLog(projectId, errorMsg);
        wsService.emitDeploymentComplete(projectId, false, -1, step);

        const project = await CREProject.findById(projectId);
        if (project) {
          project.status = 'error';
          project.deploymentStatus = 'deploy-failed';
          project.deploymentLogs = logs.slice(-500);
          await project.save();
        }
        reject(error);
      });
    });
  }

  /**
   * Load .env file as key-value pairs
   */
  private loadEnvFile(projectDir: string): Record<string, string> {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(projectDir, '.env');
      if (!fs.existsSync(envPath)) return {};

      const content = fs.readFileSync(envPath, 'utf-8');
      const env: Record<string, string> = {};
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (key && value) env[key] = value;
      }
      return env;
    } catch {
      return {};
    }
  }
}

export const creDeployer = new CREDeployerService();
