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
type NodeState = 'locked' | 'available' | 'completed' | 'challenge'

function getPathState(fromId: string, toId: string, completedNodes: string[]): PathState {
  const fromDone = completedNodes.includes(fromId)
  const toDone = completedNodes.includes(toId)
  if (fromDone && toDone) return 'complete'
  const allNodes = campaignRegions.flatMap((r) => r.nodes)
  const fromNode = allNodes.find((n) => n.id === fromId)
  const toNode = allNodes.find((n) => n.id === toId)
  if (fromDone || toDone || (fromNode && isNodeAvailable(fromNode, completedNodes)) || (toNode && isNodeAvailable(toNode, completedNodes))) return 'active'
  return 'locked'
}

function getNodeState(node: CampaignNode, completedNodes: string[], activeChallenges: { nodeId: string }[]): NodeState {
  if (completedNodes.includes(node.id) && activeChallenges.some((c) => c.nodeId === node.id)) return 'challenge'
  if (completedNodes.includes(node.id)) return 'completed'
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
      allPaths.push({ from: region.nodes[i].id, to: region.nodes[i + 1].id, state: getPathState(region.nodes[i].id, region.nodes[i + 1].id, completedNodes) })
    }
  }
  for (let i = 0; i < campaignRegions.length - 1; i++) {
    const last = campaignRegions[i].nodes[campaignRegions[i].nodes.length - 1]
    const first = campaignRegions[i + 1].nodes[0]
    allPaths.push({ from: last.id, to: first.id, state: getPathState(last.id, first.id, completedNodes) })
  }

  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="ocean" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0c1a30" />
          <stop offset="100%" stopColor="#060e1c" />
        </radialGradient>
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0 10 Q 10 5 20 10 Q 30 15 40 10" fill="none" stroke="#1a3050" strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>

      <style>{`
        .node-available { animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes pulse-glow { 0%,100% { filter: url(#glow-gold); opacity:1; } 50% { filter: url(#glow-gold); opacity:0.7; } }
        .dash-flow { animation: dash-flow 1.5s linear infinite; }
        @keyframes dash-flow { to { stroke-dashoffset: -20; } }
        .challenge-pulse { animation: challenge-pulse 2s ease-in-out infinite; }
        @keyframes challenge-pulse { 0%,100% { filter: url(#glow-orange); opacity:1; } 50% { filter: url(#glow-orange); opacity:0.75; } }
        .region-fog { transition: opacity 1.5s ease; }
        .world-map-node--interactive { cursor: pointer; }
        .ocean-shimmer { animation: ocean-shimmer 8s ease-in-out infinite; }
        @keyframes ocean-shimmer { 0%,100% { opacity: 0.3; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Ocean */}
      <rect width="1000" height="600" fill="url(#ocean)" />
      <rect width="1000" height="600" fill="url(#waves)" className="ocean-shimmer" />

      {/* Continent shapes — landmasses for each region pair */}
      {/* Top-left continent: Alexandria + Lindblum */}
      <path d="M 40 40 Q 80 25 180 30 Q 280 20 380 40 Q 400 60 390 100 Q 395 140 380 160 Q 350 180 300 190 Q 250 200 200 195 Q 150 210 100 230 Q 60 250 50 280 Q 40 300 55 320 Q 80 340 120 345 Q 180 350 250 340 Q 320 330 370 340 Q 390 360 380 380 Q 350 390 300 380 Q 200 370 120 380 Q 70 390 45 370 Q 25 340 30 300 Q 20 250 30 200 Q 25 150 30 100 Q 30 60 40 40 Z"
        fill="#1a2818" stroke="#2a3a22" strokeWidth="1" />
      <path d="M 60 50 Q 120 40 200 45 Q 300 35 360 55 Q 370 80 365 110 Q 360 140 340 160 Q 300 170 250 175 Q 180 185 130 200 Q 90 220 80 250 Q 75 280 85 300 Q 100 320 150 330 Q 220 335 280 325 Q 330 320 350 335 Q 360 350 340 365 Q 280 370 200 365 Q 130 370 80 360 Q 50 340 50 310 Q 45 270 55 230 Q 45 180 50 130 Q 50 80 60 50 Z"
        fill="#1e3018" stroke="none" opacity="0.5" />

      {/* Top-right continent: Burmecia + Treno */}
      <path d="M 450 30 Q 520 20 600 35 Q 700 25 790 40 Q 830 60 820 100 Q 830 150 810 180 Q 780 200 730 210 Q 680 220 620 215 Q 560 225 510 250 Q 480 270 470 300 Q 475 330 500 345 Q 550 360 620 355 Q 700 350 770 340 Q 810 330 820 350 Q 810 370 770 380 Q 700 385 620 380 Q 540 385 480 370 Q 450 350 445 320 Q 440 280 450 240 Q 440 190 445 140 Q 440 80 450 30 Z"
        fill="#162028" stroke="#1e2e38" strokeWidth="1" />
      <path d="M 470 45 Q 540 35 630 45 Q 720 35 780 55 Q 800 75 795 110 Q 800 150 785 175 Q 750 195 700 200 Q 640 210 580 220 Q 530 235 510 260 Q 505 285 515 310 Q 535 330 580 340 Q 650 345 730 338 Q 780 332 790 350 Q 780 365 740 372 Q 660 380 580 375 Q 510 378 475 360 Q 460 340 460 310 Q 455 270 465 235 Q 455 185 460 130 Q 458 80 470 45 Z"
        fill="#1a2830" stroke="none" opacity="0.5" />

      {/* Bottom-left continent: Cleyra + Desert Palace */}
      <path d="M 30 420 Q 60 400 130 395 Q 220 385 320 400 Q 380 410 400 440 Q 410 470 395 500 Q 380 530 340 545 Q 280 555 200 550 Q 120 555 70 540 Q 40 520 35 490 Q 30 460 30 420 Z"
        fill="#2a2818" stroke="#3a3822" strokeWidth="1" />
      <path d="M 55 415 Q 110 405 190 400 Q 280 395 350 410 Q 385 425 390 450 Q 392 475 380 500 Q 360 525 310 535 Q 250 542 180 540 Q 110 542 70 530 Q 50 515 48 490 Q 45 460 55 415 Z"
        fill="#282418" stroke="none" opacity="0.5" />

      {/* Bottom-right continent: Ipsen's Castle + Memoria */}
      <path d="M 460 410 Q 520 395 600 400 Q 700 390 800 405 Q 850 420 860 460 Q 865 500 845 530 Q 820 555 760 560 Q 680 565 600 560 Q 520 565 475 545 Q 450 520 448 490 Q 445 450 460 410 Z"
        fill="#181828" stroke="#222240" strokeWidth="1" />
      <path d="M 480 420 Q 540 408 620 412 Q 720 405 790 418 Q 835 430 842 465 Q 845 495 830 522 Q 805 545 750 550 Q 670 555 590 550 Q 510 554 480 540 Q 462 520 460 492 Q 458 455 480 420 Z"
        fill="#141430" stroke="none" opacity="0.5" />

      {/* Mountain ranges */}
      {/* Alexandria mountains */}
      {[100, 160, 220].map((x) => (
        <polygon key={`mt-a-${x}`} points={`${x-12},145 ${x},115 ${x+12},145`} fill="#2a4020" stroke="#3a5030" strokeWidth="0.5" opacity="0.6" />
      ))}
      {/* Burmecia rain lines */}
      {[490, 530, 570, 610, 650].map((x) => (
        <line key={`rain-${x}`} x1={x} y1={50} x2={x-8} y2={75} stroke="#3355aa" strokeWidth="0.4" opacity="0.3" />
      ))}
      {/* Desert terrain dots */}
      {[100, 150, 200, 250, 300].map((x) => (
        <circle key={`sand-${x}`} cx={x} cy={480 + (x % 30)} r="2" fill="#4a4020" opacity="0.3" />
      ))}
      {/* Cleyra trees */}
      {[90, 140, 200, 280].map((x) => (
        <polygon key={`tree-${x}`} points={`${x-5},430 ${x},412 ${x+5},430`} fill="#1a3a12" opacity="0.4" />
      ))}
      {/* Memoria crystals */}
      {[580, 640, 720, 780].map((x) => (
        <polygon key={`crys-${x}`} points={`${x-3},510 ${x},498 ${x+3},510`} fill="#3333aa" opacity="0.25" />
      ))}

      {/* Compass rose */}
      <g transform="translate(940, 50)" opacity="0.25">
        <circle r="18" fill="none" stroke="#c8a96e" strokeWidth="0.5" />
        <line x1="0" y1="-16" x2="0" y2="16" stroke="#c8a96e" strokeWidth="0.5" />
        <line x1="-16" y1="0" x2="16" y2="0" stroke="#c8a96e" strokeWidth="0.5" />
        <text y="-20" textAnchor="middle" fill="#c8a96e" fontSize="7" fontFamily="serif">N</text>
      </g>

      {/* Region fog overlays */}
      {campaignRegions.map((region) => {
        const available = isRegionAvailable(region, completedNodes)
        const nodes = region.nodes
        if (nodes.length === 0 || available) return null
        const xs = nodes.map((n) => n.position.x)
        const ys = nodes.map((n) => n.position.y)
        return (
          <rect key={`fog-${region.id}`} className="region-fog"
            x={Math.min(...xs) - 35} y={Math.min(...ys) - 35}
            width={Math.max(...xs) - Math.min(...xs) + 70}
            height={Math.max(...ys) - Math.min(...ys) + 70}
            rx={12} fill="#060e1c" opacity={0.7} pointerEvents="none" />
        )
      })}

      {/* Paths */}
      {allPaths.map((p) => {
        const fn = campaignRegions.flatMap((r) => r.nodes)
        const f = fn.find((n) => n.id === p.from)
        const t = fn.find((n) => n.id === p.to)
        if (!f || !t) return null
        const d = curvePath(f.position.x, f.position.y, t.position.x, t.position.y)
        if (p.state === 'locked') return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#1a2a1a" strokeWidth={1.5} strokeDasharray="4 3" />
        if (p.state === 'complete') return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#4ade80" strokeWidth={2} />
        return <path key={`${p.from}-${p.to}`} d={d} fill="none" stroke="#c8a96e" strokeWidth={2} strokeDasharray="6 3" className="dash-flow" />
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
            fill={complete ? '#4ade80' : '#c8a96e'} fontWeight="bold" fontSize={10}
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
          const r = node.isBoss ? 16 : 12
          const { x, y } = node.position
          let fillColor = '#1a2818'
          let strokeColor = '#333'
          let nodeOpacity = 0.4
          let className = ''
          if (state === 'available') { strokeColor = '#c8a96e'; nodeOpacity = 1; className = 'node-available' }
          else if (state === 'completed') { fillColor = '#1a3a1a'; strokeColor = '#4ade80'; nodeOpacity = 1 }
          else if (state === 'challenge') { fillColor = '#2a1a00'; strokeColor = '#f59e0b'; nodeOpacity = 1; className = 'challenge-pulse' }
          return (
            <g key={node.id} className={`${className} ${interactive ? 'world-map-node--interactive' : ''}`}
              onClick={interactive ? () => onSelectNode(node.id) : undefined} style={{ opacity: nodeOpacity }}>
              {isSelected && <circle cx={x} cy={y} r={r + 5} fill="none" stroke="#f5cf85" strokeWidth={2} />}
              {node.isBoss && <circle cx={x} cy={y} r={r + 2.5} fill="none" stroke={strokeColor} strokeWidth={0.8} strokeDasharray="2 1.5" />}
              <circle cx={x} cy={y} r={r} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={node.isBoss ? 11 : 9}
                fill={icon.fill} style={{ pointerEvents: 'none' }}>{icon.char}</text>
              <text x={x} y={y + r + 9} fill="#667766" fontSize={6} textAnchor="middle"
                style={{ pointerEvents: 'none' }}>{node.name}</text>
            </g>
          )
        }),
      )}
    </svg>
  )
}
