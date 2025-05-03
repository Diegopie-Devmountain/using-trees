import './App.css';
import { useState, useRef, useEffect } from 'react';
import { TreeContainer } from './features/Trees/TreeContainer';
import { Tree } from './data/tree';
import Header from './layouts/Header';
import Sidebar from './layouts/Sidebar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

// Wrap component to use workspace context
const AppContent = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [sidebarColor, setSidebarColor] = useState<string>('bg-green-50');
  const [trees, setTrees] = useState<Tree[]>([]);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Get workspace data and functions
  const { 
    activeWorkspaceId,
    getTreesForActiveWorkspace,
    createTree
  } = useWorkspace();

  // Load trees when active workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      loadTrees();
    } else {
      setTrees([]);
    }
  }, [activeWorkspaceId]);

  const loadTrees = async () => {
    try {
      const workspaceTrees = await getTreesForActiveWorkspace();
      setTrees(workspaceTrees);
    } catch (error) {
      console.error('Error loading trees:', error);
    }
  };

  const handleCreateTree = async () => {
    try {
      const newTree = new Tree();
      await createTree(newTree);
      // Refresh trees
      await loadTrees();
    } catch (error) {
      console.error('Error creating tree:', error);
    }
  };

  const handleToggleSidebar = (): void => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <Header 
        onToggleSidebar={handleToggleSidebar} 
        isExpanded={sidebarExpanded} 
        ref={hamburgerRef}
      />

      {/* Content area with sidebar and main content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar 
          initialExpanded={sidebarExpanded}
          initialColor={sidebarColor} 
          onToggle={setSidebarExpanded}
          hamburgerRef={hamburgerRef}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto transition-all duration-300">
          {activeWorkspaceId ? (
            <>
              <div>
                {trees.length > 0 ? (
                  trees.map(tree => <TreeContainer key={tree.id} treeNode={tree} />)
                ) : (
                  <p className="text-center py-10 text-gray-500">
                    No trees in this workspace yet.
                  </p>
                )}
              </div>
              <div className="mt-10 mx-16">
                <button 
                  onClick={handleCreateTree} 
                  className="btn focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Create Tree
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Select or Create a Workspace</h2>
                <p className="text-gray-600">
                  To get started, select an existing workspace or create a new one using the sidebar.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Main App component with provider
function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}

export default App;
