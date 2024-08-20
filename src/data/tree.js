import { Queue } from "./linked-list.js";

let classId = 0;

class TreeNode {
  constructor(data, children = [], parent = null) {
    this.data = data;
    this.children = children;
    this.parent = parent;
  }

  addChild(childNode) {
    childNode.parent = this; // bind the child to this node
    this.children.push(childNode);
  }

  // removeSelf

  removeChild(nodeToRemove, preserveChildren) {
    const index = this.children.indexOf((child) => {
      return child.name === nodeToRemove.name;
    });

    // -1 is returned if index is not found
    if (index !== -1) {
      nodeToRemove.parent = null; // remove connection to parent
      this.children.splice(index, 1); // remove connection to child

      // (optional) Add first level of children to parent ( )
      if (preserveChildren) {
        for (let i = 0; i < nodeToRemove.children.length; i++) {
          const child = nodeToRemove.children[i];
          child.parent = this;
          this.children.push(child);
        }
      }
    }
  }

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

  constructor(rootValue, children, parent ) {
    console.log(rootValue instanceof(TreeNode));
    
    if (rootValue instanceof(TreeNode)) {
      this.root = rootValue;
    } else {
      this.root = new TreeNode(rootValue = {name: 'New Tree', id: this.createChildId()}, children, parent);
    }
  }

  createChildId() {
    return this.childId++;
  }

  addNode(newValue, parentValue, parentId) {
    const parentNode = parentNode || this.findBreadthSearch(parentValue, parentId);

    if (parentNode) {
      const newNode = new TreeNode(newValue);
      parentNode.addChild(newNode);
      return newNode;
    }
    console.error("Could not find parent");
    return null;
  }

  findDepthSearch(nodeName, nodeId, startingNode) {
    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";

    // init the stack with the node we are searching from
    const stack = startingNode ? [startingNode] : [this.root];

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

  recursiveDepthSearch(nodeId, currentNode = this.root) {

    if (currentNode.data.id === nodeId) {
      return currentNode;
    }


    for (const child of currentNode.children) {
      const result = this.recursiveDepthSearch(nodeId, child);
      console.log(`Result for ${currentNode.data.name}:`, result);

      if (result) {
        return result;
      }
    }
    return null;
  }

  findBreadthSearch(nodeName, nodeId, startingNode) {
    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";
    let queue = new Queue();

    queue.enqueue(startingNode || this.root);

    while (!queue.isEmpty()) {
      console.log("current: ", queue.items);

      let current = queue.dequeue(); // removes 1st item

      if (current.data[keyToUse] === dataToFind) {
        return current;
      }
    }
    return null;
  }

  toObject() {
    return this.root.toObject()
  }

  print() {
    this.root.print();
  }
}

// const tree = new Tree({ id: 0, name: "root" });
// // console.log(tree);

// console.log(tree.addNode({ id: 1, name: "child1" }, "root"));
// console.log(tree.addNode({ id: 2, name: "child2" }, "root"));
// console.log(tree.addNode({ id: 3, name: "child3" }, "child1"));
// console.log(tree.addNode({ id: 4, name: "child4" }, "child1"));
// console.log(tree.addNode({ id: 5, name: "child5" }, "child2"));

const kyo = new TreeNode({ 
  id: 1, 
  name: "kyo", 
  description: "Systems Engineer responsible for maintaining and optimizing life support and communications systems on Mars." 
});

const dawa = new TreeNode({ 
  id: 2, 
  name: "dawa", 
  description: "Lead Biologist overseeing agricultural experiments and food production in the Martian colony." 
}, [
  new TreeNode({ 
    id: 3, 
    name: "seamus", 
    description: "Assistant Biologist working on soil enrichment and crop sustainability in the Martian environment." 
  }),
  new TreeNode({ 
    id: 4, 
    name: "harlow", 
    description: "Hydrologist managing water resources, including extraction and recycling systems." 
  }),
]);

const riley = new TreeNode({ 
  id: 5, 
  name: "riley", 
  description: "Chief Medical Officer overseeing the health and well-being of all Martian colonists." 
}, [
  new TreeNode({ 
    id: 6, 
    name: "les", 
    description: "Surgeon specialized in emergency procedures and trauma care for Martian settlers." 
  }),
  new TreeNode({ 
    id: 7, 
    name: "endi", 
    description: "Psychologist providing mental health support and counseling to colony members." 
  }),
]);

const mien = new TreeNode({ 
  id: 8, 
  name: "mien", 
  description: "Chief Engineer responsible for infrastructure maintenance and new construction projects on Mars." 
}, [
  new TreeNode({ 
    id: 9, 
    name: "isi", 
    description: "Mechanical Engineer focusing on vehicle and machinery maintenance in the harsh Martian environment." 
  }),
]);

const taylor = new TreeNode({ 
  id: 10, 
  name: "taylor", 
  description: "Chief of Security, ensuring the safety of all colonists and protecting the base from external threats." 
}, [kyo]);

const zuza = new TreeNode({ 
  id: 11, 
  name: "zuza", 
  description: "Head of Research, leading scientific studies and experiments to expand Martian knowledge." 
}, [dawa, riley]);

const rachna = new TreeNode({ 
  id: 12, 
  name: "rachna", 
  description: "Operations Manager, overseeing daily activities and logistics within the Martian colony." 
}, [mien]);

const morgan = new TreeNode({ 
  id: 13, 
  name: "morgan", 
  description: "Chief Officer of Lunar Operations, overseeing all activities related to lunar missions and base management on Mars." 
}, [taylor, zuza, rachna]);

export const empTree = new Tree(morgan);


// console.log("Init search: ", empTree.recursiveDepthSearch("riley"));
