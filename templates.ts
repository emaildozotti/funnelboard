
import { Node, Edge } from 'reactflow';

export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

// LISTA DE TEMPLATES PADRÃO (ZERADA)
// O usuário agora criará sua própria biblioteca.
export const TEMPLATES: FunnelTemplate[] = [];