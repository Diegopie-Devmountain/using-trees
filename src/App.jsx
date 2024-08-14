
import { AnimatedTree } from 'react-tree-graph';
import { empTree } from './data/tree';
import Tree from 'react-d3-tree';
import './App.css';

function App() {

  return (
    <main>

      {/* <AnimatedTree
        data={empTree.toObject()}
        height={400}
        width={600}
      /> */}

      <div id="treeWrapper" style={{ width: '50em', height: '40em', border: 'solid' }}>
        <Tree 
        orientation='vertical' 
        onNodeClick={(e) => {
          console.log(e);
          
        }} 
        data={empTree.toObject()} 
        collapsible={false}
        />
      </div>

    </main>
  )
}

export default App
