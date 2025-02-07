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

export interface RenderItemProps {
  item: FileContent | DirectoryStructure;
  path: string;
  level: number;
}
