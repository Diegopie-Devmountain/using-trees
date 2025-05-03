import Tree from 'react-d3-tree';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';


export function TreeContainer({ treeNode }) {

  const selectedNode = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [treeData, setSetTreeData] = useState(treeNode.toObject());

  const [currentNodeData, setCurrentNodeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = (preserveChildren = true) => {
    selectedNode.current.removeChild(selectedNode.current, preserveChildren);
    setSetTreeData(treeNode.toObject());
  }

  const handleAdd = () => {
    selectedNode.current.createNode({ id: uuidv4(), name: 'New Child', description: 'new node' }, null, selectedNode.current.data.id);
    setSetTreeData(treeNode.toObject());

    // setCurrentNodeData({...currentNodeData, children: selectedNode.current.children})
  }

  const handleSave = () => {
    selectedNode.current.editNode({ name, description });
    setSetTreeData(treeNode.toObject());
    setIsEdit(false)
    // setCurrentNodeData({...currentNodeData, children: selectedNode.current.children})
  }

  const [isEdit, setIsEdit] = useState(false);

  return (
    <section className='flex flex-col lg:flex-row justify-center mx-5 mt-10 space-y-6 lg:space-y-0 lg:space-x-4'>
      <div id="" className="w-full lg:w-2/3" style={{ height: '28em', border: 'solid' }}>
        <Tree
          orientation='vertical'
          onNodeClick={(e) => {
            setIsLoading(true);
            // console.log(e);
            // use tree nod to find the actual node
            console.log(e.data.id);
            selectedNode.current = treeNode.recursiveDepthSearch(e.data.id);
            console.log(selectedNode.current.data.name);

            // Setters
            setCurrentNodeData(e.data);
            setIsLoading(false);
            setName(selectedNode.current.data.name);
            setDescription(selectedNode.current.data.description);
          }}
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
                    onClick={handleRemove}
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
                    {currentNodeData.children.map(child => child.name).join(', ')}
                  </p>
              }
            </div>
          </article>
        }
      </aside>
    </section>
  )
}