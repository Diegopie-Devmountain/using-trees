import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Sidebar({ 
  initialExpanded = true, 
  initialColor = 'bg-green-50',
  onToggle = () => {} 
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [sidebarColor, setSidebarColor] = useState(initialColor);

  // Update expanded state when initialExpanded prop changes
  useEffect(() => {
    setExpanded(initialExpanded);
  }, [initialExpanded]);

  return (
    <nav 
      className={`${sidebarColor} flex flex-col items-center transition-all duration-300 ease-in-out ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <div className="mt-4 flex flex-col gap-4 items-center w-full">
        {/* Add new space button - centered regardless of sidebar state */}
        <div className="flex w-full px-3 items-center">
          <button 
            className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 flex items-center justify-center text-xl"
            aria-label="Create new space"
          >
            +
          </button>
          
            <span className={`ml-3 text-gray-700 sr-only flex-grow text-sm text-nowrap ${!expanded ? "hidden" : "" }`}>Add new space</span>
          
        </div>
        <div className="border-t border-gray-200 w-4/5 my-3"></div>
        
        {/* Space buttons - with labels when expanded */}
        {[1, 2, 3].map((item) => (
          <div 
            key={item} 
            className={`flex items-center w-full px-3 ${expanded ? 'justify-start' : 'justify-center'}`}
          >
            <button 
              className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
              aria-label={`Space ${item}`}
            >
              s
            </button>
            {expanded && (
              <span className="ml-3 text-gray-700 truncate">Space {item}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

Sidebar.propTypes = {
  initialExpanded: PropTypes.bool,
  initialColor: PropTypes.string,
  onToggle: PropTypes.func
};