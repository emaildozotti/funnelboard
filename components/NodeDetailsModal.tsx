
import React, { useState, useEffect } from 'react';
import { X, Save, FileText, AlignLeft } from 'lucide-react';

interface NodeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string, description: string) => void;
  initialLabel: string;
  initialDescription: string;
  nodeTypeLabel: string;
}

const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialLabel, 
  initialDescription,
  nodeTypeLabel 
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setDescription(initialDescription || '');
    }
  }, [isOpen, initialLabel, initialDescription]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(label, description);
    onClose();
  };

  // Fecha ao clicar no fundo escuro
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // Impede que o clique dentro do modal feche o modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      onMouseDown={(e) => e.stopPropagation()} // Impede drag/pan do canvas por baixo
    >
      <div 
        onClick={handleModalClick}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 m-4"
      >
        
        {/* Header Compacto */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{nodeTypeLabel}</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Título</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Nome do passo..."
              autoFocus
            />
          </div>

          {/* Notas */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1 uppercase">
              <AlignLeft size={12} />
              Notas
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 p-3 text-sm text-slate-700 bg-yellow-50 border border-yellow-200 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none leading-relaxed placeholder-slate-400"
              placeholder="Digite suas anotações aqui..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            <Save size={14} />
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
};

export default NodeDetailsModal;