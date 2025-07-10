import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Settings, Lightbulb, Shield, FileText, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { File, ProjectWithFiles, AIMessage } from "@shared/schema";

interface AIAssistantProps {
  currentFile: File | null;
  currentProject: ProjectWithFiles | null;
}

export default function AIAssistant({ currentFile, currentProject }: AIAssistantProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["/api/ai/conversations"],
    retry: false,
  });

  const chatMutation = useMutation({
    mutationFn: async ({ messages, context }: { messages: AIMessage[]; context?: string }) => {
      const response = await apiRequest("POST", "/api/ai/chat", { messages, context });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: AIMessage = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/generate", {
        prompt,
        language: currentFile?.language || "python",
        context: currentProject?.description,
        existingCode: currentFile?.content,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const message: AIMessage = {
        role: "assistant",
        content: `Generated code:\n\n\`\`\`${currentFile?.language || "python"}\n${data.code}\n\`\`\`\n\n${data.explanation}`,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, message]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate code",
        variant: "destructive",
      });
    },
  });

  const explainCodeMutation = useMutation({
    mutationFn: async () => {
      if (!currentFile?.content) throw new Error("No code to explain");
      
      const response = await apiRequest("POST", "/api/ai/explain", {
        code: currentFile.content,
        language: currentFile.language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const message: AIMessage = {
        role: "assistant",
        content: `Code explanation:\n\n${data.explanation}`,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, message]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to explain code",
        variant: "destructive",
      });
    },
  });

  const generateTestsMutation = useMutation({
    mutationFn: async () => {
      if (!currentFile?.content) throw new Error("No code to generate tests for");
      
      const response = await apiRequest("POST", "/api/ai/tests", {
        code: currentFile.content,
        language: currentFile.language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const message: AIMessage = {
        role: "assistant",
        content: `Generated tests:\n\n\`\`\`${currentFile?.language || "python"}\n${data.tests}\n\`\`\``,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, message]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate tests",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    
    const context = currentProject 
      ? `Current project: ${currentProject.name} (${currentProject.description}). Current file: ${currentFile?.name || "none"}`
      : undefined;

    chatMutation.mutate({ 
      messages: [...chatMessages, userMessage], 
      context 
    });
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "generate":
        const prompt = window.prompt("What would you like me to generate?");
        if (prompt) {
          generateCodeMutation.mutate(prompt);
        }
        break;
      case "explain":
        explainCodeMutation.mutate();
        break;
      case "tests":
        generateTestsMutation.mutate();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-color">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-secondary hover:text-primary p-1"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to generate or modify code..."
            className="pr-10 bg-editor-bg border-color focus:border-accent-blue"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || chatMutation.isPending}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 accent-blue hover:text-blue-400"
            variant="ghost"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-secondary py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with AI</p>
            <p className="text-sm mt-2">Ask questions or request code generation</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-accent-blue text-white' 
                  : 'bg-panel-bg text-primary'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-secondary'}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {(chatMutation.isPending || generateCodeMutation.isPending || explainCodeMutation.isPending || generateTestsMutation.isPending) && (
          <div className="flex justify-start">
            <div className="bg-panel-bg rounded-lg p-3">
              <div className="flex items-center space-x-2 text-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      <div className="border-t border-color p-4 space-y-4">
        <div className="bg-panel-bg rounded p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-4 w-4 accent-blue" />
            <span className="text-sm font-medium">AI Suggestion</span>
          </div>
          <p className="text-sm text-secondary mb-3">
            I can help you improve your code with these actions:
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => handleQuickAction("generate")}
              disabled={generateCodeMutation.isPending}
              className="w-full text-left justify-start bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue"
              variant="ghost"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate code
            </Button>
            
            <Button 
              onClick={() => handleQuickAction("explain")}
              disabled={!currentFile?.content || explainCodeMutation.isPending}
              className="w-full text-left justify-start bg-warning/10 hover:bg-warning/20 text-warning"
              variant="ghost"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Explain code
            </Button>
            
            <Button 
              onClick={() => handleQuickAction("tests")}
              disabled={!currentFile?.content || generateTestsMutation.isPending}
              className="w-full text-left justify-start bg-success/10 hover:bg-success/20 text-success"
              variant="ghost"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate tests
            </Button>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="border-t border-color p-4">
        <h3 className="text-sm font-medium mb-3">Recent Conversations</h3>
        <div className="space-y-2">
          {conversations && conversations.length > 0 ? (
            conversations.slice(0, 3).map((conversation: any) => (
              <div key={conversation.id} className="flex items-center justify-between px-2 py-1 hover:bg-panel-bg rounded cursor-pointer">
                <span className="text-sm truncate">{conversation.title}</span>
                <span className="text-xs text-secondary">
                  {formatTime(new Date(conversation.createdAt).getTime())}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-secondary">No conversations yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
