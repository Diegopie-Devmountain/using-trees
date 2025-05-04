import { Queue } from "./linked-list";
import { v4 as uuidv4 } from 'uuid';
import { 
  Dataset, TextDataset, ImageDataset, UrlDataset, 
  OrderedDatasetCollection, createDatasetCollection 
} from "./dataset-collection";

// Define TypeScript interfaces for the data
export interface TreeNodeData {
  name: string;
  nodeType?: string;
  datasets: {
    listType: 'array' | 'linked_list';
    collection: OrderedDatasetCollection<Dataset>;
  };
}

// Export the TreeNode class so it can be used by other files
export class TreeNode {
  id: string;
  type: string; 
  parent: TreeNode | null;
  children: TreeNode[];
  data: {
    name: string;
    datasets: {
      listType: 'array' | 'linked_list';
      collection: OrderedDatasetCollection<Dataset>;
    }
  };

  constructor(
    id: string,
    data: {name: string},
    nodeType: string = 'default',
    listType: 'array' | 'linked_list' = 'linked_list',
    children: TreeNode[] = [], 
    parent: TreeNode | null = null
  ) {
    this.id = id;
    this.type = nodeType;
    this.parent = parent;
    this.children = children;
    
    // Initialize data structure
    this.data = {
      name: data.name,
      datasets: {
        listType: listType,
        collection: createDatasetCollection<Dataset>(listType)
      }
    };
  }

  // Dataset management methods
  addDataset(dataset: Dataset): Dataset {
    const result = this.data.datasets.collection.add(dataset);
    return result.data;
  }
  
  getDatasets(): Dataset[] {
    return this.data.datasets.collection.getAll().map(item => item.data);
  }
  
  getDataset(id: string): Dataset | null {
    const result = this.data.datasets.collection.getById(id);
    return result ? result.data : null;
  }
  
  updateDataset(id: string, updates: Partial<Dataset>): boolean {
    const existing = this.data.datasets.collection.getById(id);
    if (!existing) return false;
    
    const updated = { ...existing.data, ...updates };
    
    // Remove and re-add to update
    this.data.datasets.collection.remove(id);
    this.data.datasets.collection.add(updated);
    return true;
  }
  
  deleteDataset(id: string): boolean {
    return this.data.datasets.collection.remove(id);
  }
  
  reorderDataset(id: string, newPosition: number): boolean {
    return this.data.datasets.collection.reorder(id, newPosition);
  }
  
  changeDatasetImplementation(newType: 'array' | 'linked_list'): void {
    if (this.data.datasets.listType === newType) return;
    
    // Get current datasets
    const currentDatasets = this.getDatasets();
    
    // Create new collection
    this.data.datasets.listType = newType;
    this.data.datasets.collection = createDatasetCollection<Dataset>(newType);
    
    // Migrate existing datasets
    currentDatasets.forEach(dataset => {
      this.data.datasets.collection.add(dataset);
    });
  }
  
  // Helper methods for creating specific dataset types
  createTextDataset(title: string, content: string = ''): TextDataset {
    const dataset: TextDataset = {
      type: 'text',
      title,
      content
    };
    return this.addDataset(dataset) as TextDataset;
  }
  
  createImageDataset(title: string, url: string = '', altText: string = ''): ImageDataset {
    const dataset: ImageDataset = {
      type: 'image',
      title,
      url,
      altText
    };
    return this.addDataset(dataset) as ImageDataset;
  }
  
  createUrlDataset(title: string, url: string = '', description: string = ''): UrlDataset {
    const dataset: UrlDataset = {
      type: 'url',
      title,
      url,
      description
    };
    return this.addDataset(dataset) as UrlDataset;
  }

  // Static method to recreate a TreeNode from a plain object
  static fromObject(obj: any, parent: TreeNode | null = null): TreeNode {
    // Handle legacy format or new format
    if (obj.id && obj.type) {
      // New format with separate id and type
      const node = new TreeNode(
        obj.id,
        { name: obj.data.name },
        obj.type,
        obj.data.datasets.listType || 'linked_list',
        [],
        parent
      );
      
      // Reconstruct datasets
      if (obj.data.datasets) {
        // Create dataset collection using the specified type
        node.data.datasets.listType = obj.data.datasets.listType || 'linked_list';
        node.data.datasets.collection = createDatasetCollection<Dataset>(node.data.datasets.listType);
        
        // Add datasets to the collection
        if (Array.isArray(obj.data.datasets.items)) {
          obj.data.datasets.items.forEach((dataset: Dataset) => {
            node.data.datasets.collection.add(dataset);
          });
        }
      }
      
      // Recursively reconstruct children
      if (obj.children && Array.isArray(obj.children)) {
        node.children = obj.children.map((childObj: any) => 
          TreeNode.fromObject(childObj, node)
        );
      }
      
      return node;
    } else {
      // Legacy format - data contains id
      const nodeData = obj.data || obj;
      const node = new TreeNode(
        nodeData.id,
        { name: nodeData.name },
        'default',
        'linked_list',
        [],
        parent
      );
      
      // Recursively reconstruct children
      if (obj.children && Array.isArray(obj.children)) {
        node.children = obj.children.map((childObj: any) => 
          TreeNode.fromObject(childObj, node)
        );
      }
      
      return node;
    }
  }

  // Manage Nodes
  addChild(childNode: TreeNode): void {
    childNode.parent = this; // bind the child to this node
    this.children.push(childNode);
  }

  createNode(newValue: {name: string}, parentValue?: string, parentId?: string): TreeNode | null {
    console.log("create", newValue, parentValue, parentId);

    let parentNode: TreeNode | null = null;

    // If we're directly adding to this node
    if (!parentValue && !parentId) {
      parentNode = this;
    }
    // If this is the node we're looking for
    else if (this.data.name === parentValue || this.id === parentId) {
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
      console.log("Found parent node", parentNode.data.name, parentNode.id);
      const newNode = new TreeNode(
        uuidv4(), 
        { name: newValue.name },
        'default',
        'linked_list'
      );
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
      return child.id === nodeToRemove.id; // Use ID for more reliable comparison
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

  editNode(newData: Partial<TreeNodeData>, nodeValue?: string, nodeId?: string): TreeNode | null {
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
  findBreadthSearch(nodeName?: string, nodeId?: string, startingNode?: TreeNode): TreeNode | null {
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

      // Check if we found the node
      if (keyToUse === "name" && current.data.name === dataToFind) {
        return current;
      } else if (keyToUse === "id" && current.id === dataToFind) {
        return current;
      }

      current.children.forEach((child) => {
        queue.enqueue(child);
      });
    }
    return null;
  }

  findDepthSearch(nodeName?: string, nodeId?: string, startingNode?: TreeNode): TreeNode | null {
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

      // Check if we found the node
      if (keyToUse === "name" && currentNode.data.name === dataToFind) {
        return currentNode;
      } else if (keyToUse === "id" && currentNode.id === dataToFind) {
        return currentNode;
      }

      // Instead of concat, we'll loop through the children array backward and push each item. This create a true stack, avoids create a new array with .concat (saving memory), and improves performance by avoiding copying every node --this is O(n).
      for (let i = currentNode.children.length - 1; i >= 0; i--) {
        stack.push(currentNode.children[i]);
      }
    }
    return null; // if not found
  }

  recursiveDepthSearch(nodeId: string, currentNode: TreeNode = this): TreeNode | null {
    if (currentNode.id === nodeId) {
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
        id: node.id,
        name: node.data.name,
        nodeType: node.type,
        datasets: {
          listType: node.data.datasets.listType,
          items: node.getDatasets()
        },
        children: node.children.map((child) => nodeToObject(child)),
      };
    }
    return nodeToObject(this);
  }

  // New method to convert TreeNode to a plain object (for serialization)
  toPlainObject(): any {
    return {
      id: this.id,
      type: this.type,
      data: {
        name: this.data.name,
        datasets: {
          listType: this.data.datasets.listType,
          items: this.getDatasets()
        }
      },
      children: this.children.map(child => child.toPlainObject())
      // We don't include parent to avoid circular references
    };
  }
}

// Definition for the tree node object returned by toObject()
export interface TreeNodeObject {
  id: string;
  name: string;
  nodeType?: string;
  datasets: {
    listType: 'array' | 'linked_list';
    items: Dataset[];
  };
  children: TreeNodeObject[];
}

export class Tree {
  id: string = uuidv4();
  childIdCounter: number = 0;
  root: TreeNode;

  constructor(rootNode?: TreeNode) {
    if (rootNode instanceof TreeNode) {
      this.root = rootNode;
    } else {
      // Create a default root node
      this.root = new TreeNode(
        uuidv4(),
        { name: "New Tree" },
        'default',
        'linked_list'
      );
    }
  }

  // Static method to recreate a Tree from a plain object
  static fromPlainObject(obj: any): Tree {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid object provided to Tree.fromPlainObject');
    }
    
    // Create a new Tree instance
    const tree = new Tree();
    
    // Restore tree properties - use the exact ID from the saved object
    tree.id = obj.id;
    tree.childIdCounter = obj.childIdCounter !== undefined ? obj.childIdCounter : 0;
    
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
      childIdCounter: this.childIdCounter,
      root: this.root.toPlainObject()
    };
  }

  createChildId(): string {
    // Use UUIDs for node IDs
    return uuidv4();
  }

  createNode(newValue: TreeNodeData, parentValue?: string, parentId?: string): TreeNode | null {
    return this.root.createNode(newValue, parentValue, parentId);
  }

  removeChild(nodeToRemove: TreeNode, preserveChildren: boolean): void {
    return this.root.removeChild(nodeToRemove, preserveChildren);
  }

  editNode(newData: Partial<TreeNodeData>, nodeValue?: string, nodeId?: string): TreeNode | null {
    return this.root.editNode(newData, nodeValue, nodeId);
  }

  findBreadthSearch(nodeName?: string, nodeId?: string, startingNode?: TreeNode): TreeNode | null {
    // Search by name or id
    return this.root.findBreadthSearch(nodeName, nodeId, startingNode);
  }

  findDepthSearch(nodeName?: string, nodeId?: string, startingNode?: TreeNode): TreeNode | null {
    return this.root.findDepthSearch(nodeName, nodeId, startingNode);
  }

  recursiveDepthSearch(nodeId: string, currentNode: TreeNode = this.root): TreeNode | null {
    return this.root.recursiveDepthSearch(nodeId, currentNode);
  }

  toObject(): TreeNodeObject {
    return this.root.toObject();
  }

  print(): void {
    this.root.print();
  }
}

// Demo tree with UUID strings
const tree = new Tree();

// Helper function to create a node with initial text dataset
function createNodeWithDescription(name: string, description: string): TreeNode {
  const node = new TreeNode(
    uuidv4(),
    { name },
    'default',
    'linked_list'
  );
  
  // Add the description as a text dataset
  node.createTextDataset("Description", description);
  
  return node;
}

// Update demo tree using the helper function
const kyo = createNodeWithDescription(
  "kyo",
  "Systems Engineer responsible for maintaining and optimizing life support and communications systems on Mars."
);

const seamus = createNodeWithDescription(
  "seamus",
  "Assistant Biologist working on soil enrichment and crop sustainability in the Martian environment."
);

const harlow = createNodeWithDescription(
  "harlow",
  "Hydrologist managing water resources, including extraction and recycling systems."
);

// Create dawa and add children
const dawa = createNodeWithDescription(
  "dawa",
  "Lead Biologist overseeing agricultural experiments and food production in the Martian colony."
);
dawa.addChild(seamus);
dawa.addChild(harlow);

const les = createNodeWithDescription(
  "les",
  "Surgeon specialized in emergency procedures and trauma care for Martian settlers."
);

const endi = createNodeWithDescription(
  "endi",
  "Psychologist providing mental health support and counseling to colony members."
);

// Create riley and add children
const riley = createNodeWithDescription(
  "riley",
  "Chief Medical Officer overseeing the health and well-being of all Martian colonists."
);
riley.addChild(les);
riley.addChild(endi);

const isi = createNodeWithDescription(
  "isi",
  "Mechanical Engineer focusing on vehicle and machinery maintenance in the harsh Martian environment."
);

// Create mien and add child
const mien = createNodeWithDescription(
  "mien",
  "Chief Engineer responsible for infrastructure maintenance and new construction projects on Mars."
);
mien.addChild(isi);

// Create taylor and add child
const taylor = createNodeWithDescription(
  "taylor",
  "Chief of Security, ensuring the safety of all colonists and protecting the base from external threats."
);
taylor.addChild(kyo);

// Create zuza and add children
const zuza = createNodeWithDescription(
  "zuza",
  "Head of Research, leading scientific studies and experiments to expand Martian knowledge."
);
zuza.addChild(dawa);
zuza.addChild(riley);

// Create rachna and add child
const rachna = createNodeWithDescription(
  "rachna",
  "Operations Manager, overseeing daily activities and logistics within the Martian colony."
);
rachna.addChild(mien);

// Create morgan (root node) and add children
const morgan = createNodeWithDescription(
  "morgan",
  "Chief Officer of Lunar Operations, overseeing all activities related to lunar missions and base management on Mars."
);
morgan.addChild(taylor);
morgan.addChild(zuza);
morgan.addChild(rachna);

// Create the employee tree with morgan as the root
export const empTree = new Tree(morgan);
