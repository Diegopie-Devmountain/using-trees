import Tree, { TreeNodeDatum } from "react-d3-tree";
import { useRef, useState, useEffect } from "react";
import { BounceLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import { Tree as TreeModel, TreeNode, TreeNodeData } from "../../data/tree";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dataset,
  TextDataset,
  ImageDataset,
  UrlDataset,
} from "../../data/dataset-collection";
import { useWorkspace } from "../../context/WorkspaceContext";
import { Components } from "react-markdown";

// Define custom types for ReactMarkdown code component props
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

// Define the interface for the tree node data in our component context
interface TreeNodeViewData {
  id: string;
  name: string;
  nodeType?: string;
  datasets: {
    listType: "array" | "linked_list";
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
  // Add a dedicated ref to track the selected node ID across renders
  const selectedNodeId = useRef<string | null>(null);

  const [name, setName] = useState<string>("");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeViewData>(
    treeNode.toObject()
  );
  const [currentNodeData, setCurrentNodeData] =
    useState<TreeNodeViewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showAddDatasetModal, setShowAddDatasetModal] =
    useState<boolean>(false);
  const [showEditDatasetModal, setShowEditDatasetModal] =
    useState<boolean>(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [newDatasetType, setNewDatasetType] = useState<
    "text" | "image" | "url"
  >("text");
  const [newDatasetTitle, setNewDatasetTitle] = useState<string>("");
  const [newDatasetContent, setNewDatasetContent] = useState<string>("");
  const [draggedDatasetId, setDraggedDatasetId] = useState<string | null>(null);
  const [dragOverDatasetId, setDragOverDatasetId] = useState<string | null>(
    null
  );

  // Extract description from datasets or return empty string
  const getDescriptionFromDatasets = (datasets: Dataset[]): string => {
    const descriptionDataset = datasets.find(
      (dataset): dataset is TextDataset =>
        dataset.type === "text" && dataset.title === "Description"
    );
    return descriptionDataset?.content || "";
  };

  // Save tree to localStorage whenever it changes
  const saveTreeChanges = async () => {
    try {
      await updateTree(treeNode);
    } catch (error) {
      console.error("Error saving tree changes:", error);
    }
  };

  // Ensure node selection is maintained across operations
  const refreshNodeSelection = () => {
    if (selectedNodeId.current && selectedNode.current) {
      // Re-establish node reference from the tree using the ID we saved
      const node = treeNode.recursiveDepthSearch(selectedNodeId.current);

      if (node) {
        // Update the ref with the most current node instance
        selectedNode.current = node;

        // Update datasets state
        const nodeDatasets = node.getDatasets();
        setDatasets(nodeDatasets);

        // Update current node data if it exists
        if (currentNodeData) {
          setCurrentNodeData({
            ...currentNodeData,
            datasets: {
              listType: currentNodeData.datasets.listType,
              items: nodeDatasets,
            },
          });
        }

        return true;
      }
    }
    return false;
  };

  const handleRemove = async (
    preserveChildren: boolean = true
  ): Promise<void> => {
    if (selectedNode.current) {
      // Check if the selected node is the root node
      if (selectedNode.current === treeNode.root) {
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
  };

  const handleAdd = async (): Promise<void> => {
    if (selectedNode.current) {
      // Create a new node as a child of the selected node
      const newNode = selectedNode.current.createNode(
        { name: "New Child" },
        undefined,
        selectedNode.current.id
      );

      if (newNode) {
        // Add a default description dataset
        newNode.createTextDataset("Description", "New node description");
        setTreeData(treeNode.toObject());

        // Save changes to localStorage
        await saveTreeChanges();
      }
    }
  };

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
  };

  const handleNodeClick = (nodeData: TreeNodeDatum): void => {
    setIsLoading(true);
    // Store the node ID in our persistent ref
    selectedNodeId.current = nodeData.data.id;
    selectedNode.current = treeNode.recursiveDepthSearch(nodeData.data.id);

    if (selectedNode.current) {
      // Get datasets
      const nodeDatasets = selectedNode.current.getDatasets();
      setDatasets(nodeDatasets);

      // Setters
      setCurrentNodeData(nodeData.data as TreeNodeViewData);
      setName(selectedNode.current.data.name);
    }
    setIsLoading(false);
  };

  const handleAddDataset = () => {
    if (!selectedNode.current) return;

    let newDataset: Dataset | null = null;

    if (newDatasetType === "text") {
      newDataset = selectedNode.current.createTextDataset(
        newDatasetTitle,
        newDatasetContent
      );
    } else if (newDatasetType === "image") {
      newDataset = selectedNode.current.createImageDataset(
        newDatasetTitle,
        newDatasetContent,
        ""
      );
    } else if (newDatasetType === "url") {
      newDataset = selectedNode.current.createUrlDataset(
        newDatasetTitle,
        newDatasetContent,
        ""
      );
    }

    if (newDataset) {
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);

      // Ensure the node selection is maintained
      refreshNodeSelection();

      // Save changes
      saveTreeChanges();

      // Reset form
      setNewDatasetTitle("");
      setNewDatasetContent("");
      setShowAddDatasetModal(false);
    }
  };

  // Edit dataset function
  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setNewDatasetType(dataset.type as "text" | "image" | "url");
    setNewDatasetTitle(dataset.title);

    // Set content based on dataset type
    if (dataset.type === "text") {
      setNewDatasetContent((dataset as TextDataset).content);
    } else if (dataset.type === "image") {
      setNewDatasetContent((dataset as ImageDataset).url);
    } else if (dataset.type === "url") {
      setNewDatasetContent((dataset as UrlDataset).url);
    }

    setShowEditDatasetModal(true);
  };

  // Save edited dataset
  const handleSaveEditedDataset = () => {
    if (!selectedNode.current || !editingDataset) return;

    // Create updated dataset object
    const updates: Partial<Dataset> = {
      title: newDatasetTitle,
    };

    // Add type-specific properties
    if (editingDataset.type === "text") {
      (updates as Partial<TextDataset>).content = newDatasetContent;
    } else if (editingDataset.type === "image") {
      (updates as Partial<ImageDataset>).url = newDatasetContent;
    } else if (editingDataset.type === "url") {
      (updates as Partial<UrlDataset>).url = newDatasetContent;
    }

    // Update the dataset in the node
    const success = selectedNode.current.updateDataset(
      editingDataset.id,
      updates
    );

    if (success) {
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);

      // Ensure the node selection is maintained
      refreshNodeSelection();

      // Save changes
      saveTreeChanges();

      // Reset form and close modal
      setEditingDataset(null);
      setShowEditDatasetModal(false);
    }
  };

  // Simplified dataset deletion function
  const handleDeleteDataset = (datasetId: string) => {
    if (!selectedNode.current) return;

    // Simply delete the dataset without special handling
    const success = selectedNode.current.deleteDataset(datasetId);

    if (success) {
      // Update tree data
      const updatedTreeData = treeNode.toObject();
      setTreeData(updatedTreeData);

      // Ensure the node selection is maintained
      refreshNodeSelection();

      // Save changes
      saveTreeChanges();
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    datasetId: string
  ) => {
    console.log("Drag start:", datasetId);
    // Set the dataTransfer data for Firefox support
    e.dataTransfer.setData("text/plain", datasetId);
    // Make the drag image transparent (optional)
    const dragImage = document.createElement("div");
    dragImage.style.opacity = "0";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    document.body.removeChild(dragImage);

    // Set effective allowed effects
    e.dataTransfer.effectAllowed = "move";

    setDraggedDatasetId(datasetId);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    datasetId: string
  ) => {
    e.preventDefault(); // Required to allow dropping
    e.dataTransfer.dropEffect = "move";

    // Set the current dataset being dragged over for visual feedback
    if (dragOverDatasetId !== datasetId) {
      setDragOverDatasetId(datasetId);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-100", "bg-opacity-50");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-100", "bg-opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedDatasetId(null);
    setDragOverDatasetId(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetDatasetId: string
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-100", "bg-opacity-50");

    console.log("Drop event:", {
      dragged: draggedDatasetId,
      target: targetDatasetId,
    });

    if (
      !draggedDatasetId ||
      !selectedNode.current ||
      draggedDatasetId === targetDatasetId
    ) {
      return;
    }

    // Find positions
    const datasets = selectedNode.current.getDatasets();
    console.log(
      "Available datasets:",
      datasets.map((d) => ({ id: d.id, title: d.title }))
    );

    const draggedIndex = datasets.findIndex((d) => d.id === draggedDatasetId);
    const targetIndex = datasets.findIndex((d) => d.id === targetDatasetId);

    console.log("Reordering from index", draggedIndex, "to index", targetIndex);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder in the node
      const success = selectedNode.current.reorderDataset(
        draggedDatasetId,
        targetIndex
      );
      console.log("Reorder success:", success);

      if (success) {
        // Update tree data
        const updatedTreeData = treeNode.toObject();
        setTreeData(updatedTreeData);

        // Ensure the node selection is maintained
        refreshNodeSelection();

        // Save changes
        saveTreeChanges();
      }
    } else {
      // If we can't find the indices, try to get the datasets directly from the currentNodeData
      if (
        currentNodeData &&
        currentNodeData.datasets &&
        Array.isArray(currentNodeData.datasets.items)
      ) {
        const uiDatasets = currentNodeData.datasets.items;
        console.log(
          "Trying with UI datasets:",
          uiDatasets.map((d) => ({ id: d.id, title: d.title }))
        );

        const draggedUIIndex = uiDatasets.findIndex(
          (d) => d.id === draggedDatasetId
        );
        const targetUIIndex = uiDatasets.findIndex(
          (d) => d.id === targetDatasetId
        );

        console.log("UI indices:", { draggedUIIndex, targetUIIndex });

        if (draggedUIIndex !== -1 && targetUIIndex !== -1) {
          // Use the UI indices to reorder in the TreeNode
          const success = selectedNode.current.reorderDataset(
            draggedDatasetId,
            targetUIIndex
          );
          console.log("UI reorder success:", success);

          if (success) {
            // Update tree data
            const updatedTreeData = treeNode.toObject();
            setTreeData(updatedTreeData);

            // Ensure the node selection is maintained
            refreshNodeSelection();

            // Save changes
            saveTreeChanges();
          }
        }
      }
    }

    setDraggedDatasetId(null);
    setDragOverDatasetId(null);
  };

  // Function to render dataset content based on type
  const renderDatasetContent = (dataset: Dataset) => {
    switch (dataset.type) {
      case "text":
        console.log("Rendering markdown:", (dataset as TextDataset).content);
        return (
          <div className="ml-8 markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={{
                // Headings
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-3 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-sm font-bold mt-2 mb-1" {...props} />,
                h5: ({node, ...props}) => <h5 className="text-xs font-bold mt-2 mb-1" {...props} />,
                
                // Lists
                ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
                li: ({node, ...props}) => <li className="ml-2 my-1" {...props} />,
                
                // Paragraphs and text
                p: ({node, ...props}) => <p className="my-2" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                del: ({node, ...props}) => <del className="line-through" {...props} />,
                
                // Blockquote
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 pl-4 italic text-gray-600 my-2" {...props} />
                ),
                
                // Code blocks with syntax highlighting
                code: ({node, inline, className, children, ...props}: CodeProps) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match ? match[1] : 'text'}
                      PreTag="div"
                      className="rounded-md my-3"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-red-500 font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                
                // Table
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-300" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200" {...props} />,
                tr: ({node, ...props}) => <tr className="divide-x divide-gray-200" {...props} />,
                th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase" {...props} />,
                td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />,
                
                // Links
                a: ({node, ...props}) => (
                  <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                
                // Images
                img: ({node, ...props}) => (
                  <img className="max-w-full h-auto my-2 rounded" alt={props.alt || ""} {...props} />
                ),
                
                // Horizontal rule
                hr: ({node, ...props}) => <hr className="my-4 border-t border-gray-300" {...props} />
              }}
            >
              {(dataset as TextDataset).content}
            </ReactMarkdown>
          </div>
        );
      case "image":
        return (
          <div className="ml-8 mt-2">
            <img
              src={(dataset as ImageDataset).url}
              alt={(dataset as ImageDataset).altText || dataset.title}
              className="max-w-[180px] max-h-[120px] object-contain border border-gray-200"
            />
          </div>
        );
      case "url":
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
    <section className="flex flex-col lg:flex-row justify-center mx-5 mt-10 space-y-6 lg:space-y-0 lg:space-x-4 min-h-[32rem] lg:h-[calc(100vh-12rem)]">
      <div className="w-full lg:w-2/3 border border-gray-300 rounded overflow-hidden h-96 lg:h-full">
        <Tree
          orientation="vertical"
          onNodeClick={handleNodeClick}
          data={treeData}
          collapsible={false}
          translate={{ x: 250, y: 100 }}
        />
      </div>
      <aside className="w-full lg:w-1/3 bg-cool-blue p-4 rounded flex flex-col min-h-[32rem] lg:h-full lg:max-h-full overflow-y-auto lg:overflow-hidden">
        <h2 className="mb-4 font-mono text-lg font-semibold text-center">
          Node Info
        </h2>
        {isLoading ? (
          <center className="my-auto">
            <BounceLoader color="#ffa857" />
          </center>
        ) : (
          currentNodeData && (
            <div className="flex flex-col h-full overflow-hidden">
              {!isEdit ? (
                <>
                  <p className="text-lg font-medium">
                    Name: {currentNodeData.name}
                  </p>

                  {/* Datasets section - scrollable */}
                  <div className="mt-4 flex-grow overflow-y-auto">
                    {currentNodeData.datasets.items.map((dataset) => {
                      return (
                        <div
                          key={dataset.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, dataset.id)}
                          onDragOver={(e) => handleDragOver(e, dataset.id)}
                          onDrop={(e) => handleDrop(e, dataset.id)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleDragEnd}
                          className={`mb-6 cursor-move rounded border border-transparent transition-colors duration-200 ${
                            dragOverDatasetId === dataset.id
                              ? "border-blue-500 bg-blue-100 bg-opacity-50"
                              : ""
                          } ${
                            draggedDatasetId === dataset.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-gray-500 select-none">≡</div>
                            <h3 className="font-medium">{dataset.title}</h3>
                            <div className="ml-auto flex items-center">
                              <button
                                onClick={() => handleEditDataset(dataset)}
                                className="text-gray-500 hover:text-blue-500 mr-2"
                                aria-label="Edit dataset"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteDataset(dataset.id);
                                }}
                                className="text-gray-500 hover:text-red-500"
                                aria-label="Delete dataset"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {renderDatasetContent(dataset)}
                        </div>
                      );
                    })}

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
                          <h3 className="text-lg font-medium mb-4">
                            Add New Dataset
                          </h3>

                          <div className="mb-4">
                            <label className="block mb-2 text-sm">
                              Dataset Type
                            </label>
                            <select
                              value={newDatasetType}
                              onChange={(e) =>
                                setNewDatasetType(e.target.value as any)
                              }
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
                              onChange={(e) =>
                                setNewDatasetTitle(e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Title"
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2 text-sm">
                              {newDatasetType === "text"
                                ? "Content"
                                : newDatasetType === "image"
                                ? "Image URL"
                                : "URL"}
                            </label>
                            {newDatasetType === "text" ? (
                              <textarea
                                value={newDatasetContent}
                                onChange={(e) =>
                                  setNewDatasetContent(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md h-40 font-mono text-sm whitespace-pre"
                                placeholder="# Heading

*italic* **bold**

* List item 1
* List item 2

> Blockquote

`code`"
                              />
                            ) : (
                              <input
                                type="text"
                                value={newDatasetContent}
                                onChange={(e) =>
                                  setNewDatasetContent(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder={
                                  newDatasetType === "image"
                                    ? "Enter image URL"
                                    : "Enter URL"
                                }
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

                    {/* Edit dataset modal */}
                    {showEditDatasetModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96 max-w-full">
                          <h3 className="text-lg font-medium mb-4">
                            Edit Dataset
                          </h3>

                          <div className="mb-4">
                            <label className="block mb-2 text-sm">Title</label>
                            <input
                              type="text"
                              value={newDatasetTitle}
                              onChange={(e) =>
                                setNewDatasetTitle(e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Title"
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2 text-sm">
                              {newDatasetType === "text"
                                ? "Content"
                                : newDatasetType === "image"
                                ? "Image URL"
                                : "URL"}
                            </label>
                            {newDatasetType === "text" ? (
                              <textarea
                                value={newDatasetContent}
                                onChange={(e) =>
                                  setNewDatasetContent(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md h-24 font-mono text-sm whitespace-pre"
                                placeholder="Enter markdown content"
                              />
                            ) : (
                              <input
                                type="text"
                                value={newDatasetContent}
                                onChange={(e) =>
                                  setNewDatasetContent(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder={
                                  newDatasetType === "image"
                                    ? "Enter image URL"
                                    : "Enter URL"
                                }
                              />
                            )}
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowEditDatasetModal(false)}
                              className="px-4 py-2 border rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEditedDataset}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                              Save Changes
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
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
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
              )}
            </div>
          )
        )}
      </aside>
    </section>
  );
}
