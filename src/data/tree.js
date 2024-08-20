import { Queue } from "./linked-list.js";

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
}

class Tree {
  constructor(rootValue, children, parent ) {
    console.log('hheerrre');
    
    console.log(rootValue instanceof(TreeNode));
    
    if (rootValue instanceof(TreeNode)) {
      this.root = rootValue;
    } else {
      this.root = new TreeNode(rootValue, children, parent);
    }
  }

  addNode(newValue, parentValue, parentId) {
    const parentNode = this.findBreadthSearch(parentValue, parentId);
    console.log(parentNode);
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

  recursiveDepthSearch(nodeValue, currentNode = this.root) {
    console.log(currentNode.data.name);

    if (currentNode.data.name === nodeValue) {
      return currentNode;
    }

    console.log(currentNode.children);

    for (const child of currentNode.children) {
      const result = this.recursiveDepthSearch(nodeValue, child);
      console.log(`Result for ${currentNode.data.name}:`, result);

      if (result) {
        return result;
      }
    }
    // return null;
  }

  findBreadthSearch(nodeName, nodeId, startingNode) {
    // Search by name or id
    const dataToFind = nodeName || nodeId;
    const keyToUse = nodeName ? "name" : "id";
    let queue = new Queue();
    console.log(startingNode || this.root);

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
    function nodeToObject(node) {
      return {
        id: node.data.id,
        name: node.data.name,
        children: node.children.map((child) => nodeToObject(child)),
      };
    }
    return nodeToObject(this.root);
  }
}

const tree = new Tree({ id: 0, name: "root" });
// console.log(tree);

console.log(tree.addNode({ id: 1, name: "child1" }, "root"));
console.log(tree.addNode({ id: 2, name: "child2" }, "root"));
console.log(tree.addNode({ id: 3, name: "child3" }, "child1"));
console.log(tree.addNode({ id: 4, name: "child4" }, "child1"));
console.log(tree.addNode({ id: 5, name: "child5" }, "child2"));

const kyo = new TreeNode({ id: 1, name: "kyo" });
const dawa = new TreeNode({ id: 2, name: "dawa" }, [
  new TreeNode({ id: 3, name: "seamus" }),
  new TreeNode({ id: 4, name: "harlow" }),
]);
const riley = new TreeNode({ id: 5, name: "riley" }, [
  new TreeNode({ id: 6, name: "les" }),
  new TreeNode({ id: 7, name: "endi" }),
]);
const mien = new TreeNode({ id: 8, name: "mien" }, [
  new TreeNode({ id: 9, name: "isi" }),
]);

const taylor = new TreeNode({ id: 10, name: "taylor" }, [kyo]);
const zuza = new TreeNode({ id: 11, name: "zuza" }, [dawa, riley]);
const rachna = new TreeNode({ id: 12, name: "rachna" }, [mien]);

const morgan = new TreeNode({ id: 13, name: "morgan" }, [taylor, zuza, rachna]);

export const empTree = new Tree(morgan, true);

console.log("Init search: ", empTree.recursiveDepthSearch("riley"));
