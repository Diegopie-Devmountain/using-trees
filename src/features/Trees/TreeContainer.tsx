import Tree, { TreeNodeDatum } from 'react-d3-tree';
import { useRef, useState, useEffect } from 'react';
import { BounceLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';
import { Tree as TreeModel, TreeNode, TreeNodeData } from '../../data/tree';
import { Dataset, TextDataset } from '../../data/dataset-collection';
import { useWorkspace } from '../../context/WorkspaceContext';

// Define the interface for the tree node data in our component context
interface TreeNodeViewData {
  id: string;
  name: string;
  nodeType?: string;
  datasets: {
    listType: 'array' | 'linked_list';
    items: Dataset[];
  };
  children?: TreeNodeViewData[];
}

interface TreeContainerProps {
  treeNode: TreeModel;
}

export function TreeContainer({ treeNode }: TreeContainerProps) {
  const { updateTree } = useWorkspace();
  const selectedNode = useRef<TreeNode | null>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  
  // Dataset implementation type state is commented out as we're hiding this functionality
  // const [datasetListType, setDatasetListType] = useState<'array' | 'linked_list'>('linked_list');

  const [treeData, setTreeData] = useState<TreeNodeViewData>(treeNode.toObject());

  const [currentNodeData, setCurrentNodeData] = useState<TreeNodeViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // Extract description from datasets or return empty string
  const getDescriptionFromDatasets = (datasets: Dataset[]): string => {
    const descriptionDataset = datasets.find(
      (dataset): dataset is TextDataset => 
        dataset.type === 'text' && dataset.title === 'Description'
    );
    return descriptionDataset?.content || '';
  };

  // Save tree to localStorage whenever it changes
  const saveTreeChanges = async () => {
    try {
      await updateTree(treeNode);
    } catch (error) {
      console.error('Error saving tree changes:', error);
    }
  };

  const handleRemove = async (preserveChildren: boolean = true): Promise<void> => {
    if (selectedNode.current) {
      // Check if the selected node is the root node
      if (selectedNode.current === treeNode.root) {
        console.warn("Cannot remove the root node of the tree");
        // You could show a user-friendly message here
        return;
      }
      
      selectedNode.current.removeChild(selectedNode.current, preserveChildren);
      setTreeData(treeNode.toObject());
      
      // Save changes to localStorage
      await saveTreeChanges();
      
      // Reset the selection since the node is now removed
      selectedNode.current = null;
      setCurrentNodeData(null);
    }
  }

  const handleAdd = async (): Promise<void> => {
    if (selectedNode.current) {
      // Create a new node as a child of the selected node
      const newNode = selectedNode.current.createNode(
        { name: 'New Child' }, 
        undefined, 
        selectedNode.current.id
      );
      
      if (newNode) {
        // Add a default description dataset
        newNode.createTextDataset('Description', 'New node description');
        setTreeData(treeNode.toObject());
        
        // Save changes to localStorage
        await saveTreeChanges();
      }
    }
  }

  const handleSave = async (): Promise<void> => {
    if (selectedNode.current) {
      // Update the node name
      selectedNode.current.data.name = name;
      
      // Find and update the description dataset, or create one if it doesn't exist
      const descriptionDataset = selectedNode.current.getDatasets().find(
        (dataset): dataset is TextDataset => 
          dataset.type === 'text' && dataset.title === 'Description'
      );
      
      if (descriptionDataset) {
        selectedNode.current.updateDataset(descriptionDataset.id, {
          ...descriptionDataset,
          content: description
        });
      } else {
        selectedNode.current.createTextDataset('Description', description);
      }
      
      // Commented out dataset implementation type change
      /*
      if (selectedNode.current.data.datasets.listType !== datasetListType) {
        selectedNode.current.changeDatasetImplementation(datasetListType);
      }
      */
      
      setTreeData(treeNode.toObject());
      
      // Save changes to localStorage
      await saveTreeChanges();
      
      setIsEdit(false);
    }
  }

  const handleNodeClick = (nodeData: TreeNodeDatum): void => {
    setIsLoading(true);
    console.log(nodeData.data.id);
    selectedNode.current = treeNode.recursiveDepthSearch(nodeData.data.id);
    if (selectedNode.current) {
      console.log(selectedNode.current.data.name);
      
      // Get datasets
      const nodeDatasets = selectedNode.current.getDatasets();
      setDatasets(nodeDatasets);
      
      // Commented out dataset list type setting
      // setDatasetListType(selectedNode.current.data.datasets.listType);
      
      // Setters
      setCurrentNodeData(nodeData.data as TreeNodeViewData);
      setName(selectedNode.current.data.name);
      setDescription(getDescriptionFromDatasets(nodeDatasets));
    }
    setIsLoading(false);
  };

  // Commented out the toggle dataset implementation function
  /*
  const toggleDatasetImplementation = async (): Promise<void> => {
    if (selectedNode.current) {
      const newType = selectedNode.current.data.datasets.listType === 'array' ? 'linked_list' : 'array';
      selectedNode.current.changeDatasetImplementation(newType);
      setDatasetListType(newType);
      setTreeData(treeNode.toObject());
      
      // Save changes to localStorage
      await saveTreeChanges();
    }
  };
  */

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
                <p className='mt-3 capitalize text-sm'>{getDescriptionFromDatasets(currentNodeData.datasets.items)}</p>
                {/* Commented out dataset implementation type display
                <p className='mt-3 text-xs'>Dataset Implementation: <span className="font-mono">{currentNodeData.datasets.listType}</span></p>
                */}
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
                {/* Commented out dataset implementation type selection
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Dataset Implementation</label>
                  <select 
                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    value={datasetListType}
                    onChange={(e) => setDatasetListType(e.target.value as 'array' | 'linked_list')}
                  >
                    <option value="linked_list">Linked List</option>
                    <option value="array">Array with Order</option>
                  </select>
                </div>
                */}
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
                  {/* Commented out toggle dataset type button
                  <button
                    onClick={toggleDatasetImplementation}
                    className='btn w-full mt-5'
                  >Toggle Dataset Type</button>
                  */}
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

            {/* Commented out datasets list section 
            <div className='mb-4'>
              <h3 className='mt-8 mb-4 font-mono text-lg font-semibold text-center'>
                Datasets ({currentNodeData.datasets.items.length})
              </h3>
              <ul className='text-sm'>
                {currentNodeData.datasets.items.map((dataset, index) => (
                  <li key={index} className='mb-2 p-2 bg-gray-100 rounded'>
                    <strong>{dataset.title}</strong> ({dataset.type})
                  </li>
                ))}
              </ul>
            </div>
            */}
          </article>
        }
      </aside>
    </section>
  )
}