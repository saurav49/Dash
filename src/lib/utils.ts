import { DirectoryStructure, FileStructure } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseFileStructure(text: string): FileStructure {
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

export const createFileStructure = (
  text: string,
  setFileStructure: React.Dispatch<
    React.SetStateAction<FileStructure | undefined>
  >
): void => {
  setFileStructure(
    parseFileStructure(
      text.split(
        "Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you."
      )[1]
    )
  );
};
