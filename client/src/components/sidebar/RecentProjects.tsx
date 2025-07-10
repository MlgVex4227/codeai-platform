import { Clock } from "lucide-react";
import { Project } from "@shared/schema";

interface RecentProjectsProps {
  projects: Project[];
  onProjectSelect: (projectId: number) => void;
}

export default function RecentProjects({ projects, onProjectSelect }: RecentProjectsProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="p-3 border-b border-color">
      <h2 className="text-sm font-medium uppercase tracking-wide text-secondary mb-3">Recent</h2>
      <div className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-sm text-secondary">No recent projects</p>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id}
              className="flex items-center justify-between px-2 py-1 hover:bg-panel-bg rounded cursor-pointer"
              onClick={() => onProjectSelect(project.id)}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-sm">{project.name}</span>
              </div>
              <span className="text-xs text-secondary">
                {formatTimeAgo(new Date(project.updatedAt!))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
