import { Tree } from '../data/tree';

export interface Workspace {
  id: string;
  title: string; // Changed from name to title
  description?: string;
  createdAt: number;
  updatedAt: number;
  treeIds: string[]; // References to tree IDs
}

export interface WorkspaceWithTrees extends Workspace {
  trees: Tree[];
}

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type StorageType = 'localStorage' | 'sqlite';