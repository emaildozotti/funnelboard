
import React, { useRef } from 'react';
import { Save, Trash2, Download, Eraser, Upload, AlignCenterVertical, AlignCenterHorizontal, Copy } from 'lucide-react';

interface ToolbarProps {
  onSave: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onAlign: (direction: 'horizontal' | 'vertical') => void;
  onDuplicate: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onSave, 
  onClear, 
  onExport, 
  onImport,
  onDeleteSelected,
  onAlign,
  onDuplicate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border border-slate-100">
      {/* Input oculto para arquivo */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImport} 
        className="hidden" 
        accept=".json" 
      />

      <div className="flex bg-slate-50 rounded-md p-0.5 border border-slate-100">
        <button
          type="button"
          onClick={() => onAlign('vertical')}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors"
          title="Alinhar em Coluna (Vertical)"
        >
          <AlignCenterVertical size={16} />
        </button>
        <button
          type="button"
          onClick={() => onAlign('horizontal')}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors"
          title="Alinhar em Linha (Horizontal)"
        >
          <AlignCenterHorizontal size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button
        type="button"
        onClick={onDuplicate}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
        title="Duplicar Selecionado (Ctrl+C / Ctrl+V)"
      >
        <Copy size={16} />
        Duplicar
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button
        type="button"
        onClick={onSave}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
        title="Salvar Progresso no Navegador"
      >
        <Save size={16} />
        Salvar
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>
      
      <button
        type="button"
        onClick={handleImportClick}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        title="Importar Arquivo JSON"
      >
        <Upload size={16} />
        Importar
      </button>

       <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
        title="Exportar como JSON"
      >
        <Download size={16} />
        Exportar
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1"></div>

      <button
        type="button"
        onClick={onDeleteSelected}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
        title="Excluir Selecionado (Delete)"
      >
        <Trash2 size={16} />
        Excluir
      </button>

      <button
        type="button"
        onClick={(e) => {
            e.preventDefault();
            onClear();
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors shadow-sm ml-2"
        title="Limpar Tudo (Apagar Quadro)"
      >
        <Eraser size={16} />
        Limpar
      </button>
    </div>
  );
};

export default Toolbar;
