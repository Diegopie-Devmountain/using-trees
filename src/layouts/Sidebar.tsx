import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction, ChangeEvent } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { storageService } from "../services/storageService";
import { DataModal } from "./Modals";

interface SidebarProps {
  initialExpanded?: boolean;
  initialColor?: string;
  onToggle: Dispatch<SetStateAction<boolean>>;
  hamburgerRef: RefObject<HTMLButtonElement>;
}

export default function Sidebar({
  initialExpanded = true,
  initialColor = 'bg-green-50',
  onToggle,
  hamburgerRef
}: SidebarProps) {
  // Local state
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const [sidebarColor, setSidebarColor] = useState(initialColor);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Workspace context
  const { 
    workspaces, 
    activeWorkspaceId, 
    createWorkspace, 
    setActiveWorkspace 
  } = useWorkspace();

  // Update expanded state when initialExpanded prop changes
  useEffect(() => {
    setExpanded(initialExpanded);

    // When sidebar expands, focus the first button
    if (initialExpanded && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [initialExpanded]);

  // Handle Escape key to close sidebar and return focus to hamburger button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && hamburgerRef && hamburgerRef.current) {
      onToggle(false);
      hamburgerRef.current.focus();
    }
  };

  // Handle creating a new workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceTitle.trim()) return;
    
    try {
      const workspace = await createWorkspace(newWorkspaceTitle);
      await setActiveWorkspace(workspace.id);
      setNewWorkspaceTitle('');
      setIsCreatingWorkspace(false);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  // Export all workspace and tree data as JSON
  const handleExportData = async () => {
    try {
      // Gather all data
      const workspacesData = await storageService.getWorkspaces();
      const activeWorkspaceId = await storageService.getActiveWorkspaceId();
      
      // Get trees for each workspace
      const treesData: Record<string, any> = {};
      for (const workspace of workspacesData) {
        const trees = await storageService.getTreesForWorkspace(workspace.id);
        treesData[workspace.id] = trees;
      }
      
      // Create the export object
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        workspaces: workspacesData,
        activeWorkspaceId,
        trees: treesData
      };
      
      // Convert to JSON and create download
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `tree-app-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setImportError('Failed to export data. Please try again.');
    }
  };
  
  // Handle file selection for import
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedData = JSON.parse(jsonString);
        
        // Validate imported data structure
        if (!importedData.workspaces || !Array.isArray(importedData.workspaces)) {
          setImportError('Invalid data format: Missing workspaces array');
          return;
        }
        
        // Import workspaces
        await storageService.saveWorkspaces(importedData.workspaces);
        
        // Import active workspace ID if present
        if (importedData.activeWorkspaceId) {
          await storageService.setActiveWorkspaceId(importedData.activeWorkspaceId);
        }
        
        // Import trees for each workspace
        if (importedData.trees) {
          for (const workspaceId in importedData.trees) {
            const trees = importedData.trees[workspaceId];
            if (Array.isArray(trees)) {
              await storageService.saveTreesForWorkspace(workspaceId, trees);
            }
          }
        }
        
        // Refresh the page to reflect the imported data
        window.location.reload();
      } catch (error) {
        console.error('Error importing data:', error);
        setImportError('Failed to import data. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  };

  return (
    <nav
      id="sidebar-navigation"
      className={`${sidebarColor} flex flex-col items-center transition-all duration-300 ease-in-out ${expanded ? 'w-56' : 'w-16'
        }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1} // Make the nav element focusable but not in the natural tab order
      role="navigation"
      aria-label="Workspace"
    >
      <div className="mt-4 flex flex-col gap-4 items-center w-full">
        {/* Add new workspace button */}
        <div className="flex w-full px-3 items-center">
          <button
            ref={firstButtonRef}
            className="flex items-center justify-center"
            aria-label="Create new workspace"
            onClick={() => {
              if (!expanded) setExpanded(true);
              setIsCreatingWorkspace(true)
            }}
          >
            <div className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 flex items-center justify-center text-xl focus:outline-none focus:ring-2 focus:ring-green-600">
              +
            </div>
            <span className={`ml-3 text-gray-700 flex-grow text-sm text-nowrap ${!expanded ? "hidden" : ""}`}>
              New workspace
            </span>
          </button>
        </div>

        {/* Data management button */}
        <div className="flex w-full px-3 items-center">
          <button
            className="flex items-center justify-center"
            aria-label="Manage data"
            onClick={() => {
              if (!expanded) setExpanded(true);
              setIsDataModalOpen(true);
              setImportError(null);
            }}
          >
            <div className="bg-blue-300 hover:bg-blue-400 rounded-full w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className={`ml-3 text-gray-700 flex-grow text-sm text-nowrap ${!expanded ? "hidden" : ""}`}>
              Manage data
            </span>
          </button>
        </div>

        {/* New workspace form */}
        {isCreatingWorkspace && expanded && (
          <div className="w-full px-3">
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-2">
              <input
                type="text"
                value={newWorkspaceTitle}
                onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                placeholder="Workspace title"
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => {
                    setIsCreatingWorkspace(false);
                    setNewWorkspaceTitle('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="border-t border-gray-200 w-4/5 my-3"></div>

        {/* Workspace list */}
        {workspaces.length > 0 ? (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`flex items-center w-full px-3 ${expanded ? 'justify-start' : 'justify-center'}`}
            >
              <button 
                className={`flex items-center w-full ${workspace.id === activeWorkspaceId ? 'bg-green-100 rounded-md' : ''}`}
                aria-label={`Switch to ${workspace.title || 'Untitled'} workspace`}
                onClick={() => setActiveWorkspace(workspace.id)}
              >
                <div
                  className={`bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 focus:outline-none focus:ring-2 focus:ring-green-600 flex items-center justify-center flex-shrink-0 
                  ${workspace.id === activeWorkspaceId ? 'ring-2 ring-green-600' : ''}`}
                >
                  {/* Add null check for title */}
                  {(workspace.title || 'U').charAt(0).toUpperCase()}
                </div>

                <span className={`ml-3 text-gray-700 truncate ${expanded ? '' : 'hidden'}`}>
                  {workspace.title || 'Untitled'}
                </span>
              </button>
            </div>
          ))
        ) : (
          <div className="px-3 text-sm text-gray-500">No workspaces</div>
        )}
      </div>
    
      {/* Data Management Modal */}
      {isDataModalOpen && expanded && (
        <DataModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          onExportData={handleExportData}
          onFileSelect={handleFileSelect}
          importError={importError}
          fileInputRef={fileInputRef}
        />
      )}
    </nav>
  );
}