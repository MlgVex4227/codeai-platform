import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./services/openai";
import { codeExecutionService } from "./services/codeExecution";
import { insertProjectSchema, insertFileSchema, insertAiConversationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectWithFiles(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId,
      });

      const project = await storage.createProject(projectData);
      
      // Create a default main file
      await storage.createFile({
        projectId: project.id,
        name: projectData.language === 'python' ? 'main.py' : 'main.js',
        content: projectData.language === 'python' 
          ? '# Welcome to your new Python project!\nprint("Hello, World!")'
          : '// Welcome to your new JavaScript project!\nconsole.log("Hello, World!");',
        language: projectData.language,
        isMain: true,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updateData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, updateData);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Project not found" });
      }

      await storage.deleteProject(projectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // File routes
  app.get('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check if user owns the project containing this file
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileData = insertFileSchema.parse(req.body);
      
      // Check if user owns the project
      const project = await storage.getProject(fileData.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.put('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check if user owns the project containing this file
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = insertFileSchema.partial().parse(req.body);
      const updatedFile = await storage.updateFile(fileId, updateData);
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Check if user owns the project containing this file
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteFile(fileId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Code execution routes
  app.post('/api/execute', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code, language, projectId } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      // Validate code first
      const validation = await codeExecutionService.validateCode(code, language);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: "Code validation failed", 
          errors: validation.errors 
        });
      }

      // Execute code
      const result = await codeExecutionService.executeCode({ code, language, projectId });
      
      // Store execution result
      await storage.createExecutionResult({
        userId,
        projectId: projectId || null,
        code,
        language,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
      });

      res.json(result);
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ message: "Failed to execute code" });
    }
  });

  app.post('/api/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      const validation = await codeExecutionService.validateCode(code, language);
      res.json(validation);
    } catch (error) {
      console.error("Error validating code:", error);
      res.status(500).json({ message: "Failed to validate code" });
    }
  });

  // AI routes
  app.post('/api/ai/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, language, context, existingCode } = req.body;

      if (!prompt || !language) {
        return res.status(400).json({ message: "Prompt and language are required" });
      }

      const result = await openaiService.generateCode({
        prompt,
        language,
        context,
        existingCode,
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  app.post('/api/ai/review', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      const result = await openaiService.reviewCode({ code, language });
      res.json(result);
    } catch (error) {
      console.error("Error reviewing code:", error);
      res.status(500).json({ message: "Failed to review code" });
    }
  });

  app.post('/api/ai/explain', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      const result = await openaiService.explainCode(code, language);
      res.json({ explanation: result });
    } catch (error) {
      console.error("Error explaining code:", error);
      res.status(500).json({ message: "Failed to explain code" });
    }
  });

  app.post('/api/ai/tests', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required" });
      }

      const result = await openaiService.generateTests(code, language);
      res.json({ tests: result });
    } catch (error) {
      console.error("Error generating tests:", error);
      res.status(500).json({ message: "Failed to generate tests" });
    }
  });

  // AI conversation routes
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = insertAiConversationSchema.parse({
        ...req.body,
        userId,
      });

      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      const result = await openaiService.chatWithAI(messages, context);
      res.json({ response: result });
    } catch (error) {
      console.error("Error chatting with AI:", error);
      res.status(500).json({ message: "Failed to chat with AI" });
    }
  });

  // Execution history route
  app.get('/api/execution-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const results = await storage.getUserExecutionResults(userId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching execution history:", error);
      res.status(500).json({ message: "Failed to fetch execution history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
