import { useState, useEffect, useRef, RefObject, Dispatch, SetStateAction } from "react";

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
  const [expanded, setExpanded] = useState(initialExpanded);
  const [sidebarColor, setSidebarColor] = useState(initialColor);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Update expanded state when initialExpanded prop changes
  useEffect(() => {
    setExpanded(initialExpanded);

    // When sidebar expands, focus the first button
    if (initialExpanded && firstButtonRef.current) {
      // Small delay to allow the sidebar to expand visually first
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
        {/* Add new space button - centered regardless of sidebar state */}
        <div className="flex w-full px-3 items-center">
          <button
            ref={firstButtonRef}
            className="flex items-center justify-center"
            aria-label="Create new space"
          >
            <div className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 flex items-center justify-center text-xl focus:outline-none focus:ring-2 focus:ring-green-600">
            +
            </div>
            <span className={`ml-3 text-gray-700 sr-only flex-grow text-sm text-nowrap ${!expanded ? "hidden" : ""}`}>Add new space</span>
          </button>
        </div>
        <div className="border-t border-gray-200 w-4/5 my-3"></div>

        {/* Space buttons - with labels when expanded */}
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`flex items-center w-full px-3 ${expanded ? 'justify-start' : 'justify-center'}`}
          >
            <button className="flex items-center" aria-label={`Space ${item}`}>
              <div
                className="bg-green-300 hover:bg-green-400 rounded-full w-10 h-10 focus:outline-none focus:ring-2 focus:ring-green-600 flex items-center justify-center flex-shrink-0"
              >
                s
              </div>
              <span className={`ml-3 text-gray-700 truncate ${expanded ? '' : 'hidden'}`}>Space {item}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}