import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header/Header";
import ProjectExplorer from "@/components/sidebar/ProjectExplorer";
import RecentProjects from "@/components/sidebar/RecentProjects";
import QuickActions from "@/components/sidebar/QuickActions";
import MonacoEditor from "@/components/editor/MonacoEditor";
import Terminal from "@/components/terminal/Terminal";
import AIAssistant from "@/components/ai/AIAssistant";
import { ProjectWithFiles, File } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentProject, setCurrentProject] = useState<ProjectWithFiles | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleProjectSelect = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      
      const project = await response.json();
      setCurrentProject(project);
      
      // Set the main file as current or the first file
      const mainFile = project.files.find((f: File) => f.isMain) || project.files[0];
      if (mainFile) {
        setCurrentFile(mainFile);
      }
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to load project",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
  };

  const handleFileContentChange = async (content: string) => {
    if (!currentFile) return;
    
    try {
      const response = await fetch(`/api/files/${currentFile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save file");
      }
      
      const updatedFile = await response.json();
      setCurrentFile(updatedFile);
      
      // Update the file in the current project
      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          files: currentProject.files.map(f => 
            f.id === updatedFile.id ? updatedFile : f
          ),
        };
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to save file",
        variant: "destructive",
      });
    }
  };

  const handleRunCode = async () => {
    if (!currentFile) return;
    
    try {
      setTerminalOutput("Running code...\n");
      
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
          projectId: currentProject?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to execute code");
      }
      
      const result = await response.json();
      
      let output = "";
      if (result.output) {
        output += result.output;
      }
      if (result.error) {
        output += `\nError: ${result.error}`;
      }
      output += `\n\nExecution completed in ${result.executionTime}ms`;
      
      setTerminalOutput(output);
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
      
      setTerminalOutput(`Error: ${error.message}`);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    toast({
      title: "Success",
      description: "Project saved successfully",
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-blue"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen editor-bg text-primary font-sans overflow-hidden">
      <Header 
        onRunCode={handleRunCode}
        onSaveProject={handleSaveProject}
        canRun={!!currentFile}
        canSave={!!currentProject}
      />
      
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <div className="w-64 sidebar-bg border-r border-color flex flex-col">
          <ProjectExplorer 
            projects={projects || []}
            currentProject={currentProject}
            onProjectSelect={handleProjectSelect}
            onFileSelect={handleFileSelect}
            currentFile={currentFile}
            isLoading={projectsLoading}
          />
          
          <RecentProjects 
            projects={(projects || []).slice(0, 5)}
            onProjectSelect={handleProjectSelect}
          />
          
          <QuickActions />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="panel-bg border-b border-color px-4 py-2 flex items-center space-x-1">
            {currentFile && (
              <div className="flex items-center space-x-2 px-3 py-1 editor-bg rounded">
                <i className={`fab fa-${currentFile.language === 'python' ? 'python' : 'js-square'} text-yellow-500 text-xs`}></i>
                <span className="text-sm">{currentFile.name}</span>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <MonacoEditor
              file={currentFile}
              onChange={handleFileContentChange}
            />
          </div>

          {/* Terminal */}
          <Terminal output={terminalOutput} />
        </div>

        {/* AI Assistant Panel */}
        <div className="w-80 sidebar-bg border-l border-color">
          <AIAssistant 
            currentFile={currentFile}
            currentProject={currentProject}
          />
        </div>
      </div>
    </div>
  );
}
