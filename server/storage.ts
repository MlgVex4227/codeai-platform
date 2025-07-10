import {
  users,
  projects,
  files,
  aiConversations,
  executionResults,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type File,
  type InsertFile,
  type AIConversation,
  type InsertAIConversation,
  type ExecutionResult,
  type InsertExecutionResult,
  type ProjectWithFiles,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectWithFiles(id: number): Promise<ProjectWithFiles | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // File operations
  getProjectFiles(projectId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File>;
  deleteFile(id: number): Promise<void>;
  
  // AI conversation operations
  getUserConversations(userId: string): Promise<AIConversation[]>;
  getConversation(id: number): Promise<AIConversation | undefined>;
  createConversation(conversation: InsertAIConversation): Promise<AIConversation>;
  updateConversation(id: number, conversation: Partial<InsertAIConversation>): Promise<AIConversation>;
  deleteConversation(id: number): Promise<void>;
  
  // Execution result operations
  getUserExecutionResults(userId: string, limit?: number): Promise<ExecutionResult[]>;
  createExecutionResult(result: InsertExecutionResult): Promise<ExecutionResult>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private files: Map<number, File> = new Map();
  private aiConversations: Map<number, AIConversation> = new Map();
  private executionResults: Map<number, ExecutionResult> = new Map();
  
  private projectIdCounter = 1;
  private fileIdCounter = 1;
  private conversationIdCounter = 1;
  private executionIdCounter = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectWithFiles(id: number): Promise<ProjectWithFiles | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const files = Array.from(this.files.values())
      .filter(file => file.projectId === id)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { ...project, files };
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = {
      ...projectData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project> {
    const existingProject = this.projects.get(id);
    if (!existingProject) throw new Error("Project not found");

    const updated: Project = {
      ...existingProject,
      ...projectData,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
    // Delete associated files
    Array.from(this.files.entries())
      .filter(([_, file]) => file.projectId === id)
      .forEach(([fileId, _]) => this.files.delete(fileId));
  }

  // File operations
  async getProjectFiles(projectId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const file: File = {
      ...fileData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, fileData: Partial<InsertFile>): Promise<File> {
    const existingFile = this.files.get(id);
    if (!existingFile) throw new Error("File not found");

    const updated: File = {
      ...existingFile,
      ...fileData,
      updatedAt: new Date(),
    };
    this.files.set(id, updated);
    return updated;
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  // AI conversation operations
  async getUserConversations(userId: string): Promise<AIConversation[]> {
    return Array.from(this.aiConversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async getConversation(id: number): Promise<AIConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async createConversation(conversationData: InsertAIConversation): Promise<AIConversation> {
    const id = this.conversationIdCounter++;
    const conversation: AIConversation = {
      ...conversationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.aiConversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, conversationData: Partial<InsertAIConversation>): Promise<AIConversation> {
    const existingConversation = this.aiConversations.get(id);
    if (!existingConversation) throw new Error("Conversation not found");

    const updated: AIConversation = {
      ...existingConversation,
      ...conversationData,
      updatedAt: new Date(),
    };
    this.aiConversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: number): Promise<void> {
    this.aiConversations.delete(id);
  }

  // Execution result operations
  async getUserExecutionResults(userId: string, limit = 50): Promise<ExecutionResult[]> {
    return Array.from(this.executionResults.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async createExecutionResult(resultData: InsertExecutionResult): Promise<ExecutionResult> {
    const id = this.executionIdCounter++;
    const result: ExecutionResult = {
      ...resultData,
      id,
      createdAt: new Date(),
    };
    this.executionResults.set(id, result);
    return result;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectWithFiles(id: number): Promise<ProjectWithFiles | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return undefined;

    const projectFiles = await db
      .select()
      .from(files)
      .where(eq(files.projectId, id))
      .orderBy(files.name);

    return { ...project, files: projectFiles };
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    // Delete associated files first
    await db.delete(files).where(eq(files.projectId, id));
    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));
  }

  // File operations
  async getProjectFiles(projectId: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.projectId, projectId))
      .orderBy(files.name);
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(fileData)
      .returning();
    return file;
  }

  async updateFile(id: number, fileData: Partial<InsertFile>): Promise<File> {
    const [file] = await db
      .update(files)
      .set({ ...fileData, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // AI conversation operations
  async getUserConversations(userId: string): Promise<AIConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt));
  }

  async getConversation(id: number): Promise<AIConversation | undefined> {
    const [conversation] = await db.select().from(aiConversations).where(eq(aiConversations.id, id));
    return conversation || undefined;
  }

  async createConversation(conversationData: InsertAIConversation): Promise<AIConversation> {
    const [conversation] = await db
      .insert(aiConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, conversationData: Partial<InsertAIConversation>): Promise<AIConversation> {
    const [conversation] = await db
      .update(aiConversations)
      .set({ ...conversationData, updatedAt: new Date() })
      .where(eq(aiConversations.id, id))
      .returning();
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(aiConversations).where(eq(aiConversations.id, id));
  }

  // Execution result operations
  async getUserExecutionResults(userId: string, limit = 50): Promise<ExecutionResult[]> {
    return await db
      .select()
      .from(executionResults)
      .where(eq(executionResults.userId, userId))
      .orderBy(desc(executionResults.createdAt))
      .limit(limit);
  }

  async createExecutionResult(resultData: InsertExecutionResult): Promise<ExecutionResult> {
    const [result] = await db
      .insert(executionResults)
      .values(resultData)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
