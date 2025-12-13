
import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  hasContext?: boolean;
}

const AiModal: React.FC<AiModalProps> = ({ isOpen, onClose, onGenerate, hasContext = false }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      await onGenerate(prompt);
      setPrompt('');
      onClose();
    } catch (error) {
      alert('Erro ao gerar funil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              IA Architect
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              {hasContext 
                ? "Descreva as alterações que deseja fazer no funil." 
                : "Descreva sua estratégia e eu desenho o funil para você."}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white/70 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={hasContext 
                ? "Ex: Adicione uma sequência de 3 emails após o checkout e uma página de obrigado." 
                : "Ex: Quero um funil de webinar perpétuo que começa com anúncios no YouTube..."}
            className="w-full h-32 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none text-sm leading-relaxed"
            disabled={isLoading}
          />
          
          <div className="mt-4 flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {hasContext ? "Atualizando..." : "Gerando..."}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {hasContext ? "Atualizar Funil" : "Criar Funil"}
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Powered by Google Gemini 2.5 Flash</p>
        </div>

      </div>
    </div>
  );
};

export default AiModal;