import { Queue } from "./linked-list.js";

let classId = 0;

class TreeNode {
  constructor(data, children = [], parent = null) {
    this.data = data;
    this.children = children;
    this.parent = parent;
  }

  // Manage Nodes
  addChild(childNode) {
    childNode.parent = this; // bind the child to this node
    this.children.push(childNode);
  }

  createNode(newValue, parentValue, parentId) {
    console.log("create", newValue, parentValue, parentId);

    let parentNode = null;

    if (this.parent === null) {
      console.log("hit null");

      parentNode = this.findBreadthSearch(parentValue, parentId);
    } else if (this.data.name === parentValue) {
      console.log("hit name", this);
      parentNode = this;
    } else if (this.data.id === parentId) {
      console.log("hit id", this);
      parentNode = this;
    } else {
      console.log("else", this);

      parentNode = this.parentNode.findBreadthSearch(parentValue, parentId);
    }

    if (parentNode) {
      const newNode = new TreeNode(newValue);
      parentNode.addChild(newNode);

      return newNode;
    }
    console.error("Could not find parent");
    return null;
  }

  // removeSelf

  removeChild(nodeToRemove, preserveChildren) {
    const preservedParent = this.parent;

    const index = this.parent.children.findIndex((child) => {
      return child.data.name === nodeToRemove.data.name;
    });

    // -1 is returned if index is not found
    if (index !== -1) {
      this.parent.children.splice(index, 1); // remove connection to child
      nodeToRemove.parent = null; // remove connection to parent

      // (optional) Add first level of children to parent ( )
      if (preserveChildren) {
        for (let i = 0; i < nodeToRemove.children.length; i++) {
          const child = nodeToRemove.children[i];
          child.parent = preservedParent;
          preservedParent.children.push(child);
        }
      }
    }
  }

  editNode(newData, nodeValue, nodeId) {
    let nodeToEdit = null;

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
  findBreadthSearch(nodeName, nodeId, startingNode) {
    console.log("find", nodeName, nodeId);

    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";

    console.log("Queue", keyToUse, dataToFind);

    let queue = new Queue();

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

  findDepthSearch(nodeName, nodeId, startingNode) {
    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";

    // init the stack with the node we are searching from
    const stack = startingNode ? [startingNode] : [this];

    // create a while loop that will add and subtract from the stack length
    while (stack.length > 0) {
      const currentNode = stack.pop();

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

  recursiveDepthSearch(nodeId, currentNode = this) {
    if (currentNode.data.id === nodeId) {
      return currentNode;
    }

    for (const child of currentNode.children) {
      const result = this.recursiveDepthSearch(nodeId, child);
      // console.log(`Result for ${currentNode.data.name}:`, result);

      if (result) {
        return result;
      }
    }
    return null;
  }

  // Export
  print(level = 0) {
    console.log(" ".repeat(level * 2) + this.data);
    this.children.forEach((child) => child.print(level + 1));
  }

  toObject() {
    function nodeToObject(node) {
      return {
        id: node.data.id,
        name: node.data.name,
        description: node.data.description,
        children: node.children.map((child) => nodeToObject(child)),
      };
    }
    return nodeToObject(this);
  }
}

export class Tree {
  id = classId++;
  childId = 0;

  constructor(
    rootValue = { name: "New Tree", id: this.createChildId() },
    children,
    parent
  ) {
    console.log(rootValue instanceof TreeNode);

    if (rootValue instanceof TreeNode) {
      this.root = rootValue;
    } else {
      this.root = new TreeNode(rootValue, children, parent);
    }
  }

  createChildId() {
    return this.childId++;
  }

  createNode(newValue, parentValue, parentId) {
    return this.root.createNode(newValue, parentValue, parentId);
  }

  removeChild(nodeToRemove, preserveChildren) {
    return this.root.removeChild(nodeToRemove, preserveChildren);
  }

  editNode(newData, nodeValue, nodeId) {
    return this.root.editNode(newData, nodeValue, nodeId);
  }

  findBreadthSearch(nodeName, nodeId, startingNode) {
    // Search by name or id
    return this.root.findBreadthSearch(nodeName, nodeId, startingNode);
  }

  findDepthSearch(nodeName, nodeId, startingNode) {
    return this.root.findDepthSearch(nodeName, nodeId, startingNode);
  }

  recursiveDepthSearch(nodeId, currentNode = this.root) {
    return this.root.recursiveDepthSearch(nodeId, currentNode);
  }

  toObject() {
    return this.root.toObject();
  }

  print() {
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
