declare module 'react-d3-tree' {
  import { FC, ReactElement } from 'react';

  export interface TreeNodeDatum {
    name?: string;
    attributes?: Record<string, string | number | boolean>;
    children?: TreeNodeDatum[];
    [key: string]: any;  // For custom data properties
  }

  export interface TreeLinkDatum {
    source: {
      x: number;
      y: number;
      [key: string]: any;
    };
    target: {
      x: number;
      y: number;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface TreeProps {
    data: TreeNodeDatum | TreeNodeDatum[];
    orientation?: 'horizontal' | 'vertical';
    translate?: { x: number; y: number };
    pathFunc?: 'diagonal' | 'elbow' | 'straight' | 'step';
    collapsible?: boolean;
    initialDepth?: number;
    depthFactor?: number;
    separation?: { siblings?: number; nonSiblings?: number };
    nodeSize?: { x: number; y: number };
    zoom?: number;
    onNodeClick?: (node: TreeNodeDatum, evt: MouseEvent) => void;
    onNodeMouseOver?: (node: TreeNodeDatum, evt: MouseEvent) => void;
    onNodeMouseOut?: (node: TreeNodeDatum, evt: MouseEvent) => void;
    onLinkClick?: (linkData: TreeLinkDatum, evt: MouseEvent) => void;
    onLinkMouseOver?: (linkData: TreeLinkDatum, evt: MouseEvent) => void;
    onLinkMouseOut?: (linkData: TreeLinkDatum, evt: MouseEvent) => void;
    renderCustomNodeElement?: (nodeData: TreeNodeDatum) => ReactElement;
    styles?: Record<string, any>;
    enableLegacyTransitions?: boolean;
    transitionDuration?: number;
    shouldCollapseNeighborNodes?: boolean;
    dimensions?: { width: number; height: number };
    zoomable?: boolean;
    [key: string]: any;  // For any additional props
  }

  const Tree: FC<TreeProps>;
  
  export default Tree;
}