import Tree, { TreeNodeDatum } from 'react-d3-tree';
import { useRef, useState, useEffect } from 'react';
import { BounceLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';
import { Tree as TreeModel, TreeNode, TreeNodeData } from '../../data/tree';
import { Dataset, TextDataset, ImageDataset, UrlDataset } from '../../data/dataset-collection';
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
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeViewData>(treeNode.toObject());
  const [currentNodeData, setCurrentNodeData] = useState<TreeNodeViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showAddDatasetModal, setShowAddDatasetModal] = useState<boolean>(false);
  const [newDatasetType, setNewDatasetType] = useState<'text' | 'image' | 'url'>('text');
  const [newDatasetTitle, setNewDatasetTitle] = useState<string>('');
  const [newDatasetContent, setNewDatasetContent] = useState<string>('');
  const [draggedDatasetId, setDraggedDatasetId] = useState<string | null>(null);

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
      
      // No longer updating description directly since we manage datasets separately
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
      
      // Setters
      setCurrentNodeData(nodeData.data as TreeNodeViewData);
      setName(selectedNode.current.data.name);
      // Description setter removed
    }
    setIsLoading(false);
  };

  const handleAddDataset = () => {
    if (!selectedNode.current) return;
    
    let newDataset: Dataset | null = null;
    
    if (newDatasetType === 'text') {
      newDataset = selectedNode.current.createTextDataset(
        newDatasetTitle, 
        newDatasetContent
      );
    } else if (newDatasetType === 'image') {
      newDataset = selectedNode.current.createImageDataset(
        newDatasetTitle, 
        newDatasetContent, 
        ''
      );
    } else if (newDatasetType === 'url') {
      newDataset = selectedNode.current.createUrlDataset(
        newDatasetTitle, 
        newDatasetContent, 
        ''
      );
    }
    
    if (newDataset) {
      // Update local datasets state
      const updatedDatasets = selectedNode.current.getDatasets();
      setDatasets(updatedDatasets);
      console.log(newDataset)
      
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);
      
      // Update current node data to reflect the new dataset
      if (selectedNode.current && currentNodeData) {
        const updatedNodeData = {
          ...currentNodeData,
          datasets: {
            listType: currentNodeData.datasets.listType,
            items: updatedDatasets
          }
        };
        setCurrentNodeData(updatedNodeData);
      }
      
      // Save changes
      saveTreeChanges();
      
      // Reset form
      setNewDatasetTitle('');
      setNewDatasetContent('');
      setShowAddDatasetModal(false);
    }
  };
  
  // Simplified dataset deletion function
  const handleDeleteDataset = (datasetId: string) => {
    console.log(datasetId);
    
    console.log(!selectedNode.current);
    
    if (!selectedNode.current) return;
    
    // Simply delete the dataset without special handling
    const success = selectedNode.current.deleteDataset(datasetId);
    
    if (success) {
      // Update local datasets state
      const updatedDatasets = selectedNode.current.getDatasets();
      setDatasets(updatedDatasets);
      
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);
      
      // Update current node data
      if (currentNodeData) {
        const updatedNodeData = {
          ...currentNodeData,
          datasets: {
            listType: currentNodeData.datasets.listType,
            items: updatedDatasets
          }
        };
        setCurrentNodeData(updatedNodeData);
      }
      
      // Save changes
      saveTreeChanges();
    }
  };
  
  const handleDragStart = (datasetId: string) => {
    setDraggedDatasetId(datasetId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetDatasetId: string) => {
    e.preventDefault();
    if (!draggedDatasetId || !selectedNode.current) return;
    
    // Find positions
    const datasets = selectedNode.current.getDatasets();
    const draggedIndex = datasets.findIndex(d => d.id === draggedDatasetId);
    const targetIndex = datasets.findIndex(d => d.id === targetDatasetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder in the node
      selectedNode.current.reorderDataset(draggedDatasetId, targetIndex);
      
      // Update local datasets state
      const updatedDatasets = selectedNode.current.getDatasets();
      setDatasets(updatedDatasets);
      
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);
      
      // Update current node data to reflect the reordered datasets
      if (selectedNode.current && currentNodeData) {
        const updatedNodeData = {
          ...currentNodeData,
          datasets: {
            listType: currentNodeData.datasets.listType,
            items: updatedDatasets
          }
        };
        setCurrentNodeData(updatedNodeData);
      }
      
      // Save changes
      saveTreeChanges();
    }
    
    setDraggedDatasetId(null);
  };

  // Function to render dataset content based on type
  const renderDatasetContent = (dataset: Dataset) => {
    switch (dataset.type) {
      case 'text':
        return <p className="ml-8">{(dataset as TextDataset).content}</p>;
      case 'image':
        return (
          <div className="ml-8 mt-2">
            <img 
              src={(dataset as ImageDataset).url} 
              alt={(dataset as ImageDataset).altText || dataset.title} 
              className="max-w-[180px] max-h-[120px] object-contain border border-gray-200" 
            />
          </div>
        );
      case 'url':
        return (
          <div className="ml-8 mt-1">
            <a 
              href={(dataset as UrlDataset).url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {(dataset as UrlDataset).url}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className='flex flex-col lg:flex-row justify-center mx-5 mt-10 space-y-6 lg:space-y-0 lg:space-x-4 h-[calc(100vh-12rem)]'>
      <div className="w-full lg:w-2/3 border border-gray-300 rounded overflow-hidden" style={{ height: '100%' }}>
        <Tree
          orientation='vertical'
          onNodeClick={handleNodeClick}
          data={treeData}
          collapsible={false}
          translate={{ x: 250, y: 100 }}
        />
      </div>
      <aside className='w-full lg:w-1/3 bg-cool-blue p-4 rounded flex flex-col h-full max-h-full overflow-hidden'>
        <h2 className='mb-4 font-mono text-lg font-semibold text-center'>Node Info</h2>
        {isLoading ?
          <center className='my-auto'>
            <BounceLoader color='#ffa857' />
          </center>
          :
          currentNodeData &&
          <div className='flex flex-col h-full overflow-hidden'>
            {!isEdit ?
              <>
                <p className='text-lg font-medium'>Name: {currentNodeData.name}</p>

                {/* Datasets section - scrollable */}
                <div className="mt-4 flex-grow overflow-y-auto">
                  {currentNodeData.datasets.items.map((dataset) => {
                    console.log("Dataset in render:", dataset);
                    return (
                    <div 
                      key={dataset.id} // This is likely undefined
                      draggable
                      onDragStart={() => handleDragStart(dataset.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dataset.id)}
                      className="mb-6 cursor-move"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-gray-500 select-none">≡</div>
                        <h3 className="font-medium">{dataset.title}</h3>
                        <button 
                          onClick={() => {
                            console.log("Delete clicked, dataset:", dataset);
                            handleDeleteDataset(dataset.id);
                          }}
                          className="ml-auto text-gray-500 hover:text-red-500"
                          aria-label='Delete dataset'
                        >
                          ×
                        </button>
                      </div>
                      {renderDatasetContent(dataset)}
                    </div>
                  )})}

                  {/* Add dataset button */}
                  <button 
                    onClick={() => setShowAddDatasetModal(true)}
                    className="flex items-center gap-2 mt-2 text-gray-600 hover:text-gray-800"
                    aria-label="Add dataset"
                  >
                    <span className="text-xl">+</span> Add dataset
                  </button>

                  {/* Add dataset modal */}
                  {showAddDatasetModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
                        <h3 className="text-lg font-medium mb-4">Add New Dataset</h3>
                        
                        <div className="mb-4">
                          <label className="block mb-2 text-sm">Dataset Type</label>
                          <select
                            value={newDatasetType}
                            onChange={(e) => setNewDatasetType(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="url">URL</option>
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block mb-2 text-sm">Title</label>
                          <input
                            type="text"
                            value={newDatasetTitle}
                            onChange={(e) => setNewDatasetTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Title"
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block mb-2 text-sm">
                            {newDatasetType === 'text' ? 'Content' : 
                             newDatasetType === 'image' ? 'Image URL' : 'URL'}
                          </label>
                          {newDatasetType === 'text' ? (
                            <textarea
                              value={newDatasetContent}
                              onChange={(e) => setNewDatasetContent(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md h-24"
                              placeholder="Enter text content"
                            />
                          ) : (
                            <input
                              type="text"
                              value={newDatasetContent}
                              onChange={(e) => setNewDatasetContent(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder={newDatasetType === 'image' ? 'Enter image URL' : 'Enter URL'}
                            />
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowAddDatasetModal(false)}
                            className="px-4 py-2 border rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddDataset}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tree buttons - positioned at bottom */}
                <div className="mt-auto pt-4 flex justify-between gap-2">
                  <button
                    onClick={() => handleRemove(true)}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                  >
                    Remove Node
                  </button>
                  <button
                    onClick={() => handleRemove(false)}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                  >
                    Remove Branch
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                  >
                    Add Child
                  </button>
                  <button
                    onClick={() => setIsEdit(true)}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                  >
                    Edit
                  </button>
                </div>
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
                
                <div className="mt-auto flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                  >
                    Save
                  </button>
                </div>
              </>
            }
          </div>
        }
      </aside>
    </section>
  )
}