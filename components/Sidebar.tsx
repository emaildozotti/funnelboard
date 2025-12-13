
import React from 'react';
import { FUNNEL_ELEMENTS, IconMap, CATEGORY_LABELS } from '../constants';
import { SidebarItemType } from '../types';
import { Sparkles, MousePointer2, History } from 'lucide-react';

interface SidebarProps {
  onOpenAi: () => void;
  onOpenHistory: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenAi,
  onOpenHistory
}) => {
  
  const onDragStart = (event: React.DragEvent, nodeType: SidebarItemType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Ordem de exibição das categorias
  const categories = ['text', 'traffic', 'page', 'action', 'crm', 'decision'];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 flex-shrink-0 select-none">
      <div className="p-4 border-b border-slate-100 bg-white">
        <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
          <span className="text-indigo-600 text-xl">⚡</span> FunnelBoard
        </h1>
        
        {/* Ferramentas Inteligentes */}
        <div className="mt-3 flex gap-2">
            <button
              onClick={onOpenAi}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 px-3 rounded-lg shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-xs"
              title="Gerar ou editar funil com IA"
            >
              <Sparkles size={14} className="text-yellow-300" />
              IA Architect
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3 py-2.5 bg-white text-slate-500 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 flex items-center justify-center"
              title="Histórico e Logs da IA"
            >
              <History size={18} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* --- LISTA DE ELEMENTOS --- */}
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FUNNEL_ELEMENTS.filter((el) => el.category === cat).map((item) => {
                const Icon = IconMap[item.iconName] || MousePointer2;
                return (
                  <div
                    key={item.type}
                    onDragStart={(event) => onDragStart(event, item)}
                    draggable
                    className="
                      cursor-grab active:cursor-grabbing
                      flex items-center gap-2 p-2
                      bg-white rounded-md border border-slate-200 shadow-sm
                      hover:shadow hover:border-indigo-400 hover:bg-slate-50 transition-all
                      h-10 overflow-hidden
                    "
                    title={item.label}
                  >
                    <div className={`
                      shrink-0 p-1 rounded-md
                      ${item.category === 'traffic' ? 'text-blue-500 bg-blue-50' : ''}
                      ${item.category === 'page' ? 'text-emerald-500 bg-emerald-50' : ''}
                      ${item.category === 'action' ? 'text-amber-500 bg-amber-50' : ''}
                      ${item.category === 'crm' ? 'text-cyan-600 bg-cyan-50' : ''}
                      ${item.category === 'decision' ? 'text-purple-500 bg-purple-50' : ''}
                      ${item.category === 'text' ? 'text-slate-500 bg-slate-100' : ''}
                    `}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 truncate leading-none">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-2 border-t border-slate-100 bg-slate-50 text-center text-[9px] text-slate-400">
        FunnelBoard v2.3
      </div>
    </aside>
  );
};

export default Sidebar;
