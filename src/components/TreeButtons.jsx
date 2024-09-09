import { useRef } from "react";

export default function TreeButtons ({buttonType}) {

  const functionToUse = useRef(null);

  const handleRemove = () => {
    classNode.removeChild(currentNode.current, true);
    setSetTreeData(classNode.toObject());
  }
  const handleAdd = () => {
    classNode.removeChild(currentNode.current, true);
    setSetTreeData(classNode.toObject());
  }
  const handleEdit = () => {
    classNode.removeChild(currentNode.current, true);
    setSetTreeData(classNode.toObject());
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

  )
}