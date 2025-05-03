import Tree, { TreeNodeDatum } from 'react-d3-tree';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';
import { Tree as TreeModel, TreeNode, TreeNodeData } from '../../data/tree';

// Define the interface for the tree node data in our component context
interface TreeNodeViewData {
  id: number | string;
  name: string;
  description?: string;
  children?: TreeNodeViewData[];
}

interface TreeContainerProps {
  treeNode: TreeModel;
}

export function TreeContainer({ treeNode }: TreeContainerProps) {
  const selectedNode = useRef<TreeNode | null>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [treeData, setSetTreeData] = useState<TreeNodeViewData>(treeNode.toObject());

  const [currentNodeData, setCurrentNodeData] = useState<TreeNodeViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleRemove = (preserveChildren: boolean = true): void => {
    if (selectedNode.current) {
      // Check if the selected node is the root node
      if (selectedNode.current === treeNode.root) {
        console.warn("Cannot remove the root node of the tree");
        // You could show a user-friendly message here
        return;
      }
      
      selectedNode.current.removeChild(selectedNode.current, preserveChildren);
      setSetTreeData(treeNode.toObject());
      
      // Reset the selection since the node is now removed
      selectedNode.current = null;
      setCurrentNodeData(null);
    }
  }

  const handleAdd = (): void => {
    if (selectedNode.current) {
      // Create a new node as a child of the selected node
      treeNode.createNode(
        { 
          id: treeNode.createChildId(), 
          name: 'New Child', 
          description: 'new node' 
        }, 
        undefined, 
        selectedNode.current.data.id
      );
      setSetTreeData(treeNode.toObject());
    }
  }

  const handleSave = (): void => {
    if (selectedNode.current) {
      selectedNode.current.editNode({ name, description });
      setSetTreeData(treeNode.toObject());
      setIsEdit(false);
    }
  }

  const handleNodeClick = (nodeData: TreeNodeDatum): void => {
    setIsLoading(true);
    console.log(nodeData.data.id);
    selectedNode.current = treeNode.recursiveDepthSearch(nodeData.data.id);
    if (selectedNode.current) {
      console.log(selectedNode.current.data.name);
      
      // Setters
      setCurrentNodeData(nodeData.data);
      setName(selectedNode.current.data.name);
      setDescription(selectedNode.current.data.description || '');
    }
    setIsLoading(false);
  };

  return (
    <section className='flex flex-col lg:flex-row justify-center mx-5 mt-10 space-y-6 lg:space-y-0 lg:space-x-4'>
      <div id="" className="w-full lg:w-2/3" style={{ height: '28em', border: 'solid' }}>
        <Tree
          orientation='vertical'
          onNodeClick={handleNodeClick}
          data={treeData}
          collapsible={false}
        />
      </div>
      <aside className='w-full lg:w-1/3 bg-cool-blue p-4 rounded'>
        <h2 className='mb-4 font-mono text-lg font-semibold text-center'>Node Info</h2>
        {isLoading ?
          <center className=''>
            <BounceLoader color='#ffa857' />
          </center>
          :
          currentNodeData &&
          <article className='mx-8'>
            {!isEdit ?
              <>
                <p className='capitalize'>Name: {currentNodeData.name}
                  {/* <span>| id: {currentNodeData.id}</span> */}
                </p>
                <p className='mt-3 capitalize text-sm'>{currentNodeData.description}</p>
              </>
              :
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    type='text' 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none' 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </>
            }
            <article className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {!isEdit && (
                <>
                  <button
                    onClick={() => handleRemove(true)}
                    className='btn w-full mt-5'
                  >Remove Node</button>
                  <button
                    onClick={() => handleRemove(false)}
                    className='btn w-full mt-5'
                  >Remove Branch</button>
                  <button
                    onClick={handleAdd}
                    className='btn w-full mt-5'
                  >Add Child</button>
                </>
              )}
              {!isEdit ?
                <button
                  onClick={() => setIsEdit(true)}
                  className='btn w-full mt-5'
                >Edit</button>
                :
                <button
                  onClick={handleSave}
                  className='btn w-full mt-5'
                >Save</button>
              }
            </article>
            <div className='mb-4'>
              <h3 className='mt-8 mb-4 font-mono text-lg font-semibold text-center'>
                Children ({currentNodeData && currentNodeData.children ? currentNodeData.children.length : 0})
              </h3>
              {
                currentNodeData && currentNodeData.children && 
                  <p className='text-center'>
                    {currentNodeData.children.map((child: TreeNodeViewData) => child.name).join(', ')}
                  </p>
              }
            </div>
          </article>
        }
      </aside>
    </section>
  )
}