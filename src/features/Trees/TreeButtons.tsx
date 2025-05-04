import { useRef } from "react";
import { Tree, TreeNode } from "../../data/tree";

interface TreeButtonsProps {
  buttonType: "remove" | "add" | "edit";
  classNode: Tree;
  currentNode: React.RefObject<TreeNode>;
  setTreeData: React.Dispatch<React.SetStateAction<any>>;
}

export default function TreeButtons({buttonType, classNode, currentNode, setTreeData}: TreeButtonsProps) {
  const functionToUse = useRef<(() => void) | null>(null);

  const handleRemove = () => {
    if (currentNode.current && classNode) {
      classNode.removeChild(currentNode.current, true);
      setTreeData(classNode.toObject());
    }
  }
  
  const handleAdd = () => {
    if (currentNode.current && classNode) {
      // Create a new node as a child of the current node
      const newNode = currentNode.current.createNode(
        { name: 'New Node' }, 
        undefined, 
        currentNode.current.id
      );
      
      if (newNode) {
        // Add a default description dataset
        newNode.createTextDataset('Description', 'New node description');
        setTreeData(classNode.toObject());
      }
    }
  }
  
  const handleEdit = () => {
    if (currentNode.current && classNode) {
      // Implementation for editing a node
      // This is a placeholder - actual implementation would depend on your app's needs
      setTreeData(classNode.toObject());
    }
  }

  switch(buttonType) {
    case "remove": 
      functionToUse.current = handleRemove;
      break;
    case "add": 
      functionToUse.current = handleAdd;
      break;
    case "edit": 
      functionToUse.current = handleEdit;
      break;
  }

  return (
    <button 
      onClick={functionToUse.current || undefined} 
      className="btn w-full mt-5"
    >
      {buttonType === "remove" ? "Remove" : buttonType === "add" ? "Add" : "Edit"}
    </button>
  );
}