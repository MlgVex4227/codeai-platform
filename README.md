# CodeAI - Online Coding Platform

A comprehensive AI-powered online coding platform that combines code generation, editing, and execution with project management capabilities.

## Features

- 🤖 **AI-Powered Code Generation** - Generate code using OpenAI GPT-4o
- 💻 **Multi-Language Support** - Execute Python, JavaScript, and Node.js code
- 📝 **Monaco Editor** - Professional code editor with syntax highlighting
- 🗂️ **Project Management** - Create, organize, and manage coding projects
- 💬 **AI Assistant** - Chat with AI for code help and explanations
- 🔐 **Secure Authentication** - OAuth integration with session management
- 📊 **Persistent Storage** - PostgreSQL database for all your data

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o API
- **Authentication**: OAuth with Passport.js
- **Editor**: Monaco Editor (VS Code editor)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codeai-platform.git
cd codeai-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5000` to see your application.

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/codeai
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_random_string
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc
```

## Deployment

This application can be deployed on various platforms:

- **Railway** (Recommended for beginners)
- **Vercel + Neon**
- **Render**
- **DigitalOcean**
- **AWS/GCP/Azure**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Docker Support

Run with Docker:

```bash
docker-compose up -d
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User profiles and authentication
- `projects` - Coding projects
- `files` - Project files and code
- `ai_conversations` - AI chat history
- `execution_results` - Code execution history

## API Endpoints

- `GET /api/auth/user` - Get current user
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project with files
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/execute` - Execute code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help