import { v4 as uuidv4 } from 'uuid';
import { LinkedListBase, Node } from './linked-list';

/**
 * Interface for dataset types that will be stored in collections
 */
export interface Dataset {
  id: string
  type: string;
  title: string;
  [key: string]: any;
}

/**
 * Base interface for text datasets
 */
export interface TextDataset extends Dataset {
  type: 'text';
  content: string;
}

/**
 * Base interface for image datasets
 */
export interface ImageDataset extends Dataset {
  type: 'image';
  url: string;
  altText?: string;
}

/**
 * Base interface for URL datasets
 */
export interface UrlDataset extends Dataset {
  type: 'url';
  url: string;
  description?: string;
}

/**
 * Common shape for items in any ordered collection
 * Includes an ID and wraps the actual data
 */
export interface OrderedItemWithId<T> {
  id: string;
  data: T;
}

/**
 * Interface defining the API for all ordered dataset collections.
 * This ensures both implementations (array and linked list) expose
 * the same methods, making them interchangeable.
 */
export interface OrderedDatasetCollection<T> {
  /** Add a new dataset to the collection */
  add(data: T): OrderedItemWithId<T>;
  
  /** Get all datasets in order */
  getAll(): OrderedItemWithId<T>[];
  
  /** Get a specific dataset by ID */
  getById(id: string): OrderedItemWithId<T> | null;
  
  /** Move a dataset to a new position */
  reorder(id: string, newPosition: number): boolean;
  
  /** Remove a dataset from the collection */
  remove(id: string): boolean;
}

/**
 * Factory function that creates and returns an ordered dataset collection
 * based on the specified type.
 * 
 * @param type The type of collection to create ('array' or 'linked_list')
 * @returns A new collection instance implementing OrderedDatasetCollection
 */
export function createDatasetCollection<T>(
  type: 'array' | 'linked_list' = 'linked_list'
): OrderedDatasetCollection<T> {
  // This will be implemented once we create the collection classes
  // For now it just returns a linked list implementation
  if (type === 'array') {
    return new OrderedArrayCollection<T>();
  } else {
    return new OrderedLinkedListCollection<T>();
  }
}

/**
 * Ordered Array Implementation
 * Uses an array with explicit order properties for storing datasets
 * 
 * Time Complexity:
 * - Access by index: O(n log n) due to sorting
 * - Access by id: O(n) for find operation 
 * - Insertion: O(1) amortized
 * - Deletion: O(n)
 * - Reordering: O(n)
 */
export interface OrderedArrayItem<T> extends OrderedItemWithId<T> {
  order: number;
}

export class OrderedArrayCollection<T> implements OrderedDatasetCollection<T> {
  /** Internal storage for items */
  private items: OrderedArrayItem<T>[] = [];
  
  /**
   * Adds a new item to the end of the collection
   * @param data The data to add
   * @returns The newly created OrderedItemWithId object
   */
  add(data: T): OrderedItemWithId<T> {
    // Create a new ordered dataset with the next available order number
    const newItem: OrderedArrayItem<T> = {
      id: uuidv4(),
      order: this.items.length,
      data
    };
    this.items.push(newItem);
    return { id: newItem.id, data: newItem.data };
  }
  
  /**
   * Retrieves all items in order
   * @returns A sorted copy of the items array
   */
  getAll(): OrderedItemWithId<T>[] {
    // Return a sorted copy to maintain the original array's structure
    return [...this.items]
      .sort((a, b) => a.order - b.order)
      .map(item => ({ id: item.id, data: item.data }));
  }
  
  /**
   * Moves an item to a new position in the order
   * @param id ID of the item to move
   * @param newPosition The desired position (0-based)
   * @returns true if successful, false if item not found
   */
  reorder(id: string, newPosition: number): boolean {
    // Find the item by ID
    const itemIndex = this.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;
    
    const item = this.items[itemIndex];
    const currentPosition = item.order;
    
    // Ensure new position is within bounds
    const maxPosition = this.items.length - 1;
    const boundedPosition = Math.max(0, Math.min(newPosition, maxPosition));
    
    // If position didn't change, do nothing
    if (boundedPosition === currentPosition) return true;
    
    // Update order values of affected items
    if (boundedPosition > currentPosition) {
      // Moving down - decrement items between old and new positions
      this.items.forEach(i => {
        if (i.order > currentPosition && i.order <= boundedPosition) {
          i.order--;
        }
      });
    } else {
      // Moving up - increment items between new and old positions
      this.items.forEach(i => {
        if (i.order >= boundedPosition && i.order < currentPosition) {
          i.order++;
        }
      });
    }
    
    // Set the new order for the moved item
    item.order = boundedPosition;
    return true;
  }
  
  /**
   * Retrieves an item by its ID
   * @param id ID of the item to find
   * @returns The item if found, null otherwise
   */
  getById(id: string): OrderedItemWithId<T> | null {
    const item = this.items.find(item => item.id === id);
    return item ? { id: item.id, data: item.data } : null;
  }
  
  /**
   * Removes an item from the collection
   * @param id ID of the item to remove
   * @returns true if removal was successful, false if item not found
   */
  remove(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    const removedOrder = this.items[index].order;
    
    // Remove the item from the array
    this.items.splice(index, 1);
    
    // Update order values of remaining items
    this.items.forEach(item => {
      if (item.order > removedOrder) {
        item.order--;
      }
    });
    
    return true;
  }
}

/**
 * Implementation using a linked list with direct node references
 * 
 * Time Complexity:
 * - Access sequential: O(n)
 * - Access by ID: O(1) using the nodeMap
 * - Insertion: O(1)
 * - Deletion: O(1) with direct node reference
 * - Reordering: O(1) with direct node references
 */

export class OrderedLinkedListCollection<T> extends LinkedListBase<OrderedItemWithId<T>> implements OrderedDatasetCollection<T> {
  // Private map for O(1) lookups by ID
  #nodeMap: Map<string, Node<OrderedItemWithId<T>>> = new Map();
  
  /**
   * Adds a new item to the end of the list
   * @param data The data to add
   * @returns The newly created OrderedItemWithId
   */
  add(data: T): OrderedItemWithId<T> {
    const id = uuidv4();
    const orderedItem: OrderedItemWithId<T> = { id, data };
    
    // Use base class append to add to the list
    const node = this.append(orderedItem);
    
    // Store node reference in the map for fast lookup
    this.#nodeMap.set(id, node);
    
    return orderedItem;
  }
  
  /**
   * Gets all items as an ordered array
   * @returns Array of all items in list order
   */
  getAll(): OrderedItemWithId<T>[] {
    return this.toArray();
  }
  
  /**
   * Finds an item by its ID
   * @param id ID of the item to find
   * @returns The item or null if not found
   */
  getById(id: string): OrderedItemWithId<T> | null {
    const node = this.#nodeMap.get(id);
    return node ? node.data : null;
  }
  
  /**
   * Moves an item to a new position in the order
   * This is more complex in a linked list as we need to count positions
   * @param id ID of the item to move
   * @param newPosition The desired position (0-based)
   * @returns true if successful, false if item not found
   */
  reorder(id: string, newPosition: number): boolean {
    const nodeToMove = this.#nodeMap.get(id);
    if (!nodeToMove) return false;
    
    // Get current position of node
    let currentPosition = 0;
    let current = this.head;
    while (current && current.data.id !== id) {
      currentPosition++;
      current = current.next;
    }
    
    // If new position is the same as current, do nothing
    if (currentPosition === newPosition) return true;
    
    // Remove the node from the list (but keep the reference)
    this.removeNode(nodeToMove);
    
    // Now insert the node at the new position
    if (newPosition <= 0 || !this.head) {
      // Insert at the beginning (empty list or position 0)
      if (!this.head) {
        // Empty list
        this.head = nodeToMove;
        this.tail = nodeToMove;
        nodeToMove.next = null;
        nodeToMove.previous = null;
      } else {
        // Insert before current head
        nodeToMove.next = this.head;
        nodeToMove.previous = null;
        this.head.previous = nodeToMove;
        this.head = nodeToMove;
      }
    } else {
      // Find the node at the position before where we want to insert
      let targetPosition = 0;
      let targetNode = this.head;
      
      // Bound the position to the list size
      const size = this.#getSize();
      const boundedPosition = Math.min(newPosition, size);
      
      // Find the node at position - 1 (node we want to insert after)
      while (targetNode && targetPosition < boundedPosition - 1) {
        // Fix: handle the null case explicitly
        if (targetNode.next === null) break;
        targetNode = targetNode.next;
        targetPosition++;
      }
      
      if (targetNode) {
        // Insert after targetNode
        this.insertAfter(targetNode, nodeToMove.data);
        // Remove the newly created node and use our original node instead
        if (targetNode.next && targetNode.next !== nodeToMove) {
          this.removeNode(targetNode.next);
          
          nodeToMove.previous = targetNode;
          nodeToMove.next = targetNode.next;
          
          if (targetNode.next) {
            targetNode.next.previous = nodeToMove;
          } else {
            this.tail = nodeToMove;
          }
          
          targetNode.next = nodeToMove;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Removes an item from the collection
   * @param id ID of the item to remove
   * @returns true if successful, false if item not found
   */
  remove(id: string): boolean {
    const nodeToRemove = this.#nodeMap.get(id);
    if (!nodeToRemove) return false;
    
    // Remove node from list
    this.removeNode(nodeToRemove);
    
    // Remove from map
    this.#nodeMap.delete(id);
    
    return true;
  }
  
  /**
   * Helper method to get the size of the list
   * @returns The number of items in the list
   */
  #getSize(): number {
    return this.#nodeMap.size;
  }
}