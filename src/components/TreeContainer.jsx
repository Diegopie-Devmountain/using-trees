import Tree from 'react-d3-tree';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';

export function TreeContainer({ treeNode }) {

  const [treeData, setSetTreeData] = useState(treeNode.toObject());
  const [currentNode, setCurrentNode] = useState(null);
  const classNode = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = () => {
    classNode.removeChild(currentNode.current, true);
    setSetTreeData(classNode.toObject());
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
            classNode.current = treeNode.recursiveDepthSearch(e.data.id);
            console.log(classNode.current.data.name);
            setCurrentNode(e.data);
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
          currentNode &&
          <article className='mx-8'>
            <p className='capitalize'>Name: {currentNode.name} | id: {currentNode.id}</p>
            <p className='mt-3 capitalize text-sm'>{currentNode.description}</p>
            <article className='flex gap-2 flex-wrap justify-center'>
              <button onClick={handleRemove} className='btn lg:w-2/5 mt-5'>Remove</button>
              <button className='btn lg:w-2/5 mt-5'>Add Child</button>
              <button className='btn lg:w-2/5 mt-5'>Edit</button>
            </article>
            <div className='mb-4'>
              <h3 className='mt-8 mb-4 font-mono text-lg font-semibold text-center'>Children</h3>
              {
                currentNode.children.map(child => {
                  return (
                    <article key={child.__rd3t.id}>
                      <p className='capitalize'>Name: {child.name} | id: {child.id}</p>
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