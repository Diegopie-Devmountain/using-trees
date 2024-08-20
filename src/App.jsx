import { empTree } from './data/tree';
import Tree from 'react-d3-tree';
import './App.css';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';

function App() {

  const [currentNode, setCurrentNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main>
      <section className='flex flex-row justify-center mx-5 mt-10'>
        <article id="" style={{ width: '40em', height: '28em', border: 'solid' }}>
          <Tree
            orientation='vertical'
            onNodeClick={(e) => {
              console.log(e);
              setIsLoading(true);
              setCurrentNode(e.data);
              setIsLoading(false);
            }}
            data={empTree.toObject()}
            collapsible={false}
          />
        </article>
        <aside className='w-1/4'>
          <h2 className='mb-4 font-mono text-lg font-semibold text-center'>Node Info</h2>
          {isLoading ?
            <center className=''>
              <BounceLoader color='#ffa857' />
            </center>
            :
            currentNode &&
            <article className='mx-8'>
              <p className='capitalize'>Name: {currentNode.name} | id: { currentNode.id }</p>
              <button className='btn w-2/5 ml-4'>Remove</button>
              <button className='btn w-2/5 ml-4'>Add Child</button>
              <div>
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

    </main>
  )
}

export default App
