
import React from 'react';
import { X, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onRestore }) => {
  if (!isOpen) return null;

  // Ordenar do mais recente para o mais antigo
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  const handleRestore = (entry: HistoryEntry) => {
    if (window.confirm('Tem certeza? Isso substituirá o quadro atual pelo estado deste backup.')) {
        onRestore(entry);
        onClose();
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 max-h-[80vh] flex flex-col">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Clock className="text-violet-600" size={18} />
            Histórico & Backups
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto flex-1 bg-slate-50/50">
          {sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Clock size={32} className="opacity-20" />
                <p>Nenhum histórico registrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
                {sortedHistory.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white hover:bg-slate-50 transition-colors flex gap-4 items-start group">
                        <div className={`mt-1 p-2 rounded-full shrink-0 ${entry.type === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            {entry.type === 'ai' ? <Sparkles size={16} /> : <Clock size={16} />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${entry.type === 'ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                                    {entry.type === 'ai' ? 'IA Generation' : 'Backup Manual'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                    {formatTime(entry.timestamp)}
                                </span>
                            </div>
                            
                            {entry.prompt && (
                                <div className="bg-slate-50 border border-slate-100 rounded p-2 text-xs text-slate-600 font-mono mt-2 break-words">
                                    <span className="font-bold text-slate-400 block mb-1">Prompt:</span>
                                    "{entry.prompt}"
                                </div>
                            )}

                            <div className="mt-2 text-[10px] text-slate-400">
                                {entry.snapshot.nodes.length} Elementos • {entry.snapshot.edges.length} Conexões
                            </div>
                        </div>

                        <button 
                            onClick={() => handleRestore(entry)}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 text-slate-500 text-xs font-bold rounded shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <RotateCcw size={14} />
                            Restaurar
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 text-center shrink-0">
          O sistema salva automaticamente um backup antes de cada ação da IA.
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;
