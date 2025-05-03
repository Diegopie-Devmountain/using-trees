import { Workspace, StorageType } from '../types/workspace';
import { Tree } from '../data/tree';

const WORKSPACES_KEY = 'tree-app-workspaces';
const ACTIVE_WORKSPACE_KEY = 'tree-app-active-workspace';
const TREES_KEY_PREFIX = 'tree-app-trees-';

// Class to handle storage operations (localStorage for free tier, SQLite for paid tier)
class StorageService {
  storageType: StorageType;

  constructor(type: StorageType = 'localStorage') {
    this.storageType = type;
  }

  // Workspace operations
  async getWorkspaces(): Promise<Workspace[]> {
    if (this.storageType === 'localStorage') {
      const workspacesJson = localStorage.getItem(WORKSPACES_KEY);
      return workspacesJson ? JSON.parse(workspacesJson) : [];
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    if (this.storageType === 'localStorage') {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    workspaces.push(workspace);
    await this.saveWorkspaces(workspaces);
    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    const workspaces = await this.getWorkspaces();
    return workspaces.find(w => w.id === id) || null;
  }

  async updateWorkspace(updatedWorkspace: Workspace): Promise<Workspace> {
    const workspaces = await this.getWorkspaces();
    const index = workspaces.findIndex(w => w.id === updatedWorkspace.id);
    
    if (index === -1) {
      throw new Error(`Workspace with ID ${updatedWorkspace.id} not found`);
    }
    
    workspaces[index] = updatedWorkspace;
    await this.saveWorkspaces(workspaces);
    return updatedWorkspace;
  }

  async deleteWorkspace(id: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    const filteredWorkspaces = workspaces.filter(w => w.id !== id);
    
    if (filteredWorkspaces.length === workspaces.length) {
      throw new Error(`Workspace with ID ${id} not found`);
    }
    
    await this.saveWorkspaces(filteredWorkspaces);
    
    // Delete associated trees
    await this.deleteTreesForWorkspace(id);
  }

  // Active workspace tracking
  async getActiveWorkspaceId(): Promise<string | null> {
    if (this.storageType === 'localStorage') {
      return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  async setActiveWorkspaceId(id: string | null): Promise<void> {
    if (this.storageType === 'localStorage') {
      if (id) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  // Tree operations
  async getTreesForWorkspace(workspaceId: string): Promise<Tree[]> {
    if (this.storageType === 'localStorage') {
      const treesJson = localStorage.getItem(`${TREES_KEY_PREFIX}${workspaceId}`);
      if (!treesJson) return [];
      
      // Deserialize tree data using Tree's static method
      const treeObjects = JSON.parse(treesJson);
      return treeObjects.map((treeObj: any) => Tree.fromPlainObject(treeObj));
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  async saveTreesForWorkspace(workspaceId: string, trees: Tree[]): Promise<void> {
    if (this.storageType === 'localStorage') {
      // Serialize the trees using Tree's method
      const serializedTrees = trees.map(tree => tree.toPlainObject());
      localStorage.setItem(`${TREES_KEY_PREFIX}${workspaceId}`, JSON.stringify(serializedTrees));
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }

  async createTree(workspaceId: string, tree: Tree): Promise<Tree> {
    const trees = await this.getTreesForWorkspace(workspaceId);
    trees.push(tree);
    await this.saveTreesForWorkspace(workspaceId, trees);
    
    // Update workspace's treeIds
    const workspace = await this.getWorkspace(workspaceId);
    if (workspace) {
      workspace.treeIds.push(tree.id.toString());
      workspace.updatedAt = Date.now();
      await this.updateWorkspace(workspace);
    }
    
    return tree;
  }

  async updateTree(workspaceId: string, updatedTree: Tree): Promise<Tree> {
    const trees = await this.getTreesForWorkspace(workspaceId);
    const index = trees.findIndex(t => t.id === updatedTree.id);
    
    if (index === -1) {
      throw new Error(`Tree with ID ${updatedTree.id} not found in workspace ${workspaceId}`);
    }
    
    trees[index] = updatedTree;
    await this.saveTreesForWorkspace(workspaceId, trees);
    
    // Update workspace's updatedAt timestamp
    const workspace = await this.getWorkspace(workspaceId);
    if (workspace) {
      workspace.updatedAt = Date.now();
      await this.updateWorkspace(workspace);
    }
    
    return updatedTree;
  }

  async deleteTree(workspaceId: string, treeId: number | string): Promise<void> {
    const trees = await this.getTreesForWorkspace(workspaceId);
    const filteredTrees = trees.filter(t => t.id !== treeId);
    
    if (filteredTrees.length === trees.length) {
      throw new Error(`Tree with ID ${treeId} not found in workspace ${workspaceId}`);
    }
    
    await this.saveTreesForWorkspace(workspaceId, filteredTrees);
    
    // Update workspace's treeIds and updatedAt
    const workspace = await this.getWorkspace(workspaceId);
    if (workspace) {
      workspace.treeIds = workspace.treeIds.filter(id => id !== treeId.toString());
      workspace.updatedAt = Date.now();
      await this.updateWorkspace(workspace);
    }
  }

  async deleteTreesForWorkspace(workspaceId: string): Promise<void> {
    if (this.storageType === 'localStorage') {
      localStorage.removeItem(`${TREES_KEY_PREFIX}${workspaceId}`);
    } else {
      // SQLite implementation will go here
      throw new Error('SQLite storage not implemented yet');
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing or custom instances
export default StorageService;