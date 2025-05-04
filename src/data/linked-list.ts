// Generic type to allow for different kinds of data in the linked list
export class Node<T> {
  data: T;
  next: Node<T> | null;
  previous: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.previous = null;
  }
}

/**
 * Base class for all linked list implementations
 * Contains core functionality for manipulating a doubly-linked list
 */
export abstract class LinkedListBase<T> {
  head: Node<T> | null;
  tail: Node<T> | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  // add node to the end
  append(data: T): Node<T> {
    const newNode = new Node<T>(data);

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

  removeHead(): Node<T> {
    if (!this.head) {
      throw new Error("Cannot remove head from empty list");
    }
    
    const nodeToRemove = this.head;
    
    this.head = this.head.next;
    if (this.head === null) {
      // there was no second node, the head was the only item in the list
      this.tail = null;
    } else {
      this.head.previous = null;
    }
    return nodeToRemove;
  }

  toArray(): T[] {
    const array: T[] = [];
    let currentNode = this.head;

    while (currentNode !== null) {
      array.push(currentNode.data);
      currentNode = currentNode.next;
    }

    return array;
  }
  
  /**
   * Returns true if the list is empty (has no nodes)
   */
  isEmpty(): boolean {
    return this.head === null;
  }
  
  /**
   * Inserts a node after the specified target node
   * @param targetNode The node to insert after
   * @param data The data for the new node
   * @returns The newly inserted node
   */
  insertAfter(targetNode: Node<T>, data: T): Node<T> {
    const newNode = new Node<T>(data);
    
    newNode.next = targetNode.next;
    newNode.previous = targetNode;
    
    if (targetNode.next) {
      targetNode.next.previous = newNode;
    } else {
      // Target was the tail
      this.tail = newNode;
    }
    
    targetNode.next = newNode;
    
    return newNode;
  }
  
  /**
   * Removes a specific node from the list
   * @param node The node to remove
   * @returns The removed node
   */
  removeNode(node: Node<T>): Node<T> {
    if (node.previous) {
      node.previous.next = node.next;
    } else {
      // Node is the head
      this.head = node.next;
    }
    
    if (node.next) {
      node.next.previous = node.previous;
    } else {
      // Node is the tail
      this.tail = node.previous;
    }
    
    return node;
  }
}

/**
 * Standard linked list implementation
 * Extends the base functionality with additional methods
 */
export class LinkedList<T> extends LinkedListBase<T> {
  constructor() {
    super();
  }
  
  /**
   * Adds a node to the beginning of the list
   * @param data The data for the new node
   * @returns The newly inserted node
   */
  prepend(data: T): Node<T> {
    const newNode = new Node<T>(data);
    
    if (this.head === null) {
      // List is empty
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.previous = newNode;
      this.head = newNode;
    }
    
    return newNode;
  }
  
  /**
   * Find the first node with matching data
   * @param searchFunction Function that returns true when a match is found
   * @returns The found node or null if not found
   */
  find(searchFunction: (data: T) => boolean): Node<T> | null {
    let currentNode = this.head;
    
    while (currentNode !== null) {
      if (searchFunction(currentNode.data)) {
        return currentNode;
      }
      currentNode = currentNode.next;
    }
    
    return null;
  }
}

/**
 * Queue implementation using a linked list
 * Provides FIFO (First-In-First-Out) behavior
 */
export class Queue<T> extends LinkedList<T> {
  items: T[];

  constructor(item?: T) {
    super();
    this.items = item ? [item] : [];
  }

  enqueue(data: T): void {
    this.append(data);
    this.items = this.toArray();
  }

  dequeue(): T {
    const removedNode = this.removeHead();
    this.items = this.toArray();    
    return removedNode.data;
  }

  isEmpty(): boolean {
    return super.isEmpty() || this.items.length === 0;
  }
}