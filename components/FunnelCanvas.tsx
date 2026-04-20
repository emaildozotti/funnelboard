
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
  Viewport,
} from 'reactflow';
import Sidebar from './Sidebar';
import CustomNode from './CustomNode';
import Toolbar from './Toolbar';
import AiModal from './AiModal';
import NodeDetailsModal from './NodeDetailsModal';
import ApiKeyModal from './ApiKeyModal';
import HistoryModal from './HistoryModal';
import FloatingEdge from './FloatingEdge';
import { SidebarItemType, HistoryEntry } from '../types';
import { generateFunnelFromAI } from '../aiService';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { floating: FloatingEdge }; 
const LOCAL_STORAGE_KEY = 'funnelboard-flow';
const HISTORY_STORAGE_KEY = 'funnelboard-history';

const FunnelCanvasContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); 
  const { project, setViewport, toObject, deleteElements, fitView, getViewport } = useReactFlow();
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Histórico State
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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

  // Carregar dados iniciais e Histórico
  useEffect(() => {
    const restoreFlow = async () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }

        const flow = storedData ? JSON.parse(storedData) : null;

        if (flow && flow.nodes && flow.nodes.length > 0) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};
          setNodes(hydrateNodes(flow.nodes || []));
          setEdges(flow.edges || []);
          setViewport({ x, y, zoom });
        } else {
          // --- ESTADO INICIAL (SE VAZIO) ---
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
          setTimeout(() => fitView({ padding: 0.5 }), 100);
        }
      } catch (error) {
        console.error("Erro ao restaurar funil:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };
    restoreFlow();
  }, []); 

  // --- GERENCIAMENTO DE HISTÓRICO ---
  const saveToHistory = useCallback((type: 'ai' | 'manual', prompt?: string) => {
    const snapshot = {
        nodes: nodes.map(n => ({...n})), 
        edges: edges.map(e => ({...e})),
        viewport: getViewport()
    };

    const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type,
        prompt,
        snapshot
    };

    setHistory(prev => {
        const newHistory = [newEntry, ...prev].slice(0, 20);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
    });
  }, [nodes, edges, getViewport]);

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
      setNodes(hydrateNodes(entry.snapshot.nodes));
      setEdges(entry.snapshot.edges);
      setViewport(entry.snapshot.viewport);
      setTimeout(() => onSave(), 100);
  }, [setNodes, setEdges, setViewport, hydrateNodes]);

  // --- END HISTÓRICO ---

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'floating', 
      animated: false,
    }, eds));
  }, [setEdges]);

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

  const createImageNode = useCallback((imageUrl: string, screenX: number, screenY: number) => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const position = reactFlowBounds
      ? project({ x: screenX - reactFlowBounds.left, y: screenY - reactFlowBounds.top })
      : project({ x: screenX, y: screenY });
    const newNode: Node = {
      id: `image-node-${Date.now()}`,
      type: 'custom',
      position,
      style: { width: 280, height: 200 },
      data: {
        label: 'Imagem',
        type: 'image-node',
        category: 'image',
        iconName: 'Image',
        imageUrl,
        items: [],
        description: '',
        onEdit: onOpenDetails,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [project, reactFlowWrapper, onOpenDetails, setNodes]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Imagem arrastada do sistema de arquivos
      const files = event.dataTransfer.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageUrl = ev.target?.result as string;
          createImageNode(imageUrl, event.clientX, event.clientY);
        };
        reader.readAsDataURL(files[0]);
        return;
      }

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
    const btn = document.activeElement as HTMLButtonElement;
    if(btn && btn.tagName === 'BUTTON') {
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
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "funnel_export.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [toObject]);

  const onExportImage = useCallback(async (format: 'png' | 'jpg' | 'pdf') => {
    fitView({ padding: 0.12, duration: 0 });

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 80));

    const element = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLElement;
    const wrapper = reactFlowWrapper.current?.querySelector('.react-flow') as HTMLElement;
    const target = wrapper || element;
    if (!target) return;

    const bg = format === 'jpg' ? '#ffffff' : '#f1f5f9';
    const filename = `funil-${new Date().toISOString().slice(0,10)}`;

    try {
      if (format === 'png') {
        const dataUrl = await toPng(target, { backgroundColor: bg, pixelRatio: 2 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}.png`;
        a.click();
      } else if (format === 'jpg') {
        const dataUrl = await toJpeg(target, { backgroundColor: bg, quality: 0.95, pixelRatio: 2 });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}.jpg`;
        a.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(target, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => { img.onload = r; });
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const orientation = w > h ? 'landscape' : 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h], hotfixes: ['px_scaling'] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
        pdf.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error('Erro ao exportar imagem:', err);
      alert('Erro ao exportar. Tente novamente.');
    }
  }, [fitView, reactFlowWrapper]);

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
        saveToHistory('ai', prompt);

        const { nodes: newNodes, edges: newEdges } = await generateFunnelFromAI(prompt, nodes);
        
        setNodes(hydrateNodes(newNodes));
        
        const styledEdges = (newEdges || []).map((e: any) => ({
             ...e,
             type: 'floating',
        }));
        setEdges(styledEdges);

        setTimeout(() => fitView({ padding: 0.2, duration: 1000 }), 100);
        setTimeout(() => onSave(), 500);

    } catch (error: any) {
        if (error.message === "MISSING_API_KEY") {
            setIsApiKeyModalOpen(true);
            alert("Por favor, configure sua API Key do Google Gemini para usar a IA.");
        } else {
            alert("Erro na IA: " + error.message);
        }
    }
  }, [nodes, setNodes, setEdges, fitView, hydrateNodes, saveToHistory, onSave]);

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
        data: { ...node.data }, 
      };
    });

    const newEdges = bufferedEdges.map((edge) => ({
      ...edge,
      id: `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
      selected: true,
    }));

    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(hydrateNodes(newNodes)));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })).concat(newEdges));

  }, [bufferedNodes, bufferedEdges, setNodes, setEdges, hydrateNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        onCopy();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const imageUrl = ev.target?.result as string;
            const wrapper = reactFlowWrapper.current;
            const bounds = wrapper?.getBoundingClientRect();
            const cx = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
            const cy = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;
            createImageNode(imageUrl, cx, cy);
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // Sem imagem no clipboard: colar nós copiados
      onPaste();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, [onCopy, onPaste, createImageNode, reactFlowWrapper]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar 
        onOpenAi={() => setIsAiModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />
      
      <div 
        className="flex-1 h-full relative bg-slate-100" 
        ref={reactFlowWrapper}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Toolbar
            onSave={onSave} onClear={onClear}
            onExport={onExport} onExportImage={onExportImage}
            onDeleteSelected={onDeleteSelected}
            onAlign={onAlignNodes}
            onImport={onImport}
            onConfigApiKey={() => setIsApiKeyModalOpen(true)}
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
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} history={history} onRestore={restoreFromHistory} />
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
