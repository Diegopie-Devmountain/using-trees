import { empTree, Tree } from './data/tree.js';
import './App.css';
import { useState, useRef } from 'react';
import { TreeContainer } from './components/TreeContainer';

import Header from './layouts/Header.jsx';
import Sidebar from './layouts/Sidebar.jsx';

function App() {
  const [trees, setTrees] = useState([empTree]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarColor, setSidebarColor] = useState('bg-green-50');
  const hamburgerRef = useRef(null);

  const handleCreateTree = () => {
    setTrees([...trees, new Tree()]);
  }

  const handleToggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  }

  // Could be expanded with color picker functionality
  const handleColorChange = (color) => {
    setSidebarColor(color);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation - First in document flow */}
      <Header 
        onToggleSidebar={handleToggleSidebar} 
        isExpanded={sidebarExpanded} 
        ref={hamburgerRef}
      />

      {/* Content area with sidebar and main content */}
      <div className="flex flex-1">
        {/* Left Sidebar - always visible but expands/collapses */}
        <Sidebar 
          initialExpanded={sidebarExpanded}
          initialColor={sidebarColor} 
          onToggle={setSidebarExpanded}
          hamburgerRef={hamburgerRef}
        />

        {/* Main Content - adjust based on sidebar state */}
        <main className="flex-1 p-4 overflow-auto transition-all duration-300">
          <div>
            {trees.map(tree => <TreeContainer key={tree.id} treeNode={tree} />)}
          </div>
          <div className='mt-10 mx-16'>
            <button 
              onClick={handleCreateTree} 
              className='btn focus:outline-none focus:ring-2 focus:ring-green-400'
            >
              Create Tree
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
