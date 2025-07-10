import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(__dirname));

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'CodeAI Platform is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/*', (req, res) => {
    res.json({ 
        message: 'API ready - database setup required',
        endpoint: req.path
    });
});

app.get('*', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeAI Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; text-align: center; }
        .container { max-width: 800px; margin: 0 auto; }
        .logo { font-size: 3rem; margin-bottom: 20px; }
        .status { background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success { border-left: 4px solid #00ff00; }
        .info { border-left: 4px solid #0066ff; }
        code { background: #000; padding: 10px; border-radius: 4px; color: #00ff00; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀 CodeAI</div>
        <h1>Platform Successfully Deployed!</h1>
        <div class="status success">
            <h2>✅ Server Running</h2>
            <p>Your CodeAI platform is live on Render</p>
        </div>
        <div class="status info">
            <h3>🔧 Complete Setup</h3>
            <p>Run this command in the Render Shell:</p>
            <code>npm run db:push</code>
        </div>
        <div style="margin-top: 30px;">
            <a href="/health" style="color: #00ff00; text-decoration: none;">Health Check</a> | 
            <a href="/api/auth/user" style="color: #0066ff; text-decoration: none;">API Test</a>
        </div>
    </div>
</body>
</html>`;
    res.send(html);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 CodeAI Platform running on port ${port}`);
    console.log(`Next step: Run 'npm run db:push' in Shell`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));