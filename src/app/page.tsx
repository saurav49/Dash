"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { MoveRightIcon } from "lucide-react";
export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [fileStructure, setFileStructure] = useState<FileStructure | undefined>(
    undefined
  );
  function parseFileStructure(text: string): FileStructure {
    const fileStructure: FileStructure = { root: {} };
    let currentFile: string | null = null;
    let currentContent: string[] = [];
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.endsWith(":")) {
        if (currentFile && currentContent.length > 0) {
          const path = currentFile.split("/");
          let current = fileStructure.root as DirectoryStructure;

          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]] as DirectoryStructure;
          }

          current[path[path.length - 1]] = {
            content: currentContent.join("\n"),
          };
        }
        currentFile = line.slice(0, -1);
        currentContent = [];
      } else if (line.startsWith("```")) {
        continue;
      } else if (currentFile) {
        currentContent.push(line);
      }
    }

    if (currentFile && currentContent.length > 0) {
      const path = currentFile.split("/");
      let current = fileStructure.root as DirectoryStructure;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]] as DirectoryStructure;
      }

      current[path[path.length - 1]] = {
        content: currentContent.join("\n"),
      };
    }
    return fileStructure;
  }

  const createFileStructure = (text: string): void => {
    setFileStructure(
      parseFileStructure(
        text.split(
          "Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you."
        )[1]
      )
    );
  };

  const handleFormSubmit = async () => {
    const r = await getTemplate(prompt);
    if (r.success) {
      createFileStructure(r.data.prompt.file);
      const res = await chatApi({
        design: r.data.prompt.design,
        file: r.data.prompt.file,
        content: r.data.prompt.content,
      });
      console.log(res);
    }
    return r;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, formAction] = useActionState(handleFormSubmit, {
    success: false,
    message: "",
  });
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1 className="text-3xl font-semibold">What do you want to build?</h1>
      <p className="text-sm font-normal mt-2 mb-4 text-center">
        Prompt, run, edit, and deploy full-stack web apps.
      </p>
      <form className="relative">
        <Textarea
          className="w-[500px] min-h-[70px]"
          placeholder="Type your message here."
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          formAction={formAction}
          className="absolute right-0 bottom-1/2 translate-y-1/2 flex items-center justify-center"
        >
          <MoveRightIcon />
        </Button>
      </form>
      {fileStructure && <FileExplorer fileStructure={fileStructure} />}
    </div>
  );
}

// types.ts
export interface FileContent {
  content: string;
}

export interface FileStructure {
  root: DirectoryStructure;
}

export interface DirectoryStructure {
  [key: string]: FileContent | DirectoryStructure;
}

export interface FileExplorerProps {
  fileStructure: FileStructure;
}

// FileExplorer.tsx
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";
import { chatApi, getTemplate } from "@/lib/action";

interface RenderItemProps {
  item: FileContent | DirectoryStructure;
  path: string;
  level: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ fileStructure }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const togglePath = (path: string): void => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const isFileContent = (
    item: FileContent | DirectoryStructure
  ): item is FileContent => {
    return "content" in item;
  };

  const RenderItem: React.FC<RenderItemProps> = ({ item, path, level }) => {
    const isExpanded = expandedPaths.has(path);
    const indent = level * 16;

    if (isFileContent(item)) {
      return (
        <div className="file-item">
          <div
            className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer"
            onClick={() => togglePath(path)}
            style={{ marginLeft: `${indent}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{path.split("/").pop()}</span>
          </div>
          {isExpanded && (
            <div
              className="mt-2 mb-2 ml-6 p-4 bg-gray-50 rounded border border-gray-200"
              style={{ marginLeft: `${indent + 24}px` }}
            >
              <pre className="text-sm font-mono overflow-x-auto">
                {item.content}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="folder-item">
        <div
          className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer"
          onClick={() => togglePath(path)}
          style={{ marginLeft: `${indent}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">
            {path ? path.split("/").pop() : "Project Files"}
          </span>
        </div>
        {isExpanded && (
          <div className="mt-1">
            {Object.entries(item).map(([name, child]) => {
              const childPath = path ? `${path}/${name}` : name;
              return (
                <RenderItem
                  key={childPath}
                  item={child}
                  path={childPath}
                  level={level + 1}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer border rounded-lg shadow-sm bg-white p-4 max-w-4xl mx-auto">
      <RenderItem item={fileStructure.root} path="" level={0} />
    </div>
  );
};
