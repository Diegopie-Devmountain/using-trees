// Generic type to allow for different kinds of data in the linked list
class Node<T> {
  data: T;
  next: Node<T> | null;
  previous: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.previous = null;
  }
}

class LinkedList<T> {
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
}

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
    return this.head === null || this.items.length === 0;
  }
}