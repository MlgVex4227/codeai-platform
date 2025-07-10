import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Code2, Play, Save, User } from "lucide-react";

interface HeaderProps {
  onRunCode: () => void;
  onSaveProject: () => void;
  canRun: boolean;
  canSave: boolean;
}

export default function Header({ onRunCode, onSaveProject, canRun, canSave }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="panel-bg border-b border-color px-4 py-2 flex items-center justify-between h-[60px]">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Code2 className="accent-blue text-xl" />
          <h1 className="text-lg font-semibold">CodeAI</h1>
        </div>
        <nav className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm hover:bg-sidebar-bg"
          >
            File
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm hover:bg-sidebar-bg"
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm hover:bg-sidebar-bg"
          >
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm hover:bg-sidebar-bg"
          >
            Run
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onRunCode}
          disabled={!canRun}
          className="bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium"
          size="sm"
        >
          <Play className="w-4 h-4 mr-1" />
          Run Code
        </Button>
        
        <Button 
          onClick={onSaveProject}
          disabled={!canSave}
          className="bg-success hover:bg-green-600 text-white text-sm font-medium"
          size="sm"
        >
          <Save className="w-4 h-4 mr-1" />
          Save Project
        </Button>
        
        <div className="flex items-center space-x-2">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="text-sm hover:bg-sidebar-bg"
          >
            <User className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
