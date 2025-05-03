import { ForwardRefExoticComponent, RefAttributes } from 'react';

declare module '*.jsx' {
  // Header component type
  export interface HeaderProps {
    onToggleSidebar: () => void;
    isExpanded: boolean;
  }

  const Header: ForwardRefExoticComponent<
    HeaderProps & RefAttributes<HTMLButtonElement>
  >;

  // Sidebar component type
  export interface SidebarProps {
    initialExpanded?: boolean;
    initialColor?: string;
    onToggle?: (expanded: boolean) => void;
    hamburgerRef?: React.RefObject<HTMLButtonElement>;
  }

  const Sidebar: React.FC<SidebarProps>;

  export { Header as default, Sidebar };
}