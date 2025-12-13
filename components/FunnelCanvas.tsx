
import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  ConnectionMode,
} from 'reactflow';
import Sidebar from './Sidebar';
import CustomNode from './CustomNode';
import Toolbar from './Toolbar';
import AiModal from './AiModal';
import NodeDetailsModal from './NodeDetailsModal';
import FloatingEdge from './FloatingEdge';
import { SidebarItemType } from '../types';
import { generateFunnelFromAI } from '../aiService';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { floating: FloatingEdge }; // Registro do Floating Edge
const LOCAL_STORAGE_KEY = 'funnelboard-flow';

const FunnelCanvasContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); 
  const { project, setViewport, toObject, deleteElements, fitView } = useReactFlow();
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Clipboard State
  const [bufferedNodes, setBufferedNodes] = useState<Node[]>([]);
  const [bufferedEdges, setBufferedEdges] = useState<Edge[]>([]);

  const onOpenDetails = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
    setIsDetailsModalOpen(true);
  }, []);

  const hydrateNodes = useCallback((rawNodes: Node[]) => {
    return rawNodes.map(node => ({
      ...node,
      data: { ...node.data, onEdit: onOpenDetails }
    }));
  }, [onOpenDetails]);

  // Carregar dados iniciais
  useEffect(() => {
    const restoreFlow = async () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const flow = storedData ? JSON.parse(storedData) : null;

        if (flow && flow.nodes && flow.nodes.length > 0) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
          setNodes(hydrateNodes(flow.nodes || []));
          setEdges(flow.edges || []);
          setViewport({ x, y, zoom });
        } else {
          // --- ESTADO INICIAL (SE VAZIO) ---
          // Cria um nó inicial para o usuário não ver uma tela vazia
          const initialNode: Node = {
            id: 'start-node-1',
            type: 'custom',
            position: { x: 500, y: 300 },
            data: {
              label: 'Comece Aqui',
              type: 'traffic-google',
              category: 'traffic',
              iconName: 'MousePointerClick',
              description: 'Arraste elementos do menu lateral para começar a construir seu funil!',
              items: [],
              onEdit: onOpenDetails
            }
          };
          setNodes([initialNode]);
          setViewport({ x: 0, y: 0, zoom: 1 });
          // Ajusta a câmera após renderizar
          setTimeout(() => fitView({ padding: 0.5 }), 100);
        }
      } catch (error) {
        console.error("Erro ao restaurar funil:", error);
        // Em caso de erro crítico (JSON corrompido), limpa e inicia novo
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };
    restoreFlow();
  }, []); // Executa apenas uma vez no mount

  // Ao conectar, cria uma floating edge
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'floating', // Usa o nosso componente customizado
      animated: false, // A animação é feita via CSS no componente
    }, eds));
  }, [setEdges]);

  // Remover ao clicar na linha
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    deleteElements({ edges: [edge] });
  }, [deleteElements]);

  const onSaveDetails = (newLabel: string, newDescription: string) => {
    if (!editingNodeId) return;
    setNodes((nds) => nds.map((node) => node.id === editingNodeId ? { ...node, data: { ...node.data, label: newLabel, description: newDescription } } : node));
  };

  const editingNode = nodes.find(n => n.id === editingNodeId);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const typeData = event.dataTransfer.getData('application/reactflow');
      if (!typeData) return;
      
      try {
        const item: SidebarItemType = JSON.parse(typeData);
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!reactFlowBounds) return;

        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${item.type}-${Date.now()}`,
          type: 'custom',
          position,
          data: { 
            label: item.label, 
            category: item.category, 
            iconName: item.iconName, 
            type: item.type, 
            items: [], 
            description: '', 
            onEdit: onOpenDetails 
          },
        };
        setNodes((nds) => nds.concat(newNode));
      } catch (e) {
        console.error("Erro no Drop:", e);
      }
    },
    [project, setNodes, onOpenDetails]
  );

  const onSave = useCallback(() => {
    const flow = toObject();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flow));
    // Feedback visual sutil em vez de alert
    const btn = document.activeElement as HTMLButtonElement;
    if(btn) {
        const originalText = btn.innerText;
        btn.innerText = "Salvo!";
        setTimeout(() => btn.innerText = originalText, 1000);
    }
  }, [toObject]);

  const onImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const flow = JSON.parse(content);
        
        if (flow) {
          if (flow.nodes) {
             setNodes(hydrateNodes(flow.nodes));
          }
          if (flow.edges) {
             setEdges(flow.edges);
          }
          if (flow.viewport) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setViewport({ x, y, zoom });
          } else {
             setTimeout(() => fitView({ padding: 0.2 }), 100);
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flow));
        }
      } catch (error) {
        alert("Erro ao importar arquivo: JSON inválido.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [setNodes, setEdges, setViewport, hydrateNodes, fitView]);

  const onClear = useCallback(() => {
    if(!window.confirm("Tem certeza que deseja apagar todo o funil?")) return;
    setNodes([]);
    setEdges([]);
    setViewport({ x: 0, y: 0, zoom: 1 });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [setNodes, setEdges, setViewport]);

  const onDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }
    deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }, [nodes, edges, deleteElements]);

  const onExport = useCallback(() => {
    const flow = toObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "funnel_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [toObject]);

  // Função para alinhar nós selecionados
  const onAlignNodes = useCallback((direction: 'horizontal' | 'vertical') => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 2) {
      alert("Selecione pelo menos 2 itens para alinhar.");
      return;
    }

    let averagePos = 0;
    if (direction === 'horizontal') {
       averagePos = selectedNodes.reduce((acc, curr) => acc + curr.position.y, 0) / selectedNodes.length;
    } else {
       averagePos = selectedNodes.reduce((acc, curr) => acc + curr.position.x, 0) / selectedNodes.length;
    }

    setNodes((nds) => 
       nds.map((node) => {
         if (node.selected) {
           return {
             ...node,
             position: {
               x: direction === 'vertical' ? averagePos : node.position.x,
               y: direction === 'horizontal' ? averagePos : node.position.y,
             }
           };
         }
         return node;
       })
    );

  }, [nodes, setNodes]);

  const handleGenerateAi = useCallback(async (prompt: string) => {
    try {
        const { nodes: newNodes, edges: newEdges } = await generateFunnelFromAI(prompt, nodes);
        setNodes(hydrateNodes(newNodes));
        
        const styledEdges = (newEdges || []).map((e: any) => ({
             ...e,
             type: 'floating',
        }));
        setEdges(styledEdges);

        setTimeout(() => fitView({ padding: 0.2, duration: 1000 }), 100);
    } catch (error) {
        alert("Erro na IA. Tente novamente.");
    }
  }, [nodes, setNodes, setEdges, fitView, hydrateNodes]);

  // --- COPY & PASTE & DUPLICATE LOGIC ---
  const onCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const edgesToCopy = edges.filter(e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));
    
    setBufferedNodes(selectedNodes);
    setBufferedEdges(edgesToCopy);
  }, [nodes, edges]);

  const onPaste = useCallback(() => {
    if (bufferedNodes.length === 0) return;

    const idMap: Record<string, string> = {};
    const newNodes = bufferedNodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: true,
        data: { ...node.data }, // Shallow copy data
      };
    });

    const newEdges = bufferedEdges.map((edge) => ({
      ...edge,
      id: `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
      selected: true,
    }));

    // Deselect current nodes
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(hydrateNodes(newNodes)));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })).concat(newEdges));

  }, [bufferedNodes, bufferedEdges, setNodes, setEdges, hydrateNodes]);

  const onDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
        alert("Selecione itens para duplicar.");
        return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const edgesToCopy = edges.filter(e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));

    const idMap: Record<string, string> = {};
    const newNodes = selectedNodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        selected: true,
        data: { ...node.data },
      };
    });

    const newEdges = edgesToCopy.map((edge) => ({
      ...edge,
      id: `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
      selected: true,
    }));

    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(hydrateNodes(newNodes)));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })).concat(newEdges));

  }, [nodes, edges, setNodes, setEdges, hydrateNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        onCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        onPaste();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onPaste]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar 
        onOpenAi={() => setIsAiModalOpen(true)}
      />
      
      <div 
        className="flex-1 h-full relative bg-slate-100" 
        ref={reactFlowWrapper}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Toolbar 
            onSave={onSave} onClear={onClear} 
            onExport={onExport} onDeleteSelected={onDeleteSelected} 
            onAlign={onAlignNodes}
            onImport={onImport}
            onDuplicate={onDuplicate}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          panOnDrag={[1, 2]}
          selectionOnDrag={true}
          selectionKeyCode={null}
          panOnScroll={true}
          interactionWidth={50}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode={['Backspace', 'Delete']}
          style={{ width: '100%', height: '100%' }}
        >
          <Controls />
          <Background color="#94a3b8" gap={20} size={1} variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
      <AiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onGenerate={handleGenerateAi} hasContext={nodes.length > 0} />
      <NodeDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onSave={onSaveDetails}
        initialLabel={editingNode?.data?.label || ''}
        initialDescription={editingNode?.data?.description || ''}
        nodeTypeLabel={editingNode ? editingNode.data.category : ''}
      />
    </div>
  );
};

const FunnelCanvas = () => (
  <ReactFlowProvider>
    <FunnelCanvasContent />
  </ReactFlowProvider>
);

export default FunnelCanvas;
