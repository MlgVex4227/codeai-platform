import { useEffect, useRef, useState } from "react";
import { File } from "@shared/schema";

interface MonacoEditorProps {
  file: File | null;
  onChange: (content: string) => void;
}

export default function MonacoEditor({ file, onChange }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    let monaco: any;
    let editorInstance: any;

    const initMonaco = async () => {
      try {
        // Load Monaco Editor from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
        script.onload = () => {
          (window as any).require.config({ 
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
          });
          
          (window as any).require(['vs/editor/editor.main'], () => {
            monaco = (window as any).monaco;
            
            // Set up dark theme
            monaco.editor.defineTheme('codeai-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'type', foreground: '4EC9B0' },
              ],
              colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#CCCCCC',
                'editor.lineHighlightBackground': '#2D2D30',
                'editor.selectionBackground': '#264F78',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#CCCCCC',
              }
            });
            
            if (editorRef.current) {
              editorInstance = monaco.editor.create(editorRef.current, {
                value: file?.content || '# Welcome to CodeAI!\n# Start typing your code here...',
                language: file?.language === 'python' ? 'python' : 'javascript',
                theme: 'codeai-dark',
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
                folding: true,
                lineDecorationsWidth: 20,
                lineNumbersMinChars: 3,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              });
              
              // Listen for content changes
              editorInstance.onDidChangeModelContent(() => {
                const content = editorInstance.getValue();
                onChange(content);
              });
              
              setEditor(editorInstance);
              setIsLoading(false);
            }
          });
        };
        
        if (!(window as any).require) {
          document.head.appendChild(script);
        } else {
          initMonaco();
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
        setIsLoading(false);
      }
    };

    initMonaco();

    return () => {
      if (editorInstance) {
        editorInstance.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editor && file) {
      const model = editor.getModel();
      if (model) {
        model.setValue(file.content || '');
        const language = file.language === 'python' ? 'python' : 'javascript';
        (window as any).monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [editor, file]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mb-2"></div>
          <p className="text-sm text-secondary">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="absolute inset-0 editor-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-secondary mb-2">No file selected</p>
          <p className="text-sm text-secondary">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 editor-bg">
      <div ref={editorRef} className="w-full h-full" />
    </div>
  );
}
