
import React, { memo, useState, useRef, useEffect } from 'react';
import { NodeProps, NodeToolbar, useReactFlow, Position, Handle, NodeResizer } from 'reactflow';
import { Trash2, Edit, Plus, X, Maximize2, StickyNote } from 'lucide-react';
import { IconMap, CATEGORY_LABELS } from '../constants';
import { FunnelNodeData } from '../types';

const CustomNode = ({ id, data, selected }: NodeProps<FunnelNodeData>) => {
  const { deleteElements, setNodes } = useReactFlow();
  
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(data.label);
  const labelInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isListType = ['action-form', 'action-quiz', 'crm-task'].includes(data.type);
  const items = data.items || [];
  const hasDescription = data.description && data.description.trim().length > 0;
  const isTraffic = data.category === 'traffic';
  const isTextNode = data.category === 'text';

  const IconComponent = IconMap[data.iconName] || IconMap.MousePointerClick;
  
  // --- NODE RESIZER PARA TEXTOS ---
  const isTitle = data.type === 'text-title';
  const isNote = data.type === 'text-area';

  useEffect(() => {
    setLabelInput(data.label);
  }, [data.label]);

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
        labelInputRef.current.focus();
        labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  const onDeleteNode = () => deleteElements({ nodes: [{ id }] });
  const onEditLabel = () => setIsEditingLabel(true);
  
  const onOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onEdit) data.onEdit(id);
  };

  const onSaveLabel = () => {
    setIsEditingLabel(false);
    if (labelInput.trim() === "") {
        setLabelInput(data.label);
        return;
    }
    updateNodeData({ label: labelInput });
  };

  const updateNodeData = (newData: Partial<FunnelNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)
    );
  };

  const onAddItem = () => updateNodeData({ items: [...items, 'Novo Item'] });
  const onUpdateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    updateNodeData({ items: newItems });
  };
  const onDeleteItem = (index: number) => updateNodeData({ items: items.filter((_, i) => i !== index) });
  const onKeyDownLabel = (e: React.KeyboardEvent) => { 
      // Para textarea (notas), Enter permite nova linha
      if (!isNote && e.key === 'Enter') onSaveLabel(); 
  };

  // --- RENDERIZAÇÃO ESPECÍFICA PARA TEXTO (Títulos e Notas) ---
  if (isTextNode) {
    return (
        <>
            <NodeResizer minWidth={100} minHeight={40} isVisible={selected} />
            <NodeToolbar isVisible={selected} position={Position.Top} className="mb-2 flex gap-2">
                 <button onClick={onEditLabel} className="bg-slate-600 text-white p-1.5 rounded-md shadow-md hover:bg-slate-700 transition-colors" title="Editar Texto">
                   <Edit size={14} />
                 </button>
                 <button onClick={onDeleteNode} className="bg-red-500 text-white p-1.5 rounded-md shadow-md hover:bg-red-600 transition-colors" title="Excluir">
                   <Trash2 size={14} />
                 </button>
            </NodeToolbar>

            <div className={`w-full h-full flex flex-col ${isTitle ? 'bg-transparent' : 'bg-[#fff9c4] border border-yellow-200 shadow-sm rounded-lg p-2'}`}>
                {isEditingLabel ? (
                    isTitle ? (
                        <input
                            ref={labelInputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            onBlur={onSaveLabel}
                            onKeyDown={onKeyDownLabel}
                            className="w-full h-full bg-transparent text-2xl font-black text-slate-800 outline-none border-b-2 border-indigo-500"
                        />
                    ) : (
                        <textarea
                            ref={labelInputRef as React.RefObject<HTMLTextAreaElement>}
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            onBlur={onSaveLabel}
                            className="w-full h-full bg-transparent text-sm text-slate-700 outline-none resize-none font-medium leading-relaxed"
                        />
                    )
                ) : (
                    <div 
                        onDoubleClick={onEditLabel}
                        className={`w-full h-full cursor-text ${isTitle ? 'text-2xl font-black text-slate-800 flex items-center' : 'text-sm text-slate-700 whitespace-pre-wrap leading-relaxed'}`}
                    >
                        {data.label}
                    </div>
                )}
            </div>
        </>
    )
  }

  // --- RENDERIZAÇÃO PADRÃO (Cards de Funil) ---
  
  // --- ESTILOS DE MARCA (BRANDING) PARA TRÁFEGO ---
  const BRAND_STYLES: Record<string, string> = {
    'traffic-fb': 'bg-[#1877F2] text-white border-transparent',
    'traffic-insta': 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white border-transparent',
    'traffic-google': 'bg-white border-slate-200 text-slate-700 shadow-sm', // Google clean
    'traffic-youtube': 'bg-[#FF0000] text-white border-transparent',
    'traffic-tiktok': 'bg-black text-white border-transparent',
    'traffic-linkedin': 'bg-[#0077B5] text-white border-transparent',
    'traffic-email': 'bg-amber-500 text-white border-transparent',
    'action-whatsapp': 'bg-[#25D366] text-white border-transparent', // WhatsApp Action (Chat)
    'action-whatsapp-btn': 'bg-[#075E54] text-white border-2 border-[#25D366]', // Botão WhatsApp (Dark Green + Border)
    'action-phone': 'bg-slate-700 text-white border-transparent', // Telefone/Ligação
  };

  const isBrandType = isTraffic || 
                      data.type === 'action-whatsapp' || 
                      data.type === 'action-whatsapp-btn' || 
                      data.type === 'action-phone';

  // --- ESTILOS PADRÃO (VERTICAL) ---
  let containerStyle = '';
  let iconContainerStyle = '';
  let labelStyle = '';

  if (isBrandType) {
    // Estilo Compacto / Marca
    const brandClass = BRAND_STYLES[data.type] || 'bg-slate-800 text-white border-transparent';
    const isGoogle = data.type === 'traffic-google';
    
    containerStyle = `
      min-w-[80px] max-w-[120px] p-2 rounded-2xl shadow-md border-2 transition-all duration-200 flex flex-col items-center gap-1
      ${brandClass}
      ${selected ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-xl scale-105' : 'hover:scale-105'}
    `;
    iconContainerStyle = isGoogle ? 'text-red-500' : 'text-white'; // Ajuste específico
    labelStyle = `text-[10px] font-bold text-center leading-tight ${isGoogle ? 'text-slate-600' : 'text-white/90'}`;

  } else {
    // Estilo Vertical Padrão (Card)
    let borderColor = 'border-slate-200';
    let accentColor = 'bg-slate-100 text-slate-500';

    if (data.type === 'decision-yes') {
      borderColor = 'border-green-400';
      accentColor = 'bg-green-100 text-green-600';
    } else if (data.type === 'decision-no') {
      borderColor = 'border-red-400';
      accentColor = 'bg-red-100 text-red-600';
    } else {
      switch (data.category) {
        case 'page':
          borderColor = 'border-emerald-400';
          accentColor = 'bg-emerald-50 text-emerald-600';
          break;
        case 'action':
          borderColor = 'border-amber-400';
          accentColor = 'bg-amber-50 text-amber-600';
          break;
        case 'crm':
          borderColor = 'border-cyan-400';
          accentColor = 'bg-cyan-50 text-cyan-600';
          break;
        case 'decision':
          borderColor = 'border-purple-400';
          accentColor = 'bg-purple-50 text-purple-600';
          break;
        default:
          borderColor = 'border-slate-200';
          accentColor = 'bg-slate-50 text-slate-500';
      }
    }

    containerStyle = `
      min-w-[130px] max-w-[160px] bg-white rounded-xl shadow-sm border-b-4 transition-all duration-200 flex flex-col items-center
      ${borderColor} border-x border-t border-slate-100
      ${selected ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'}
    `;
    iconContainerStyle = `p-2 rounded-full mb-1 mt-3 ${accentColor}`;
    labelStyle = 'text-xs font-bold text-slate-700 text-center px-2 pb-3';
  }

  // Handles invisíveis mas clicáveis
  const handleCommonStyle = {
    background: 'transparent',
    border: 'none',
    width: '100%',
    height: '100%',
    zIndex: 10,
    borderRadius: 0,
  };
  const hSize = '16px'; 

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="mb-2 flex gap-2">
        <button onClick={onOpenDetails} className="bg-indigo-500 text-white p-1.5 rounded-md shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-1 px-2" title="Detalhes">
          <Maximize2 size={14} /><span className="text-[10px] font-bold">Detalhes</span>
        </button>
        <button onClick={onEditLabel} className="bg-slate-600 text-white p-1.5 rounded-md shadow-md hover:bg-slate-700 transition-colors" title="Editar">
          <Edit size={14} />
        </button>
        <button onClick={onDeleteNode} className="bg-red-500 text-white p-1.5 rounded-md shadow-md hover:bg-red-600 transition-colors" title="Excluir">
          <Trash2 size={14} />
        </button>
      </NodeToolbar>

      {/* Handles */}
      <Handle type="target" position={Position.Top} style={{ ...handleCommonStyle, height: hSize, width: '100%', top: `-${parseInt(hSize)/2}px`, left: 0, transform: 'none', opacity: 0 }} id="t" />
      <Handle type="source" position={Position.Top} style={{ ...handleCommonStyle, height: hSize, width: '100%', top: `-${parseInt(hSize)/2}px`, left: 0, transform: 'none', opacity: 0 }} id="t-src" />
      <Handle type="source" position={Position.Bottom} style={{ ...handleCommonStyle, height: hSize, width: '100%', bottom: `-${parseInt(hSize)/2}px`, top: 'auto', left: 0, transform: 'none', opacity: 0 }} id="b" />
      <Handle type="target" position={Position.Bottom} style={{ ...handleCommonStyle, height: hSize, width: '100%', bottom: `-${parseInt(hSize)/2}px`, top: 'auto', left: 0, transform: 'none', opacity: 0 }} id="b-tgt" />
      <Handle type="target" position={Position.Left} style={{ ...handleCommonStyle, width: hSize, height: '100%', left: `-${parseInt(hSize)/2}px`, top: 0, transform: 'none', opacity: 0 }} id="l" />
      <Handle type="source" position={Position.Left} style={{ ...handleCommonStyle, width: hSize, height: '100%', left: `-${parseInt(hSize)/2}px`, top: 0, transform: 'none', opacity: 0 }} id="l-src" />
      <Handle type="source" position={Position.Right} style={{ ...handleCommonStyle, width: hSize, height: '100%', right: `-${parseInt(hSize)/2}px`, left: 'auto', top: 0, transform: 'none', opacity: 0 }} id="r" />
      <Handle type="target" position={Position.Right} style={{ ...handleCommonStyle, width: hSize, height: '100%', right: `-${parseInt(hSize)/2}px`, left: 'auto', top: 0, transform: 'none', opacity: 0 }} id="r-tgt" />

      <div
        onDoubleClick={onOpenDetails}
        className={containerStyle}
      >
        {hasDescription && (
          <div className="absolute -top-1.5 -right-1.5 text-yellow-500 bg-yellow-50 border border-yellow-200 rounded-full p-0.5 shadow-sm z-20">
            <StickyNote size={10} fill="currentColor" className="opacity-80" />
          </div>
        )}

        <div className={`shrink-0 pointer-events-auto ${iconContainerStyle}`}>
            <IconComponent size={isBrandType ? 24 : 20} strokeWidth={isBrandType ? 2 : 2.5} />
        </div>

        <div className="w-full px-1 pointer-events-auto text-center">
            {isEditingLabel ? (
              <input
                ref={labelInputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onBlur={onSaveLabel}
                onKeyDown={onKeyDownLabel}
                className="nodrag text-xs font-bold text-center text-slate-800 bg-white/90 border border-indigo-300 rounded px-1 py-0.5 w-full outline-none"
              />
            ) : (
              <span className={`block truncate w-full cursor-pointer hover:underline ${labelStyle}`}>{data.label}</span>
            )}
        </div>

        {isListType && (
          <div className="w-full px-2 pb-2 mt-2 pointer-events-auto">
             <div className="flex flex-col gap-1 bg-slate-50 rounded p-1">
                {items.length === 0 && <p className="text-[9px] text-gray-400 italic text-center">Lista vazia</p>}
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 group/item">
                    <span className="text-[9px] text-gray-400 font-mono w-2">{index + 1}</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => onUpdateItem(index, e.target.value)}
                      className="nodrag text-[10px] text-slate-600 bg-white border border-slate-200 rounded px-1 py-0.5 w-full outline-none focus:border-indigo-400"
                    />
                    <button onClick={() => onDeleteItem(index)} className="text-red-400 opacity-0 group-hover/item:opacity-100 p-0.5">
                      <X size={8} />
                    </button>
                  </div>
                ))}
                <button onClick={onAddItem} className="flex items-center justify-center gap-1 w-full py-0.5 text-[9px] font-medium text-slate-500 hover:bg-white rounded border border-transparent hover:border-slate-200">
                  <Plus size={8} /> Add
                </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(CustomNode);
