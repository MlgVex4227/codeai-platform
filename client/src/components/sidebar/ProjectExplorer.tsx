import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Folder, FolderOpen, File as FileIcon } from "lucide-react";
import { Project, ProjectWithFiles, File } from "@shared/schema";

interface ProjectExplorerProps {
  projects: Project[];
  currentProject: ProjectWithFiles | null;
  onProjectSelect: (projectId: number) => void;
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  isLoading: boolean;
}

export default function ProjectExplorer({
  projects,
  currentProject,
  onProjectSelect,
  onFileSelect,
  currentFile,
  isLoading,
}: ProjectExplorerProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      onProjectSelect(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getFileIcon = (language: string) => {
    switch (language) {
      case 'python':
        return 'fab fa-python text-yellow-500';
      case 'javascript':
      case 'js':
        return 'fab fa-js-square text-yellow-500';
      default:
        return 'fas fa-file text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 border-b border-color">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">Explorer</h2>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-panel-bg rounded"></div>
          <div className="h-4 bg-panel-bg rounded w-3/4"></div>
          <div className="h-4 bg-panel-bg rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-color">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">Explorer</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-secondary hover:text-primary p-1"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {projects.length === 0 ? (
          <p className="text-sm text-secondary">No projects yet</p>
        ) : (
          projects.map((project) => (
            <div key={project.id}>
              <div 
                className="flex items-center space-x-2 px-2 py-1 hover:bg-panel-bg rounded cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                {expandedProjects.has(project.id) ? (
                  <FolderOpen className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Folder className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">{project.name}</span>
              </div>
              
              {expandedProjects.has(project.id) && currentProject?.id === project.id && (
                <div className="ml-4 space-y-1">
                  {currentProject.files.map((file) => (
                    <div 
                      key={file.id}
                      className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer ${
                        currentFile?.id === file.id 
                          ? 'bg-accent-blue/20 text-accent-blue' 
                          : 'hover:bg-panel-bg'
                      }`}
                      onClick={() => onFileSelect(file)}
                    >
                      <i className={`${getFileIcon(file.language)} text-xs`}></i>
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
