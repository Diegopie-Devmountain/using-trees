import PropTypes from "prop-types";
import { forwardRef } from "react";

const Header = forwardRef(({ onToggleSidebar, isExpanded }, ref) => {
  const handleToggle = () => {
    onToggleSidebar();
  };

  return(
    <header className="bg-green-50 h-14 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center">
        <button 
          ref={ref}
          onClick={handleToggle}
          className="p-2 mr-4 focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
          aria-label="Toggle sidebar"
          aria-expanded={isExpanded}
          aria-controls="sidebar-navigation"
        >
          <div className="w-6 h-6 flex flex-col justify-between items-center relative">
            {/* Top bar */}
            <span 
              className={`bg-gray-600 block h-0.5 w-full rounded transition-all duration-300 ease-in-out 
                ${isExpanded ? 'rotate-45 absolute top-2.5' : ''}`}
            />
            {/* Middle bar */}
            <span 
              className={`bg-gray-600 block h-0.5 w-full rounded transition-all duration-300 ease-in-out 
                ${isExpanded ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Bottom bar */}
            <span 
              className={`bg-gray-600 block h-0.5 w-full rounded transition-all duration-300 ease-in-out 
                ${isExpanded ? '-rotate-45 absolute top-2.5' : ''}`}
            />
          </div>
        </button>
        <h1 className="text-blue-500 text-xl font-medium"><a href='/'>Trees (Pro)</a></h1>
      </div>

      <button 
        className="p-2 focus:outline-none focus:ring-2 focus:ring-green-400 rounded" 
        aria-label="Open settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  );
});

Header.displayName = 'Header';

Header.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired
};

export default Header;