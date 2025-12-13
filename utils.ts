
import { Position, Node } from 'reactflow';

// Funções auxiliares para Floating Edges (Conexões que saem do centro visual)

function getHandleCoords(node: Node, handlePosition: Position) {
  // Como estamos usando floating edges, calculamos o centro do nó
  // Fallback para dimensões padrão se o nó ainda não foi medido
  const w = node.width || 200;
  const h = node.height || 80;
  
  const handleX = node.position.x + w / 2;
  const handleY = node.position.y + h / 2;

  return [handleX, handleY];
}

function getNodeCenter(node: Node) {
  const w = node.width || 200;
  const h = node.height || 80;
  return {
    x: node.position.x + w / 2,
    y: node.position.y + h / 2,
  };
}

// Retorna o ponto de interseção entre a linha (do centro de A ao centro de B) e a borda do nó N
function getIntersection(n: Node, p2: { x: number; y: number }) {
  const w = n.width || 200;
  const h = n.height || 80;
  
  const { x: x1, y: y1 } = getNodeCenter(n);
  const x2 = p2.x;
  const y2 = p2.y;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return { x: x1, y: y1 };
  }

  // Declive da linha
  // y = mx + c
  // m = dy / dx
  
  // Vamos calcular a interseção com as 4 bordas e ver qual está "dentro" do segmento
  // Mas uma forma mais simples para retângulos é usar a proporção

  // Distância do centro até a borda na direção do vetor (dx, dy)
  // xx = w/2, yy = h/2
  
  // slope m = dy/dx
  // Interseção com x = +/- w/2:  y = m * (+/- w/2)
  // Interseção com y = +/- h/2:  x = (+/- h/2) / m

  // Vamos normalizar o vetor para encontrar onde ele "bate" na caixa
  
  // Absolute distance to edges
  const distToLeftRight = w / 2;
  const distToTopBottom = h / 2;
  
  // Scaling factors
  const scaleX = distToLeftRight / Math.abs(dx);
  const scaleY = distToTopBottom / Math.abs(dy);
  
  // Use the smaller scale factor to find the intersection point on the edge
  const scale = Math.min(scaleX, scaleY);
  
  return {
    x: x1 + dx * scale,
    y: y1 + dy * scale,
  };
}


export function getEdgeParams(source: Node, target: Node) {
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);

  const sourceIntersection = getIntersection(source, targetCenter);
  const targetIntersection = getIntersection(target, sourceCenter);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: Position.Top, // Placeholder, a curva será calculada dinamicamente
    targetPos: Position.Bottom, // Placeholder
  };
}