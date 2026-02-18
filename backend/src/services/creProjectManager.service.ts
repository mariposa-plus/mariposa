import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import CREProject, { ICREProject } from '../models/CREProject';

const execFileAsync = promisify(execFile);

const CRE_PROJECTS_DIR = process.env.CRE_PROJECTS_DIR || path.join(process.cwd(), 'cre-projects');
const BUN_PATH = process.env.BUN_PATH || 'bun';

class CREProjectManagerService {
  /**
   * Create a new CRE project with isolated directory
   */
  async createProject(userId: string, name: string, description?: string): Promise<ICREProject> {
    // Create project in DB first to get the ID
    const project = new CREProject({
      userId,
      name,
      description,
      workspacePath: '', // Will be set after directory creation
      status: 'created',
    });

    const projectDir = path.join(CRE_PROJECTS_DIR, userId, project._id.toString());
    project.workspacePath = projectDir;

    // Create directory structure
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'contracts', 'abi'), { recursive: true });

    // Create project.yaml (CRE CLI target-based format)
    const projectYaml = [
      'staging-settings:',
      '  rpcs:',
      '    - chain-name: ethereum-testnet-sepolia',
      '      url: https://ethereum-sepolia-rpc.publicnode.com',
      'production-settings:',
      '  rpcs:',
      '    - chain-name: ethereum-testnet-sepolia',
      '      url: https://ethereum-sepolia-rpc.publicnode.com',
    ].join('\n');
    fs.writeFileSync(path.join(projectDir, 'project.yaml'), projectYaml);

    // Create .env template
    fs.writeFileSync(path.join(projectDir, '.env'), 'CRE_ETH_PRIVATE_KEY=\n');

    // Create .gitignore
    fs.writeFileSync(path.join(projectDir, '.gitignore'), '.env\nnode_modules/\n*.wasm\ndist/\n');

    // Create secrets.yaml
    fs.writeFileSync(path.join(projectDir, 'secrets.yaml'), 'secretsNames: {}\n');

    await project.save();
    return project;
  }

  /**
   * Write workflow files to a project's workflow subdirectory
   */
  async writeWorkflowFiles(
    projectId: string,
    workflowName: string,
    code: string,
    configJson: Record<string, any> = {}
  ): Promise<{ workflowDir: string; mainPath: string }> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    const wfDir = path.join(project.workspacePath, workflowName);
    fs.mkdirSync(wfDir, { recursive: true });

    // Write main.ts
    const mainPath = path.join(wfDir, 'main.ts');
    fs.writeFileSync(mainPath, code);

    // Write package.json
    const packageJson = {
      name: workflowName,
      version: '1.0.0',
      dependencies: {
        '@chainlink/cre-sdk': '^1.0.7',
        'viem': '^2.0.0',
        'zod': '^3.0.0',
      },
      scripts: {
        postinstall: 'bunx cre-setup',
      },
    };
    fs.writeFileSync(path.join(wfDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Write config files
    fs.writeFileSync(
      path.join(wfDir, 'config.staging.json'),
      JSON.stringify(configJson, null, 2)
    );
    fs.writeFileSync(path.join(wfDir, 'config.production.json'), '{}');

    // Write tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
      },
      include: ['./*.ts'],
    };
    fs.writeFileSync(path.join(wfDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Write workflow.yaml
    const workflowYaml = [
      `workflow-name: ${workflowName}`,
      'workflow-owner: "0x0000000000000000000000000000000000000000"',
      'workflow-artifacts:',
      '  workflow-path: ./main.ts',
      '  config-path: ./config.staging.json',
      'targets:',
      '  staging-settings:',
      '    config-path: ./config.staging.json',
      '  production-settings:',
      '    config-path: ./config.production.json',
    ].join('\n');
    fs.writeFileSync(path.join(wfDir, 'workflow.yaml'), workflowYaml);

    return { workflowDir: wfDir, mainPath };
  }

  /**
   * Initialize bun dependencies in a workflow directory
   */
  async initWorkflowDeps(projectId: string, workflowName: string): Promise<{ stdout: string; stderr: string }> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    const wfDir = path.join(project.workspacePath, workflowName);
    if (!fs.existsSync(path.join(wfDir, 'package.json'))) {
      throw new Error('Workflow directory not initialized. Call writeWorkflowFiles first.');
    }

    try {
      const result = await execFileAsync(BUN_PATH, ['install'], {
        cwd: wfDir,
        timeout: 120000,
      });
      project.status = 'ready';
      await project.save();
      return result;
    } catch (error: any) {
      project.status = 'error';
      project.errorMessage = error.message;
      await project.save();
      throw error;
    }
  }

  /**
   * Read the generated workflow file
   */
  async readWorkflowFile(projectId: string, workflowName: string): Promise<string> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    const mainPath = path.join(project.workspacePath, workflowName, 'main.ts');
    if (!fs.existsSync(mainPath)) {
      throw new Error('Workflow file not found');
    }
    return fs.readFileSync(mainPath, 'utf-8');
  }

  /**
   * Delete a CRE project and its directory
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await CREProject.findOne({ _id: projectId, userId });
    if (!project) throw new Error('CRE project not found');

    // Remove directory
    if (fs.existsSync(project.workspacePath)) {
      fs.rmSync(project.workspacePath, { recursive: true, force: true });
    }

    await CREProject.deleteOne({ _id: projectId });
  }

  /**
   * List all projects for a user
   */
  async listProjects(userId: string): Promise<ICREProject[]> {
    return CREProject.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get a single project
   */
  async getProject(projectId: string, userId: string): Promise<ICREProject | null> {
    return CREProject.findOne({ _id: projectId, userId });
  }

  /**
   * Get the workspace directory path for a project
   */
  async getProjectDir(projectId: string): Promise<string> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');
    return project.workspacePath;
  }

  /**
   * Update project config (project.yaml RPCs)
   */
  async updateProjectConfig(projectId: string, rpcs: Record<string, { http: string[]; ws: string[] }>): Promise<void> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    // CRE CLI target-based format
    const targets = ['staging-settings', 'production-settings'];
    let yaml = '';
    for (const target of targets) {
      yaml += `${target}:\n`;
      yaml += '  rpcs:\n';
      for (const [chain, urls] of Object.entries(rpcs)) {
        for (const url of urls.http) {
          yaml += `    - chain-name: ${chain}\n`;
          yaml += `      url: ${url}\n`;
        }
      }
    }
    fs.writeFileSync(path.join(project.workspacePath, 'project.yaml'), yaml);
  }

  /**
   * Update project .env secrets
   */
  async updateSecrets(projectId: string, secrets: Record<string, string>): Promise<void> {
    const project = await CREProject.findById(projectId);
    if (!project) throw new Error('CRE project not found');

    const envContent = Object.entries(secrets)
      .map(([key, val]) => `${key}=${val}`)
      .join('\n') + '\n';
    fs.writeFileSync(path.join(project.workspacePath, '.env'), envContent);
  }
}

export const creProjectManager = new CREProjectManagerService();
