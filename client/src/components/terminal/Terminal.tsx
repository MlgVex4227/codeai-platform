import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Terminal as TerminalIcon } from "lucide-react";

interface TerminalProps {
  output: string;
}

export default function Terminal({ output }: TerminalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'problems'>('terminal');

  const clearOutput = () => {
    // This would need to be passed from parent component
    console.log('Clear output');
  };

  return (
    <div className="h-48 panel-bg border-t border-color flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-color">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`pb-1 text-sm border-b-2 transition-colors ${
              activeTab === 'terminal' 
                ? 'text-accent-blue border-accent-blue' 
                : 'text-secondary border-transparent hover:text-primary'
            }`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setActiveTab('output')}
            className={`pb-1 text-sm border-b-2 transition-colors ${
              activeTab === 'output' 
                ? 'text-accent-blue border-accent-blue' 
                : 'text-secondary border-transparent hover:text-primary'
            }`}
          >
            Output
          </button>
          <button 
            onClick={() => setActiveTab('problems')}
            className={`pb-1 text-sm border-b-2 transition-colors ${
              activeTab === 'problems' 
                ? 'text-accent-blue border-accent-blue' 
                : 'text-secondary border-transparent hover:text-primary'
            }`}
          >
            Problems
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearOutput}
            className="text-secondary hover:text-primary p-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-secondary hover:text-primary p-1"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-editor-bg">
        {activeTab === 'terminal' && (
          <div className="space-y-1">
            {output ? (
              <div className="whitespace-pre-wrap text-primary">
                {output}
              </div>
            ) : (
              <div className="text-secondary">
                <div className="flex items-center space-x-2">
                  <TerminalIcon className="h-4 w-4" />
                  <span>Ready to execute code...</span>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-success">$</span>
              <span className="text-primary bg-editor-bg px-1 border border-color rounded opacity-75">
                |
              </span>
            </div>
          </div>
        )}
        
        {activeTab === 'output' && (
          <div className="text-secondary">
            <p>Output will appear here after running code...</p>
          </div>
        )}
        
        {activeTab === 'problems' && (
          <div className="text-secondary">
            <p>No problems detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
