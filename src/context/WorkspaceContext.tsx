import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Workspace, WorkspaceState } from '../types/workspace';
import { Tree } from '../data/tree';
import { storageService } from '../services/storageService';

// Define context type
interface WorkspaceContextType extends WorkspaceState {
  // Workspace actions
  createWorkspace: (title: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (workspace: Workspace) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  setActiveWorkspace: (id: string) => Promise<void>;
  
  // Tree actions
  getTreesForActiveWorkspace: () => Promise<Tree[]>;
  createTree: (tree: Tree) => Promise<Tree>;
  updateTree: (tree: Tree) => Promise<Tree>;
  deleteTree: (treeId: number | string) => Promise<void>;
}

// Create context with default values
const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
  createWorkspace: async () => ({ id: '', title: '', createdAt: 0, updatedAt: 0, treeIds: [] }),
  updateWorkspace: async () => ({ id: '', title: '', createdAt: 0, updatedAt: 0, treeIds: [] }),
  deleteWorkspace: async () => {},
  setActiveWorkspace: async () => {},
  getTreesForActiveWorkspace: async () => [],
  createTree: async () => new Tree(),
  updateTree: async () => new Tree(),
  deleteTree: async () => {}
});

// Provider component
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkspaceState>({
    workspaces: [],
    activeWorkspaceId: null,
    isLoading: true,
    error: null
  });

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load workspaces from storage
  const loadWorkspaces = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const workspaces = await storageService.getWorkspaces();
      const activeId = await storageService.getActiveWorkspaceId();
      
      setState({
        workspaces,
        activeWorkspaceId: activeId,
        isLoading: false,
        error: null
      });
      
      // Create default workspace if none exists
      if (workspaces.length === 0) {
        createDefaultWorkspace();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error loading workspaces'
      }));
    }
  };

  // Create default workspace
  const createDefaultWorkspace = async () => {
    try {
      const defaultWorkspace = await createWorkspace('Example Workspace', 'Workspaces allow you to create multiple trees to for your organizational needs.');
      await setActiveWorkspace(defaultWorkspace.id);
    } catch (error) {
      console.error('Error creating default workspace:', error);
    }
  };

  // Create a new workspace
  const createWorkspace = async (title: string, description?: string): Promise<Workspace> => {
    const newWorkspace: Workspace = {
      id: uuidv4(),
      title,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      treeIds: []
    };

    try {
      const workspace = await storageService.createWorkspace(newWorkspace);
      
      setState(prev => ({
        ...prev,
        workspaces: [...prev.workspaces, workspace]
      }));
      
      return workspace;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error creating workspace'
      }));
      throw error;
    }
  };

  // Update a workspace
  const updateWorkspace = async (workspace: Workspace): Promise<Workspace> => {
    try {
      const updatedWorkspace = await storageService.updateWorkspace({
        ...workspace,
        updatedAt: Date.now()
      });
      
      setState(prev => ({
        ...prev,
        workspaces: prev.workspaces.map(w => 
          w.id === updatedWorkspace.id ? updatedWorkspace : w
        )
      }));
      
      return updatedWorkspace;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error updating workspace'
      }));
      throw error;
    }
  };

  // Delete a workspace
  const deleteWorkspace = async (id: string): Promise<void> => {
    try {
      await storageService.deleteWorkspace(id);
      
      setState(prev => ({
        ...prev,
        workspaces: prev.workspaces.filter(w => w.id !== id),
        // If active workspace is deleted, set to null or another workspace
        activeWorkspaceId: prev.activeWorkspaceId === id 
          ? (prev.workspaces.find(w => w.id !== id)?.id || null) 
          : prev.activeWorkspaceId
      }));
      
      // Update active workspace in storage if needed
      if (state.activeWorkspaceId === id) {
        const newActiveId = state.workspaces.find(w => w.id !== id)?.id || null;
        await storageService.setActiveWorkspaceId(newActiveId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error deleting workspace'
      }));
      throw error;
    }
  };

  // Set active workspace
  const setActiveWorkspace = async (id: string): Promise<void> => {
    try {
      await storageService.setActiveWorkspaceId(id);
      
      setState(prev => ({
        ...prev,
        activeWorkspaceId: id
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error setting active workspace'
      }));
      throw error;
    }
  };

  // Get trees for active workspace
  const getTreesForActiveWorkspace = async (): Promise<Tree[]> => {
    if (!state.activeWorkspaceId) {
      return [];
    }
    
    try {
      return await storageService.getTreesForWorkspace(state.activeWorkspaceId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error fetching trees'
      }));
      return [];
    }
  };

  // Create a new tree in the active workspace
  const createTree = async (tree: Tree): Promise<Tree> => {
    if (!state.activeWorkspaceId) {
      throw new Error('No active workspace selected');
    }
    
    try {
      return await storageService.createTree(state.activeWorkspaceId, tree);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error creating tree'
      }));
      throw error;
    }
  };

  // Update a tree in the active workspace
  const updateTree = async (tree: Tree): Promise<Tree> => {
    if (!state.activeWorkspaceId) {
      throw new Error('No active workspace selected');
    }
    
    try {
      return await storageService.updateTree(state.activeWorkspaceId, tree);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error updating tree'
      }));
      throw error;
    }
  };

  // Delete a tree from the active workspace
  const deleteTree = async (treeId: number | string): Promise<void> => {
    if (!state.activeWorkspaceId) {
      throw new Error('No active workspace selected');
    }
    
    try {
      await storageService.deleteTree(state.activeWorkspaceId, treeId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error deleting tree'
      }));
      throw error;
    }
  };

  // Context value
  const value: WorkspaceContextType = {
    ...state,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setActiveWorkspace,
    getTreesForActiveWorkspace,
    createTree,
    updateTree,
    deleteTree
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the workspace context
export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;