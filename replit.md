# CodeAI - Online Coding Platform

## Overview

CodeAI is a comprehensive online coding platform that combines AI-powered code generation with secure multi-language code execution. The application features a modern web-based IDE with project management, AI assistance, and real-time code execution capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

- **Frontend**: React-based SPA with modern UI components
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **Authentication**: Replit OAuth integration with PostgreSQL session storage
- **AI Integration**: OpenAI API for code generation and assistance
- **Code Execution**: Sandboxed environment for secure code running

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Editor**: Monaco Editor integration for code editing
- **Styling**: Tailwind CSS with custom dark theme

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect (Replit OAuth)
- **Session Management**: PostgreSQL-backed sessions
- **API Design**: RESTful endpoints with JSON responses

### Database Schema
- **Users**: Stores user profile information from OAuth
- **Projects**: User-created coding projects with metadata
- **Files**: Individual code files within projects
- **AI Conversations**: Chat history with AI assistant
- **Execution Results**: Code execution output history
- **Sessions**: User session storage for authentication

### AI Integration
- **Provider**: OpenAI GPT models for code generation
- **Features**: Code generation, code review, chat assistance
- **Context Awareness**: Integrates current project and file context
- **Error Handling**: Graceful fallbacks and rate limiting

### Code Execution
- **Sandboxing**: Isolated execution environment for security
- **Multi-language Support**: Python, JavaScript, Node.js
- **Timeout Protection**: 30-second execution limits
- **Output Capture**: stdout, stderr, and execution time tracking

## Data Flow

1. **Authentication Flow**:
   - User redirects to Replit OAuth
   - OAuth callback creates/updates user record
   - Session established with PostgreSQL storage

2. **Project Management Flow**:
   - User creates/loads projects
   - Files are stored in database with content
   - Real-time updates to project structure

3. **AI Assistance Flow**:
   - User sends prompt to AI endpoint
   - Context (current file, project) included in request
   - OpenAI API generates response
   - Conversation history saved to database

4. **Code Execution Flow**:
   - Code written to temporary file
   - Spawned process executes code in sandbox
   - Output captured and returned to client
   - Results stored in execution history

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage
- **OpenAI API**: AI code generation and assistance
- **Replit OAuth**: User authentication

### Third-party Libraries
- **Frontend**: React, Radix UI, TanStack Query, Monaco Editor
- **Backend**: Express, Passport, Drizzle ORM, OpenAI SDK
- **Development**: Vite, TypeScript, Tailwind CSS

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for OAuth
- `ISSUER_URL`: OAuth issuer URL
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: PostgreSQL connection parameters

## Recent Changes

### Database Integration (January 2025)
- ✅ Added PostgreSQL database support with Drizzle ORM
- ✅ Migrated from MemStorage to DatabaseStorage for persistent data
- ✅ Created database schema with proper relations
- ✅ Configured PostgreSQL session storage for authentication
- ✅ All data now persists across application restarts

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with hot reload
- **Database**: Local PostgreSQL or remote connection

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: esbuild bundle for Node.js
- **Database**: Drizzle migrations for schema management

### Environment Setup
- Single command deployment with `npm run build`
- Database migrations with `npm run db:push`
- Environment variables for configuration
- Session storage requires PostgreSQL connection

The architecture prioritizes security through sandboxed code execution, OAuth authentication, and proper session management while providing a modern, responsive user experience for coding and AI assistance.