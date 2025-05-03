import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

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
  const [expanded, setExpanded] = useState(initialExpanded);
  const [sidebarColor, setSidebarColor] = useState(initialColor);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
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
            onClick={() => setIsCreatingWorkspace(true)}
          >
            <div className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 flex items-center justify-center text-xl focus:outline-none focus:ring-2 focus:ring-green-600">
              +
            </div>
            <span className={`ml-3 text-gray-700 flex-grow text-sm text-nowrap ${!expanded ? "hidden" : ""}`}>
              New workspace
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
    </nav>
  );
}