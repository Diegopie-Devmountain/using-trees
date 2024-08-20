import { empTree, Tree } from './data/tree.js';
import './App.css';
import { useEffect, useState } from 'react';
import { TreeContainer } from './components/TreeContainer';

function App() {

  const [trees, setTrees] = useState([empTree]);

  const handleCreateTree = () => {
    setTrees([...trees, new Tree()]);
  }

  return (
    <main>
      <section>
        {trees.map(tree => <TreeContainer key={tree.id} treeNode={tree} />)}
      </section>
      <div className='mt-10 mx-16'>
        <button onClick={handleCreateTree} className='btn'>Create Tree</button>
      </div>
    </main>
  )
}

export default App
