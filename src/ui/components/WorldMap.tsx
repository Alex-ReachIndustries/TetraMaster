import {
  campaignRegions,
  isRegionAvailable,
  isRegionComplete,
  isNodeAvailable,
  type CampaignNode,
} from '../../data/campaign'

interface WorldMapProps {
  completedNodes: string[]
  activeChallenges: { nodeId: string; modifier: { name: string } }[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
}

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.25 + 10
  const cx = mx + (dy > 0 ? -offset : offset)
  const cy = my + (dx > 0 ? offset : -offset)
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

type PathState = 'locked' | 'active' | 'complete'

function getPathState(fromId: string, toId: string, completedNodes: string[]): PathState {
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

type NodeState = 'locked' | 'available' | 'completed' | 'challenge'

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

function getNodeIcon(node: CampaignNode, state: NodeState): { char: string; fill: string } {
  if (state === 'challenge') return { char: '⚔', fill: '#f59e0b' }
  if (state === 'completed') return { char: '✓', fill: '#4ade80' }
  if (node.isBoss) return { char: '★', fill: state === 'available' ? '#c8a96e' : '#555' }
  return { char: '●', fill: state === 'available' ? '#c8a96e' : '#555' }
}

export function WorldMap({ completedNodes, activeChallenges, selectedNodeId, onSelectNode }: WorldMapProps) {
  const allPaths: { from: string; to: string; state: PathState }[] = []

  for (const region of campaignRegions) {
    for (let i = 0; i < region.nodes.length - 1; i++) {
      allPaths.push({
        from: region.nodes[i].id,
        to: region.nodes[i + 1].id,
        state: getPathState(region.nodes[i].id, region.nodes[i + 1].id, completedNodes),
      })
    }
  }
  for (let i = 0; i < campaignRegions.length - 1; i++) {
    const from = campaignRegions[i]
    const to = campaignRegions[i + 1]
    const lastNode = from.nodes[from.nodes.length - 1]
    const firstNode = to.nodes[0]
    allPaths.push({
      from: lastNode.id,
      to: firstNode.id,
      state: getPathState(lastNode.id, firstNode.id, completedNodes),
    })
  }

  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0a0a15" />
        </radialGradient>
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <style>{`
        .node-available { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes pulse-glow {
          0%, 100% { filter: url(#glow-gold); opacity: 1; }
          50% { filter: url(#glow-gold); opacity: 0.7; }
        }
        .dash-flow { animation: dash-flow 1.5s linear infinite; }
        @keyframes dash-flow { to { stroke-dashoffset: -20; } }
        .challenge-pulse { animation: challenge-pulse 2s ease-in-out infinite; }
        @keyframes challenge-pulse {
          0%, 100% { filter: url(#glow-orange); opacity: 1; }
          50% { filter: url(#glow-orange); opacity: 0.75; }
        }
        .region-fog { transition: opacity 1.5s ease; }
        .world-map-node--interactive { cursor: pointer; }
      `}</style>

      <rect x="0" y="0" width="1000" height="600" fill="url(#bg-gradient)" />

      {/* Paths */}
      {allPaths.map((p) => {
        const fromNode = campaignRegions.flatMap((r) => r.nodes).find((n) => n.id === p.from)
        const toNode = campaignRegions.flatMap((r) => r.nodes).find((n) => n.id === p.to)
        if (!fromNode || !toNode) return null
        const d = curvePath(fromNode.position.x, fromNode.position.y, toNode.position.x, toNode.position.y)
        if (p.state === 'locked') return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#222" strokeWidth={1.5} strokeDasharray="4 3" />
        if (p.state === 'complete') return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#4ade80" strokeWidth={2} />
        return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#c8a96e" strokeWidth={2} strokeDasharray="6 3" className="dash-flow" />
      })}

      {/* Region fog overlays */}
      {campaignRegions.map((region) => {
        const available = isRegionAvailable(region, completedNodes)
        const nodes = region.nodes
        if (nodes.length === 0) return null
        const xs = nodes.map((n) => n.position.x)
        const ys = nodes.map((n) => n.position.y)
        const minX = Math.min(...xs) - 30
        const minY = Math.min(...ys) - 30
        const maxX = Math.max(...xs) + 30
        const maxY = Math.max(...ys) + 30
        return (
          <rect key={`fog-${region.id}`} className="region-fog"
            x={minX} y={minY} width={maxX - minX} height={maxY - minY}
            rx={10} fill="#0a0a15" opacity={available ? 0 : 0.6} pointerEvents="none"
          />
        )
      })}

      {/* Region labels */}
      {campaignRegions.map((region) => {
        const nodes = region.nodes
        if (nodes.length === 0) return null
        const cx = nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length
        const minY = Math.min(...nodes.map((n) => n.position.y))
        const complete = isRegionComplete(region.id, completedNodes)
        return (
          <text key={`label-${region.id}`} x={cx} y={minY - 18}
            fill={complete ? '#4ade80' : '#c8a96e'} fontWeight="bold" fontSize={11}
            textAnchor="middle" fontFamily="serif" style={{ letterSpacing: '1.5px' }}>
            {region.icon} {region.name.toUpperCase()}
          </text>
        )
      })}

      {/* Nodes */}
      {campaignRegions.map((region) =>
        region.nodes.map((node) => {
          const state = getNodeState(node, completedNodes, activeChallenges)
          const isSelected = selectedNodeId === node.id
          const interactive = state !== 'locked'
          const icon = getNodeIcon(node, state)
          const r = node.isBoss ? 18 : 14
          const { x, y } = node.position

          let fillColor = '#1a1a2e'
          let strokeColor = '#333'
          let nodeOpacity = 0.4
          let className = ''

          if (state === 'available') { strokeColor = '#c8a96e'; nodeOpacity = 1; className = 'node-available' }
          else if (state === 'completed') { fillColor = '#1a3a1a'; strokeColor = '#4ade80'; nodeOpacity = 1 }
          else if (state === 'challenge') { fillColor = '#2a1a00'; strokeColor = '#f59e0b'; nodeOpacity = 1; className = 'challenge-pulse' }

          return (
            <g key={node.id} className={`${className} ${interactive ? 'world-map-node--interactive' : ''}`}
              onClick={interactive ? () => onSelectNode(node.id) : undefined} style={{ opacity: nodeOpacity }}>
              {isSelected && <circle cx={x} cy={y} r={r + 5} fill="none" stroke="#f5cf85" strokeWidth={2.5} />}
              {node.isBoss && <circle cx={x} cy={y} r={r + 2.5} fill="none" stroke={strokeColor} strokeWidth={1} strokeDasharray="2 1.5" />}
              <circle cx={x} cy={y} r={r} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={node.isBoss ? 12 : 10}
                fill={icon.fill} style={{ pointerEvents: 'none' }}>{icon.char}</text>
              <text x={x} y={y + r + 10} fill="#777" fontSize={7} textAnchor="middle"
                style={{ pointerEvents: 'none' }}>{node.name}</text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
