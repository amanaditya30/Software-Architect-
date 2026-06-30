import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import type { NodeProps, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Key } from 'lucide-react';

// Custom DB Node Component
const DatabaseNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 shadow-xl overflow-hidden min-w-[200px] text-xs">
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-primary" />
      
      {/* Node Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-2.5 flex items-center space-x-2 border-b border-white/5">
        <Database className="h-4.5 w-4.5 text-white" />
        <span className="font-bold text-white tracking-wide">{data.label}</span>
      </div>

      {/* Node Fields */}
      <div className="p-3 space-y-1.5 bg-slate-950/70">
        {data.fields.map((field: string, idx: number) => {
          const isPK = field.includes('(PK)');
          const isFK = field.includes('(FK)');

          return (
            <div key={idx} className="flex justify-between items-center text-slate-300 font-mono">
              <span className="truncate pr-4">{field.split(':')[0]}</span>
              <span className="flex items-center text-[10px] text-slate-500 font-semibold">
                {field.split(':')[1]?.trim() || ''}
                {isPK && <Key className="h-3 w-3 text-amber-400 ml-1" />}
                {isFK && <Key className="h-3 w-3 text-blue-400 ml-1" />}
              </span>
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-accent" />
    </div>
  );
};

interface DbErdDiagramProps {
  nodes: Node[];
  edges: Edge[];
}

export const DbErdDiagram: React.FC<DbErdDiagramProps> = ({ nodes, edges }) => {
  const nodeTypes = useMemo(() => ({ dbNode: DatabaseNode }), []);

  // Format nodes with custom dbNode type
  const formattedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      type: 'dbNode',
    }));
  }, [nodes]);

  return (
    <div className="w-full h-[450px] bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-[10px] bg-slate-900 border border-white/5 py-1 px-3 rounded-full text-slate-400 font-medium">
        Pan & Zoom Active • Interactive Schema View
      </div>
      <ReactFlow
        nodes={formattedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="text-white"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#ffffff" gap={16} size={1} />
        <Controls className="bg-slate-900 border border-white/5 rounded-xl shadow-lg" />
        <MiniMap 
          nodeColor={() => '#8b5cf6'} 
          maskColor="rgba(10, 10, 12, 0.6)"
          className="!bg-slate-900 border border-white/5 rounded-2xl hidden md:block" 
        />
      </ReactFlow>
    </div>
  );
};

export default DbErdDiagram;
