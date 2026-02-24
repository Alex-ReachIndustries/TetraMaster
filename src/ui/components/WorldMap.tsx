import {
  campaignRegions,
  isRegionAvailable,
  isRegionComplete,
  isNodeAvailable,
  type CampaignNode,
  type CampaignRegion,
} from '../../data/campaign'

interface WorldMapProps {
  completedNodes: string[]
  activeChallenges: { nodeId: string; modifier: { name: string } }[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
}

const NODE_COORDS: Record<string, { x: number; y: number }> = {
  'alex-village': { x: 120, y: 130 },
  'alex-gates': { x: 230, y: 100 },
  'alex-castle': { x: 340, y: 140 },

  'lind-business': { x: 140, y: 280 },
  'lind-theater': { x: 260, y: 260 },
  'lind-castle': { x: 370, y: 300 },

  'treno-stadium': { x: 560, y: 110 },
  'treno-slum': { x: 670, y: 140 },
  'treno-mansion': { x: 780, y: 100 },

  'cleyra-trunk': { x: 160, y: 440 },
  'cleyra-temple': { x: 280, y: 420 },
  'cleyra-crown': { x: 390, y: 460 },

  'mem-entrance': { x: 580, y: 400 },
  'mem-warp': { x: 700, y: 430 },
  'mem-crystal': { x: 820, y: 390 },
}

const REGION_LABEL_POS: Record<string, { x: number; y: number }> = {
  alexandria: { x: 230, y: 65 },
  lindblum: { x: 250, y: 235 },
  treno: { x: 670, y: 65 },
  cleyra: { x: 270, y: 395 },
  memoria: { x: 700, y: 365 },
}

const REGION_FOG_BOUNDS: Record<
  string,
  { x: number; y: number; w: number; h: number }
> = {
  alexandria: { x: 80, y: 60, w: 310, h: 130 },
  lindblum: { x: 100, y: 230, w: 320, h: 120 },
  treno: { x: 520, y: 60, w: 310, h: 130 },
  cleyra: { x: 120, y: 390, w: 320, h: 120 },
  memoria: { x: 540, y: 350, w: 330, h: 130 },
}

function getNodeCoords(nodeId: string): { x: number; y: number } {
  return NODE_COORDS[nodeId] ?? { x: 0, y: 0 }
}

function buildIntraRegionPaths(region: CampaignRegion): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < region.nodes.length - 1; i++) {
    pairs.push([region.nodes[i].id, region.nodes[i + 1].id])
  }
  return pairs
}

function buildInterRegionPaths(): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < campaignRegions.length - 1; i++) {
    const from = campaignRegions[i]
    const to = campaignRegions[i + 1]
    const lastNode = from.nodes[from.nodes.length - 1]
    const firstNode = to.nodes[0]
    pairs.push([lastNode.id, firstNode.id])
  }
  return pairs
}

function curvePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3 + 15
  const cx = mx + (dy > 0 ? -offset : offset)
  const cy = my + (dx > 0 ? offset : -offset)
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

type PathState = 'locked' | 'active' | 'complete'

function getPathState(
  fromId: string,
  toId: string,
  completedNodes: string[],
): PathState {
  const fromDone = completedNodes.includes(fromId)
  const toDone = completedNodes.includes(toId)
  if (fromDone && toDone) return 'complete'

  const allNodes = campaignRegions.flatMap((r) => r.nodes)
  const fromNode = allNodes.find((n) => n.id === fromId)
  const toNode = allNodes.find((n) => n.id === toId)
  const fromAvail = fromNode ? isNodeAvailable(fromNode, completedNodes) : false
  const toAvail = toNode ? isNodeAvailable(toNode, completedNodes) : false

  if (fromDone || toDone || fromAvail || toAvail) return 'active'
  return 'locked'
}

type NodeState =
  | 'locked'
  | 'available'
  | 'completed'
  | 'selected'
  | 'challenge'

function getNodeState(
  node: CampaignNode,
  completedNodes: string[],
  activeChallenges: { nodeId: string }[],
): NodeState {
  const completed = completedNodes.includes(node.id)
  const hasChallenge = activeChallenges.some((c) => c.nodeId === node.id)
  if (completed && hasChallenge) return 'challenge'
  if (completed) return 'completed'
  if (isNodeAvailable(node, completedNodes)) return 'available'
  return 'locked'
}

function getNodeIcon(
  node: CampaignNode,
  state: NodeState,
): { char: string; fill: string } {
  if (state === 'challenge') return { char: '⚔', fill: '#f59e0b' }
  if (state === 'completed') return { char: '✓', fill: '#4ade80' }
  if (node.isBoss) {
    return {
      char: '★',
      fill: state === 'available' ? '#c8a96e' : '#555',
    }
  }
  return {
    char: '●',
    fill: state === 'available' ? '#c8a96e' : '#555',
  }
}

export function WorldMap({
  completedNodes,
  activeChallenges,
  selectedNodeId,
  onSelectNode,
}: WorldMapProps) {
  const allPaths: { from: string; to: string; state: PathState }[] = []

  for (const region of campaignRegions) {
    for (const [fromId, toId] of buildIntraRegionPaths(region)) {
      allPaths.push({
        from: fromId,
        to: toId,
        state: getPathState(fromId, toId, completedNodes),
      })
    }
  }
  for (const [fromId, toId] of buildInterRegionPaths()) {
    allPaths.push({
      from: fromId,
      to: toId,
      state: getPathState(fromId, toId, completedNodes),
    })
  }

  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0a0a15" />
        </radialGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter
          id="glow-orange"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter
          id="glow-gold"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <style>{`
        .node-available {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { filter: url(#glow-gold); opacity: 1; }
          50% { filter: url(#glow-gold); opacity: 0.7; }
        }
        .dash-flow {
          animation: dash-flow 1.5s linear infinite;
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        .node-unlock {
          animation: node-unlock 0.5s ease-out;
        }
        @keyframes node-unlock {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .challenge-pulse {
          animation: challenge-pulse 2s ease-in-out infinite;
        }
        @keyframes challenge-pulse {
          0%, 100% { filter: url(#glow-orange); opacity: 1; }
          50% { filter: url(#glow-orange); opacity: 0.75; }
        }
        .region-fog {
          transition: opacity 1.5s ease;
        }
        .world-map-node--interactive {
          cursor: pointer;
        }
      `}</style>

      {/* Background */}
      <rect
        x="0"
        y="0"
        width="1000"
        height="600"
        fill="url(#bg-gradient)"
      />

      {/* Paths */}
      {allPaths.map((p) => {
        const from = getNodeCoords(p.from)
        const to = getNodeCoords(p.to)
        const d = curvePath(from.x, from.y, to.x, to.y)

        if (p.state === 'locked') {
          return (
            <path
              key={`${p.from}-${p.to}`}
              d={d}
              fill="none"
              stroke="#222"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          )
        }
        if (p.state === 'complete') {
          return (
            <path
              key={`${p.from}-${p.to}`}
              d={d}
              fill="none"
              stroke="#4ade80"
              strokeWidth={2.5}
            />
          )
        }
        return (
          <path
            key={`${p.from}-${p.to}`}
            d={d}
            fill="none"
            stroke="#c8a96e"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            className="dash-flow"
          />
        )
      })}

      {/* Region fog overlays (for locked regions) */}
      {campaignRegions.map((region) => {
        const available = isRegionAvailable(region, completedNodes)
        const bounds = REGION_FOG_BOUNDS[region.id]
        if (!bounds) return null
        return (
          <rect
            key={`fog-${region.id}`}
            className="region-fog"
            x={bounds.x}
            y={bounds.y}
            width={bounds.w}
            height={bounds.h}
            rx={12}
            ry={12}
            fill="#0a0a15"
            opacity={available ? 0 : 0.6}
            pointerEvents="none"
          />
        )
      })}

      {/* Region labels */}
      {campaignRegions.map((region) => {
        const pos = REGION_LABEL_POS[region.id]
        if (!pos) return null
        const complete = isRegionComplete(region.id, completedNodes)
        return (
          <text
            key={`label-${region.id}`}
            x={pos.x}
            y={pos.y}
            fill={complete ? '#4ade80' : '#c8a96e'}
            fontWeight="bold"
            fontSize={14}
            textAnchor="middle"
            fontFamily="serif"
            style={{ letterSpacing: '2px' }}
          >
            {region.icon} {region.name.toUpperCase()}
          </text>
        )
      })}

      {/* Nodes */}
      {campaignRegions.map((region) =>
        region.nodes.map((node) => {
          const coords = getNodeCoords(node.id)
          const state = getNodeState(
            node,
            completedNodes,
            activeChallenges,
          )
          const isSelected = selectedNodeId === node.id
          const interactive = state !== 'locked'
          const icon = getNodeIcon(node, state)
          const radius = node.isBoss ? 24 : 20

          let fillColor = '#1a1a2e'
          let strokeColor = '#333'
          let nodeOpacity = 0.4
          let className = ''

          if (state === 'available') {
            strokeColor = '#c8a96e'
            nodeOpacity = 1
            className = 'node-available'
          } else if (state === 'completed') {
            fillColor = '#1a3a1a'
            strokeColor = '#4ade80'
            nodeOpacity = 1
          } else if (state === 'challenge') {
            fillColor = '#2a1a00'
            strokeColor = '#f59e0b'
            nodeOpacity = 1
            className = 'challenge-pulse'
          } else if (state === 'locked') {
            fillColor = '#1a1a2e'
            strokeColor = '#333'
            nodeOpacity = 0.4
          }

          return (
            <g
              key={node.id}
              className={`${className} ${interactive ? 'world-map-node--interactive' : ''}`}
              onClick={
                interactive ? () => onSelectNode(node.id) : undefined
              }
              style={{ opacity: nodeOpacity }}
            >
              {/* Selected outer ring */}
              {isSelected && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius + 6}
                  fill="none"
                  stroke="#f5cf85"
                  strokeWidth={3}
                />
              )}

              {/* Boss double ring */}
              {node.isBoss && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius + 3}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
              )}

              {/* Main circle */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={2}
              />

              {/* Inner icon */}
              <text
                x={coords.x}
                y={coords.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.isBoss ? 16 : 14}
                fill={icon.fill}
                style={{ pointerEvents: 'none' }}
              >
                {icon.char}
              </text>

              {/* Node label */}
              <text
                x={coords.x}
                y={coords.y + radius + 14}
                fill="#888"
                fontSize={10}
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {node.name}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
