
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
      {/* Caminho invisível para área de clique */}
      <path
        id={`${id}-selector`}
        className="edge-selector"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={40}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
      {/* Caminho visível — atributos inline garantem captura correta no export */}
      <path
        id={id}
        className="react-flow__edge-path electric-flow"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeDasharray="10"
        strokeOpacity={0.85}
        style={style}
      />
    </>
  );
}

export default FloatingEdge;