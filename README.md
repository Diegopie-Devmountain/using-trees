# using trees

This activity will deep dive in creating and managing trees. Remember, while the principals of creating a Tree will be the same, you will always tune them for the use case. We can also create a generic Tree class and use polymorphism to make specific ones.

The front end will be mostly done. We'll edit parts as we need. Let's start at /src/data/tree.js

## Creating a Tree Node

Our tree node will have three properties, two created with default values.

```js
class TreeNode {
  constructor(data, children=[], parent=null) {
    this.data = data;
    this.children = children;
    this.parent = parent
  }
}
```

### Create Methods

Our node needs these methods

### addChild

```js
  addChild(childNode) {
    childNode.parent = this; // bind the child to this parent
    this.children.push(childNode);
  }
```

### removeChild

```js
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
```
