import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

export interface AnimatedTokenEdgeData extends Record<string, unknown> {
  tokenMoving?: boolean;
  animDuration?: number;
}

function AnimatedTokenEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  animated,
  label,
  labelStyle,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as AnimatedTokenEdgeData | undefined;
  const tokenMoving = edgeData?.tokenMoving ?? false;
  const dur = `${((edgeData?.animDuration ?? 1200) / 1000).toFixed(2)}s`;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        className={animated ? 'react-flow__edge-path--animated' : undefined}
        markerEnd={markerEnd}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span
              style={{
                background: 'white',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                border: '1px solid #e5e7eb',
                color: '#374151',
                ...(typeof labelStyle === 'object' ? (labelStyle as React.CSSProperties) : {}),
              }}
            >
              {String(label)}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {tokenMoving && (
        <g>
          {/* Hidden path used as the motion anchor */}
          <path id={`motion-${id}`} d={edgePath} fill="none" stroke="none" />
          {/* Dot that travels along the edge */}
          <circle r="8" fill="#6366f1" stroke="white" strokeWidth="2" opacity="0.95">
            <animateMotion
              dur={dur}
              fill="freeze"
              repeatCount="1"
              calcMode="linear"
            >
              <mpath href={`#motion-${id}`} />
            </animateMotion>
          </circle>
        </g>
      )}
    </>
  );
}

export default memo(AnimatedTokenEdge);
