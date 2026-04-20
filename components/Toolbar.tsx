
import React, { useRef, useState, useEffect } from 'react';
import { Save, Trash2, Download, Eraser, Upload, AlignCenterVertical, AlignCenterHorizontal, Key, FileJson, FileImage, ChevronDown } from 'lucide-react';

interface ToolbarProps {
  onSave: () => void;
  onClear: () => void;
  onExport: () => void;
  onExportImage: (format: 'png' | 'jpg' | 'pdf') => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onAlign: (direction: 'horizontal' | 'vertical') => void;
  onConfigApiKey: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave, onClear, onExport, onExportImage, onImport, onDeleteSelected, onAlign, onConfigApiKey
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportImage = async (format: 'png' | 'jpg' | 'pdf') => {
    setShowExportMenu(false);
    setExporting(format.toUpperCase());
    await onExportImage(format);
    setExporting(null);
  };

  const exportOptions = [
    { format: 'png' as const, label: 'PNG', desc: 'Transparente, alta qualidade', color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
    { format: 'jpg' as const, label: 'JPG', desc: 'Fundo branco, compactado', color: 'text-sky-600', bg: 'hover:bg-sky-50' },
    { format: 'pdf' as const, label: 'PDF', desc: 'Documento para compartilhar', color: 'text-rose-600', bg: 'hover:bg-rose-50' },
  ];

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white p-2 rounded-lg shadow-lg border border-slate-100">
      <input type="file" ref={fileInputRef} onChange={onImport} className="hidden" accept=".json" />

      <div className="flex bg-slate-50 rounded-md p-0.5 border border-slate-100">
        <button
          type="button"
          onClick={() => onAlign('vertical')}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors"
          title="Alinhar em Coluna"
        >
          <AlignCenterVertical size={16} />
        </button>
        <button
          type="button"
          onClick={() => onAlign('horizontal')}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors"
          title="Alinhar em Linha"
        >
          <AlignCenterHorizontal size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200" />

      <button
        type="button"
        onClick={onConfigApiKey}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded hover:bg-slate-100 transition-colors border border-slate-200"
        title="Configurar API Key da IA"
      >
        <Key size={16} className="text-yellow-600" />
        API Key
      </button>

      <div className="w-px h-6 bg-slate-200" />

      <button
        type="button"
        onClick={onSave}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
        title="Salvar no Navegador"
      >
        <Save size={16} />
        Salvar
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        title="Importar JSON"
      >
        <Upload size={16} />
        Importar
      </button>

      {/* Export dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowExportMenu(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
          title="Exportar funil"
        >
          {exporting ? (
            <span className="text-xs font-bold animate-pulse">Exportando {exporting}...</span>
          ) : (
            <>
              <Download size={16} />
              Exportar
              <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exportar como imagem</p>
            </div>

            {exportOptions.map(({ format, label, desc, color, bg }) => (
              <button
                key={format}
                onClick={() => handleExportImage(format)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${bg}`}
              >
                <div className={`p-1.5 rounded-md bg-slate-100 ${color}`}>
                  <FileImage size={15} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${color}`}>{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </button>
            ))}

            <div className="border-t border-slate-100">
              <button
                onClick={() => { setShowExportMenu(false); onExport(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-500">
                  <FileJson size={15} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600">JSON</p>
                  <p className="text-[10px] text-slate-400">Backup / reimportar</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200" />

      <button
        type="button"
        onClick={onDeleteSelected}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
        title="Excluir Selecionado"
      >
        <Trash2 size={16} />
        Excluir
      </button>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClear(); }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors shadow-sm ml-1"
        title="Limpar Tudo"
      >
        <Eraser size={16} />
        Limpar
      </button>
    </div>
  );
};

export default Toolbar;
