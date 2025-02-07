import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";
import {
  DirectoryStructure,
  FileContent,
  FileExplorerProps,
  RenderItemProps,
} from "@/types/types";
import { useState } from "react";

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileStructure,
}) => {
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
