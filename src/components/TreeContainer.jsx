import Tree from 'react-d3-tree';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';


export function TreeContainer({ treeNode }) {

  const selectedNode = useRef(null);

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

  const handleEdit = () => {
    selectedNode.current.editNode({ name: 'New edit' });
    setSetTreeData(treeNode.toObject());
    // setCurrentNodeData({...currentNodeData, children: selectedNode.current.children})
  }

  return (
    <section className='flex flex-row justify-center mx-5 mt-10 h-[28rem]'>
      <article id="" style={{ width: '40em', height: '28em', border: 'solid' }}>
        <Tree
          orientation='vertical'
          onNodeClick={(e) => {
            setIsLoading(true);
            // console.log(e);
            // use tree nod to find the actual node
            console.log(e.data.id);
            selectedNode.current = treeNode.recursiveDepthSearch(e.data.id);
            console.log(selectedNode.current.data.name);
            setCurrentNodeData(e.data);
            setIsLoading(false);
          }}
          data={treeData}
          collapsible={false}
        />
      </article>
      <aside className='w-1/4 bg-cool-blue h-full overflow-auto'>
        <h2 className='mb-4 font-mono text-lg font-semibold text-center mt-4'>Node Info</h2>
        {isLoading ?
          <center className=''>
            <BounceLoader color='#ffa857' />
          </center>
          :
          currentNodeData &&
          <article className='mx-8'>
            <p className='capitalize'>Name: {currentNodeData.name}
              {/* <span>| id: {currentNodeData.id}</span> */}
            </p>
            <p className='mt-3 capitalize text-sm'>{currentNodeData.description}</p>
            <article className='flex gap-2 flex-wrap justify-center'>
              <button
                onClick={handleRemove}
                className='btn lg:w-2/5 mt-5'
              >Remove Node</button>
              <button
                onClick={() => handleRemove(false)}
                className='btn lg:w-2/5 mt-5'
              >Remove Branch</button>
              <button
                onClick={handleAdd}
                className='btn lg:w-2/5 mt-5'
              >Add Child</button>
              <button
                onClick={handleEdit}
                className='btn lg:w-2/5 mt-5'
              >Edit</button>
            </article>
            <div className='mb-4'>
              <h3 className='mt-8 mb-4 font-mono text-lg font-semibold text-center'>Children</h3>
              {
                currentNodeData && currentNodeData.children.map(child => {
                  return (
                    <article key={child.__rd3t.id}>
                      <p className='capitalize'>Name: {child.name}
                        {/* <span>| id: {child.id}</span> */}
                      </p>
                    </article>
                  )
                })
              }
            </div>
          </article>
        }
      </aside>
    </section>
  )
}