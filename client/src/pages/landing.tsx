import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Sparkles, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen editor-bg">
      {/* Header */}
      <header className="panel-bg border-b border-color px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 accent-blue" />
            <h1 className="text-2xl font-bold text-primary">CodeAI</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-accent-blue hover:bg-blue-600 text-white"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-6 w-6 text-warning" />
            <span className="text-sm font-medium text-secondary uppercase tracking-wide">
              AI-Powered Coding Platform
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-primary leading-tight">
            Code smarter with
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI assistance
            </span>
          </h1>
          
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Write, run, and debug Python code with intelligent AI suggestions. 
            Get instant feedback, code reviews, and automated improvements.
          </p>
          
          <div className="flex items-center justify-center space-x-4 pt-6">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-accent-blue hover:bg-blue-600 text-white px-8 py-3 text-lg"
            >
              Start Coding Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-color hover:bg-panel-bg px-8 py-3 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Everything you need to code efficiently
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            From AI-powered code generation to secure execution environments, 
            we've got all the tools you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="panel-bg border-color">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent-blue/10 rounded-lg">
                  <Sparkles className="h-6 w-6 accent-blue" />
                </div>
                <CardTitle className="text-primary">AI Code Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-secondary">
                Generate code from natural language descriptions. Get intelligent 
                suggestions and automated code improvements powered by advanced AI.
              </p>
            </CardContent>
          </Card>

          <Card className="panel-bg border-color">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-primary">Instant Execution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-secondary">
                Run your Python code instantly in a secure, sandboxed environment. 
                See results immediately without any setup or configuration.
              </p>
            </CardContent>
          </Card>

          <Card className="panel-bg border-color">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <CardTitle className="text-primary">Secure Environment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-secondary">
                Your code runs in a secure, isolated environment. Advanced security 
                measures ensure your data and code remain safe and private.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="panel-bg border-t border-color">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Ready to revolutionize your coding?
          </h2>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already coding smarter with AI assistance.
            Start your free session today.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-accent-blue hover:bg-blue-600 text-white px-8 py-3 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="sidebar-bg border-t border-color">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code2 className="h-6 w-6 accent-blue" />
            <span className="text-lg font-semibold text-primary">CodeAI</span>
          </div>
          <p className="text-secondary">
            © 2024 CodeAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
