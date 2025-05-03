import { Queue } from "./linked-list";

let classId = 0;

// Define TypeScript interfaces for the data
export interface TreeNodeData {
  id: number;
  name: string;
  description?: string;
  [key: string]: any; // Allow for additional properties
}

// Export the TreeNode class so it can be used by other files
export class TreeNode {
  data: TreeNodeData;
  children: TreeNode[];
  parent: TreeNode | null;

  constructor(data: TreeNodeData, children: TreeNode[] = [], parent: TreeNode | null = null) {
    this.data = data;
    this.children = children;
    this.parent = parent;
  }

  // Static method to recreate a TreeNode from a plain object
  static fromObject(obj: any, parent: TreeNode | null = null): TreeNode {
    // Create the node with its data
    const node = new TreeNode(obj.data, [], parent);
    
    // Recursively recreate children
    if (obj.children && Array.isArray(obj.children)) {
      node.children = obj.children.map((childObj: any) => 
        TreeNode.fromObject(childObj, node)
      );
    }
    
    return node;
  }

  // Manage Nodes
  addChild(childNode: TreeNode): void {
    childNode.parent = this; // bind the child to this node
    this.children.push(childNode);
  }

  createNode(newValue: TreeNodeData, parentValue?: string, parentId?: number): TreeNode | null {
    console.log("create", newValue, parentValue, parentId);

    let parentNode: TreeNode | null = null;

    // If we're directly adding to this node
    if (!parentValue && !parentId) {
      parentNode = this;
    }
    // If this is the node we're looking for
    else if (this.data.name === parentValue || this.data.id === parentId) {
      console.log("Found parent node directly", this);
      parentNode = this;
    } 
    // If this is the root node, search the entire tree
    else if (this.parent === null) {
      console.log("Searching from root");
      // Try to find by ID first (more reliable)
      if (parentId !== undefined) {
        parentNode = this.findDepthSearch(undefined, parentId);
      } 
      // Fall back to name search
      else if (parentValue !== undefined) {
        parentNode = this.findDepthSearch(parentValue);
      }
    }
    // If all else fails, search from this node's parent
    else {
      console.log("Searching from parent", this.parent);
      // Try to find by ID first (more reliable)
      if (parentId !== undefined) {
        parentNode = this.parent.findDepthSearch(undefined, parentId);
      }
      // Fall back to name search
      else if (parentValue !== undefined) {
        parentNode = this.parent.findDepthSearch(parentValue);
      }
    }

    if (parentNode) {
      console.log("Found parent node", parentNode.data.name, parentNode.data.id);
      const newNode = new TreeNode(newValue);
      parentNode.addChild(newNode);
      return newNode;
    }
    
    console.error("Could not find parent");
    return null;
  }

  // removeSelf

  removeChild(nodeToRemove: TreeNode, preserveChildren: boolean): void {
    // Handle case where the node doesn't have a parent (e.g., root node)
    if (!this.parent) {
      console.warn("Cannot remove a node with no parent (possibly the root node)");
      return;
    }

    const preservedParent = this.parent;
    const index = this.parent.children.findIndex((child) => {
      return child.data.id === nodeToRemove.data.id; // Use ID for more reliable comparison
    });

    // -1 is returned if index is not found
    if (index !== -1) {
      this.parent.children.splice(index, 1); // remove connection to child
      nodeToRemove.parent = null; // remove connection to parent

      // (optional) Add first level of children to parent
      if (preserveChildren && preservedParent) {
        for (let i = 0; i < nodeToRemove.children.length; i++) {
          const child = nodeToRemove.children[i];
          child.parent = preservedParent;
          preservedParent.children.push(child);
        }
      }
    } else {
      console.warn("Node not found in parent's children array");
    }
  }

  editNode(newData: Partial<TreeNodeData>, nodeValue?: string, nodeId?: number): TreeNode | null {
    let nodeToEdit: TreeNode | null = null;

    if (!nodeValue && !nodeId) {
      nodeToEdit = this;
    } else {
      nodeToEdit = this.findBreadthSearch(nodeValue, nodeId);
    }

    if (nodeToEdit) {
      nodeToEdit.data = { ...nodeToEdit.data, ...newData };
      console.log(nodeToEdit);
      return nodeToEdit;
    }
    console.error("Could not find node");
    return null;
  }

  // Search Algo
  findBreadthSearch(nodeName?: string, nodeId?: number, startingNode?: TreeNode): TreeNode | null {
    console.log("find", nodeName, nodeId);

    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";

    console.log("Queue", keyToUse, dataToFind);

    if (!dataToFind) {
      return null;
    }

    let queue = new Queue<TreeNode>();
    queue.enqueue(startingNode || this);

    while (!queue.isEmpty()) {
      console.log("current: ", queue.items);

      let current = queue.dequeue(); // removes 1st item

      if (current.data[keyToUse] === dataToFind) {
        return current;
      }

      current.children.forEach((child) => {
        queue.enqueue(child);
      });
    }
    return null;
  }

  findDepthSearch(nodeName?: string, nodeId?: number, startingNode?: TreeNode): TreeNode | null {
    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";

    if (!dataToFind) {
      return null;
    }

    // init the stack with the node we are searching from
    const stack: TreeNode[] = startingNode ? [startingNode] : [this];

    // create a while loop that will add and subtract from the stack length
    while (stack.length > 0) {
      const currentNode = stack.pop();
      
      if (!currentNode) continue;

      if (currentNode.data[keyToUse] === dataToFind) {
        return currentNode;
      }

      // Instead of concat, we'll loop through the children array backward and push each item. This create a true stack, avoids create a new array with .concat (saving memory), and improves performance by avoiding copying every node --this is O(n).
      for (let i = currentNode.children.length - 1; i >= 0; i--) {
        stack.push(currentNode.children[i]);
      }
    }
    return null; // if not found
  }

  recursiveDepthSearch(nodeId: number | string, currentNode: TreeNode = this): TreeNode | null {
    if (currentNode.data.id === nodeId) {
      return currentNode;
    }

    for (const child of currentNode.children) {
      const result = this.recursiveDepthSearch(nodeId, child);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // Export
  print(level: number = 0): void {
    console.log(" ".repeat(level * 2) + this.data.name);
    this.children.forEach((child) => child.print(level + 1));
  }

  toObject(): TreeNodeObject {
    function nodeToObject(node: TreeNode): TreeNodeObject {
      return {
        id: node.data.id,
        name: node.data.name,
        description: node.data.description || '',
        children: node.children.map((child) => nodeToObject(child)),
      };
    }
    return nodeToObject(this);
  }

  // New method to convert TreeNode to a plain object (for serialization)
  toPlainObject(): any {
    return {
      data: this.data,
      children: this.children.map(child => child.toPlainObject())
      // We don't include parent to avoid circular references
    };
  }
}

// Definition for the tree node object returned by toObject()
export interface TreeNodeObject {
  id: number;
  name: string;
  description: string;
  children: TreeNodeObject[];
}

export class Tree {
  id: number = classId++;
  childId: number = 0;
  root: TreeNode;

  constructor(
    rootValue: TreeNodeData | TreeNode = { name: "New Tree", id: 0 },
    children?: TreeNode[],
    parent?: TreeNode | null
  ) {
    console.log(rootValue instanceof TreeNode);

    if (rootValue instanceof TreeNode) {
      this.root = rootValue;
    } else {
      if (typeof rootValue === 'object' && 'id' in rootValue === false) {
        (rootValue as TreeNodeData).id = this.createChildId();
      }
      this.root = new TreeNode(rootValue as TreeNodeData, children, parent || null);
    }
  }

  // Static method to recreate a Tree from a plain object
  static fromPlainObject(obj: any): Tree {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid object provided to Tree.fromPlainObject');
    }
    
    // Create a new Tree instance
    const tree = new Tree();
    
    // Restore tree properties
    tree.id = obj.id !== undefined ? obj.id : classId++;
    tree.childId = obj.childId !== undefined ? obj.childId : 0;
    
    // Reconstruct the tree structure
    if (obj.root) {
      tree.root = TreeNode.fromObject(obj.root, null);
    }
    
    return tree;
  }

  // Convert Tree to a plain object for serialization
  toPlainObject(): any {
    return {
      id: this.id,
      childId: this.childId,
      root: this.root.toPlainObject()
    };
  }

  createChildId(): number {
    return this.childId++;
  }

  createNode(newValue: TreeNodeData, parentValue?: string, parentId?: number): TreeNode | null {
    return this.root.createNode(newValue, parentValue, parentId);
  }

  removeChild(nodeToRemove: TreeNode, preserveChildren: boolean): void {
    return this.root.removeChild(nodeToRemove, preserveChildren);
  }

  editNode(newData: Partial<TreeNodeData>, nodeValue?: string, nodeId?: number): TreeNode | null {
    return this.root.editNode(newData, nodeValue, nodeId);
  }

  findBreadthSearch(nodeName?: string, nodeId?: number, startingNode?: TreeNode): TreeNode | null {
    // Search by name or id
    return this.root.findBreadthSearch(nodeName, nodeId, startingNode);
  }

  findDepthSearch(nodeName?: string, nodeId?: number, startingNode?: TreeNode): TreeNode | null {
    return this.root.findDepthSearch(nodeName, nodeId, startingNode);
  }

  recursiveDepthSearch(nodeId: number | string, currentNode: TreeNode = this.root): TreeNode | null {
    return this.root.recursiveDepthSearch(nodeId, currentNode);
  }

  toObject(): TreeNodeObject {
    return this.root.toObject();
  }

  print(): void {
    this.root.print();
  }
}

const tree = new Tree({ id: 0, name: "root" });
// console.log(tree);

// console.log(tree.createNode({ id: 1, name: "child1" }, "root"));
// console.log(tree.createNode({ id: 2, name: "child2" }, "root"));
// console.log(tree.createNode({ id: 3, name: "child3" }, "child1"));
// console.log(tree.createNode({ id: 4, name: "child4" }, "child1"));
// console.log(tree.createNode({ id: 5, name: "child5" }, "child2"));

// console.log("END FIRST TREE");

const kyo = new TreeNode({
  id: 1,
  name: "kyo",
  description:
    "Systems Engineer responsible for maintaining and optimizing life support and communications systems on Mars.",
});

const dawa = new TreeNode(
  {
    id: 2,
    name: "dawa",
    description:
      "Lead Biologist overseeing agricultural experiments and food production in the Martian colony.",
  },
  [
    new TreeNode({
      id: 3,
      name: "seamus",
      description:
        "Assistant Biologist working on soil enrichment and crop sustainability in the Martian environment.",
    }),
    new TreeNode({
      id: 4,
      name: "harlow",
      description:
        "Hydrologist managing water resources, including extraction and recycling systems.",
    }),
  ]
);

dawa.children.forEach((child) => {
  child.parent = dawa;
});

const riley = new TreeNode(
  {
    id: 5,
    name: "riley",
    description:
      "Chief Medical Officer overseeing the health and well-being of all Martian colonists.",
  },
  [
    new TreeNode({
      id: 6,
      name: "les",
      description:
        "Surgeon specialized in emergency procedures and trauma care for Martian settlers.",
    }),
    new TreeNode({
      id: 7,
      name: "endi",
      description:
        "Psychologist providing mental health support and counseling to colony members.",
    }),
  ]
);

riley.children.forEach((child) => {
  child.parent = riley;
});

const mien = new TreeNode(
  {
    id: 8,
    name: "mien",
    description:
      "Chief Engineer responsible for infrastructure maintenance and new construction projects on Mars.",
  },
  [
    new TreeNode({
      id: 9,
      name: "isi",
      description:
        "Mechanical Engineer focusing on vehicle and machinery maintenance in the harsh Martian environment.",
    }),
  ]
);

mien.children.forEach((child) => {
  child.parent = mien;
});

const taylor = new TreeNode(
  {
    id: 10,
    name: "taylor",
    description:
      "Chief of Security, ensuring the safety of all colonists and protecting the base from external threats.",
  },
  [kyo]
);

taylor.children.forEach((child) => {
  child.parent = taylor;
});

const zuza = new TreeNode(
  {
    id: 11,
    name: "zuza",
    description:
      "Head of Research, leading scientific studies and experiments to expand Martian knowledge.",
  },
  [dawa, riley]
);

zuza.children.forEach((child) => {
  child.parent = zuza;
});

const rachna = new TreeNode(
  {
    id: 12,
    name: "rachna",
    description:
      "Operations Manager, overseeing daily activities and logistics within the Martian colony.",
  },
  [mien]
);

rachna.children.forEach((child) => {
  child.parent = rachna;
});

const morgan = new TreeNode(
  {
    id: 13,
    name: "morgan",
    description:
      "Chief Officer of Lunar Operations, overseeing all activities related to lunar missions and base management on Mars.",
  },
  [taylor, zuza, rachna]
);

morgan.children.forEach((child) => {
  child.parent = morgan;
});

export const empTree = new Tree(morgan);

// console.log("Init search: ", empTree.recursiveDepthSearch("riley"));
