import OpenAI from "openai";
import { AIMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  context?: string;
  existingCode?: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions?: string[];
}

export interface CodeReviewRequest {
  code: string;
  language: string;
}

export interface CodeReviewResponse {
  issues: Array<{
    line: number;
    type: "error" | "warning" | "suggestion";
    message: string;
    fix?: string;
  }>;
  suggestions: string[];
  overallScore: number;
}

export class OpenAIService {
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      const systemPrompt = `You are an expert ${request.language} programmer. Generate clean, well-documented, and efficient code based on the user's requirements. Always include comments explaining complex logic.`;
      
      const userPrompt = `
        Language: ${request.language}
        Request: ${request.prompt}
        ${request.context ? `Context: ${request.context}` : ''}
        ${request.existingCode ? `Existing code to modify/extend:\n${request.existingCode}` : ''}
        
        Please provide a JSON response with:
        1. "code" - the generated code
        2. "explanation" - a brief explanation of what the code does
        3. "suggestions" - optional array of suggestions for improvement or extension
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        code: result.code || '',
        explanation: result.explanation || '',
        suggestions: result.suggestions || []
      };
    } catch (error) {
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    try {
      const systemPrompt = `You are an expert code reviewer. Analyze the provided code for potential issues, bugs, performance problems, and suggest improvements. Focus on code quality, security, and best practices.`;
      
      const userPrompt = `
        Language: ${request.language}
        Code to review:
        ${request.code}
        
        Please provide a JSON response with:
        1. "issues" - array of issues found, each with line number, type (error/warning/suggestion), message, and optional fix
        2. "suggestions" - array of general suggestions for improvement
        3. "overallScore" - overall code quality score from 1-10
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        overallScore: Math.max(1, Math.min(10, result.overallScore || 5))
      };
    } catch (error) {
      throw new Error(`Failed to review code: ${error.message}`);
    }
  }

  async chatWithAI(messages: AIMessage[], context?: string): Promise<string> {
    try {
      const systemPrompt = `You are an AI coding assistant. Help users with programming questions, code generation, debugging, and best practices. Be concise but thorough in your responses.${context ? ` Context: ${context}` : ''}`;
      
      const openaiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new Error(`Failed to chat with AI: ${error.message}`);
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert programmer. Explain the provided ${language} code in a clear, educational manner. Break down complex concepts and explain the logic step by step.`
          },
          {
            role: "user",
            content: `Please explain this ${language} code:\n\n${code}`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async generateTests(code: string, language: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert in ${language} testing. Generate comprehensive unit tests for the provided code using appropriate testing frameworks.`
          },
          {
            role: "user",
            content: `Generate unit tests for this ${language} code:\n\n${code}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      throw new Error(`Failed to generate tests: ${error.message}`);
    }
  }
}

export const openaiService = new OpenAIService();
