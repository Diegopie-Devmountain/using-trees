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
      // Implementation for adding a node
      // This was using removeChild in the original, which seems incorrect
      // Assuming you want to add a child to the current node
      const newData = { 
        id: classNode.createChildId(),
        name: 'New Node',
        description: 'New node description'
      };
      classNode.createNode(newData, undefined, currentNode.current.data.id);
      setTreeData(classNode.toObject());
    }
  }
  
  const handleEdit = () => {
    if (currentNode.current && classNode) {
      // Implementation for editing a node
      // This was also using removeChild in the original, which seems incorrect
      // For editing, you typically would update the node data
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