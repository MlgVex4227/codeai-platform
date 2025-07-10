import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { ExecutionRequest, ExecutionResponse } from '@shared/schema';

export class CodeExecutionService {
  private readonly tempDir = '/tmp/code-execution';
  private readonly timeout = 30000; // 30 seconds timeout

  constructor() {
    this.ensureTempDirectory();
  }

  private async ensureTempDirectory(): Promise<void> {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionResponse> {
    const startTime = Date.now();
    
    switch (request.language.toLowerCase()) {
      case 'python':
        return this.executePython(request.code, startTime);
      case 'javascript':
      case 'js':
        return this.executeJavaScript(request.code, startTime);
      case 'node':
        return this.executeNode(request.code, startTime);
      default:
        throw new Error(`Language ${request.language} is not supported`);
    }
  }

  private async executePython(code: string, startTime: number): Promise<ExecutionResponse> {
    const filename = `${randomUUID()}.py`;
    const filepath = join(this.tempDir, filename);

    try {
      // Write code to temporary file
      await writeFile(filepath, code);

      // Execute Python code
      const result = await this.runCommand('python3', [filepath]);
      
      const executionTime = Date.now() - startTime;
      
      return {
        output: result.stdout,
        error: result.stderr,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        error: error.message,
        executionTime,
      };
    } finally {
      // Clean up temporary file
      try {
        await unlink(filepath);
      } catch (error) {
        console.warn('Failed to cleanup temporary file:', error);
      }
    }
  }

  private async executeJavaScript(code: string, startTime: number): Promise<ExecutionResponse> {
    const filename = `${randomUUID()}.js`;
    const filepath = join(this.tempDir, filename);

    try {
      // Write code to temporary file
      await writeFile(filepath, code);

      // Execute JavaScript code with Node.js
      const result = await this.runCommand('node', [filepath]);
      
      const executionTime = Date.now() - startTime;
      
      return {
        output: result.stdout,
        error: result.stderr,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        error: error.message,
        executionTime,
      };
    } finally {
      // Clean up temporary file
      try {
        await unlink(filepath);
      } catch (error) {
        console.warn('Failed to cleanup temporary file:', error);
      }
    }
  }

  private async executeNode(code: string, startTime: number): Promise<ExecutionResponse> {
    return this.executeJavaScript(code, startTime);
  }

  private async runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PATH: process.env.PATH,
        },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Code execution timed out'));
      }, this.timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async validateCode(code: string, language: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Basic syntax validation
      switch (language.toLowerCase()) {
        case 'python':
          await this.validatePython(code);
          break;
        case 'javascript':
        case 'js':
        case 'node':
          await this.validateJavaScript(code);
          break;
        default:
          errors.push(`Validation not implemented for language: ${language}`);
      }
    } catch (error) {
      errors.push(error.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async validatePython(code: string): Promise<void> {
    const filename = `${randomUUID()}.py`;
    const filepath = join(this.tempDir, filename);

    try {
      await writeFile(filepath, code);
      
      // Use Python's compile function to check syntax
      const result = await this.runCommand('python3', ['-m', 'py_compile', filepath]);
      
      if (result.stderr) {
        throw new Error(result.stderr);
      }
    } finally {
      try {
        await unlink(filepath);
      } catch (error) {
        console.warn('Failed to cleanup validation file:', error);
      }
    }
  }

  private async validateJavaScript(code: string): Promise<void> {
    const filename = `${randomUUID()}.js`;
    const filepath = join(this.tempDir, filename);

    try {
      await writeFile(filepath, code);
      
      // Use Node.js to check syntax
      const result = await this.runCommand('node', ['-c', filepath]);
      
      if (result.stderr) {
        throw new Error(result.stderr);
      }
    } finally {
      try {
        await unlink(filepath);
      } catch (error) {
        console.warn('Failed to cleanup validation file:', error);
      }
    }
  }
}

export const codeExecutionService = new CodeExecutionService();
