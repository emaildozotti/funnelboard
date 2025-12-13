
import React, { useCallback } from 'react';
import { useStore, getBezierPath, EdgeProps } from 'reactflow';
import { getEdgeParams } from '../utils';

function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: undefined as any, 
    targetPosition: undefined as any,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      {/* Caminho Invisível Grosso para Interação (Click/Hover) */}
      <path
        id={`${id}-selector`}
        className="edge-selector"
        d={edgePath}
        fill="none"
        stroke="rgba(255,0,0,0.01)" /* Hack para garantir hit-test em todos browsers */
        strokeWidth={40} /* Área de clique GRANDE */
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
      {/* Caminho Visível Animado */}
      <path
        id={id}
        className="react-flow__edge-path electric-flow"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
    </>
  );
}

export default FloatingEdge;