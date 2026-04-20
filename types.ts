
import { Node, Edge, Viewport } from 'reactflow';

export type FunnelCategory = 'traffic' | 'page' | 'action' | 'crm' | 'commercial' | 'decision' | 'text' | 'image';

export interface FunnelNodeData {
  label: string;
  type: string;
  category: FunnelCategory;
  iconName: string;
  items?: string[]; // Lista opcional para perguntas de form/quiz
  description?: string; // Notas, copy ou detalhes adicionais
  imageUrl?: string; // base64 para nós de imagem
  fontSize?: number; // tamanho da fonte para nós de texto
  onEdit?: (id: string) => void; // Callback para abrir o modal de detalhes
}

export interface SidebarItemType {
  type: string;
  label: string;
  category: FunnelCategory;
  iconName: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'ai' | 'manual';
  prompt?: string; // O que foi pedido (se for IA)
  snapshot: {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
}
