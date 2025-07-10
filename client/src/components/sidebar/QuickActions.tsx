import { Button } from "@/components/ui/button";
import { FileText, FolderPlus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description?: string; language: string }) => {
      await apiRequest("POST", "/api/projects", projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
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
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleNewProject = () => {
    const projectName = prompt("Enter project name:");
    if (projectName) {
      createProjectMutation.mutate({
        name: projectName,
        description: "A new Python project",
        language: "python",
      });
    }
  };

  const handleNewFile = () => {
    toast({
      title: "Info",
      description: "Please select a project first to create a new file",
    });
  };

  const handleImportProject = () => {
    toast({
      title: "Info",
      description: "Import functionality coming soon",
    });
  };

  return (
    <div className="p-3 flex-1">
      <h2 className="text-sm font-medium uppercase tracking-wide text-secondary mb-3">
        Quick Actions
      </h2>
      <div className="space-y-2">
        <Button 
          onClick={handleNewFile}
          className="w-full flex items-center space-x-2 justify-start bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue"
          variant="ghost"
        >
          <FileText className="h-4 w-4" />
          <span>New File</span>
        </Button>
        
        <Button 
          onClick={handleNewProject}
          disabled={createProjectMutation.isPending}
          className="w-full flex items-center space-x-2 justify-start bg-success/10 hover:bg-success/20 text-success"
          variant="ghost"
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
        
        <Button 
          onClick={handleImportProject}
          className="w-full flex items-center space-x-2 justify-start bg-warning/10 hover:bg-warning/20 text-warning"
          variant="ghost"
        >
          <Download className="h-4 w-4" />
          <span>Import Project</span>
        </Button>
      </div>
    </div>
  );
}
