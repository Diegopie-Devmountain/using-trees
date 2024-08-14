class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.previous = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  // add node to the end
  append(data) {
    const newNode = new Node(data);

    if (this.tail === null) {
      // list is empty, will be first item
      this.head = newNode;
      this.tail = newNode;
    } else {
      const newSecondLastNode = this.tail;
      // Point new node to old tail
      newNode.previous = newSecondLastNode;
      // point old tail to new node
      newSecondLastNode.next = newNode;
      this.tail = newNode;
    }
    return newNode;
  }

  removeHead() {
    const nodeToRemove = this.head;
    console.log('head: ', this.head);
    
    this.head = this.head.next;
    if (this.head === null) {
      // there was no second node, the head was the only item in the list
      this.tail = null;
    } else {
      this.head.previous = null;
    }
    return nodeToRemove;
  }

  toArray() {
    const array = [];
    let currentNode = this.head;

    while (currentNode !== null) {
      array.push(currentNode.data);
      currentNode = currentNode.next;
    }

    return array;
  }
}

export class Queue extends LinkedList {
  constructor (item) {
    super();
    this.items = [item];
  }

  enqueue(data) {
    this.append(data);
    this.items = this.toArray();
    console.log('enqueue: ', this.items);
    
  }

  dequeue() {
    const removedNode = this.removeHead();
    this.items = this.toArray();
    return removedNode;
  }
} 