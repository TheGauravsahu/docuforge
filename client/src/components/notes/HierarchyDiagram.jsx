import React from 'react';

export default function HierarchyDiagram({
  root = 'Classification',
  children = [],
  inkColor = '#1E1B4B',
  handFont = 'Kalam',
  orientation = 'horizontal',
  fontSize = 16,
}) {
  if (!children || children.length === 0) {
    return (
      <div className="my-3 p-3 text-center rounded-xl border-2 border-dashed" style={{ borderColor: inkColor, fontFamily: `${handFont}, cursive`, color: inkColor }}>
        <span className="font-bold text-base">{root}</span>
      </div>
    );
  }

  const isHorizontal = orientation === 'horizontal';

  const rootFontSize = Math.max(14, Math.round(fontSize * 0.95));
  const l1FontSize = Math.max(12, Math.round(fontSize * 0.85));
  const l2FontSize = Math.max(11, Math.round(fontSize * 0.75));

  if (isHorizontal) {
    const l1Labels = children.map(c => typeof c === 'string' ? c : c.label || '');
    const allL2Labels = children.flatMap(c => (c.children || []).map(sub => typeof sub === 'string' ? sub : sub.label || ''));

    const maxRootLen = Math.max(8, root.length);
    const maxL1Len = Math.max(10, ...l1Labels.map(l => l.length));
    const maxL2Len = Math.max(12, ...allL2Labels.map(l => l.length));

    const rootBoxWidth = Math.min(220, Math.max(120, maxRootLen * (rootFontSize * 0.6) + 28));
    const l1BoxWidth = Math.min(240, Math.max(140, maxL1Len * (l1FontSize * 0.6) + 28));
    const l2BoxWidth = Math.min(240, Math.max(130, maxL2Len * (l2FontSize * 0.6) + 28));

    const gap = Math.max(70, Math.round(fontSize * 4.5));
    const rootX = rootBoxWidth / 2 + 10;
    const level1X = rootX + rootBoxWidth / 2 + l1BoxWidth / 2 + gap;
    const level2X = level1X + l1BoxWidth / 2 + l2BoxWidth / 2 + gap;

    const totalLeafUnits = children.reduce((acc, c) => acc + Math.max(1, c.children?.length || 1), 0);
    const nodeRowHeight = Math.max(45, Math.round(fontSize * 3.2));

    const svgWidth = Math.max(680, level2X + l2BoxWidth / 2 + 20);
    const svgHeight = Math.max(180, totalLeafUnits * nodeRowHeight + 20);

    const rootY = svgHeight / 2;

    let currentY = 20;
    const l1Nodes = children.map((c, idx) => {
      const subCount = Math.max(1, c.children?.length || 1);
      const nodeY = currentY + (subCount * nodeRowHeight) / 2;
      const startY = currentY;
      currentY += subCount * nodeRowHeight;
      return { ...c, label: typeof c === 'string' ? c : c.label || '', y: nodeY, startY, subCount };
    });

    return (
      <div className="my-2 p-2 rounded-xl bg-white/60 dark:bg-black/10 border border-slate-200 dark:border-slate-800 shadow-xs inline-block w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block"
          style={{ fontFamily: `${handFont}, cursive` }}
        >
          <defs>
            <marker id={`arrowhead-h-${handFont}`} markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={inkColor} />
            </marker>
          </defs>

          {/* Root -> L1 Connectors */}
          {l1Nodes.map((l1, idx) => {
            const startX = rootX + rootBoxWidth / 2;
            const targetX = level1X - l1BoxWidth / 2;
            const midX = startX + (targetX - startX) / 2;
            const pathD = `M ${startX} ${rootY} C ${midX} ${rootY}, ${midX} ${l1.y}, ${targetX - 6} ${l1.y}`;
            return (
              <path
                key={`h-root-l1-${idx}`}
                d={pathD}
                fill="none"
                stroke={inkColor}
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd={`url(#arrowhead-h-${handFont})`}
              />
            );
          })}

          {/* L1 -> L2 Connectors */}
          {l1Nodes.map((l1) => {
            const subChildren = l1.children || [];
            if (subChildren.length === 0) return null;
            const stepY = (subChildren.length * nodeRowHeight) / (subChildren.length + 1);

            return subChildren.map((sub, sIdx) => {
              const subY = l1.startY + stepY * (sIdx + 1);
              const startX = level1X + l1BoxWidth / 2;
              const targetX = level2X - l2BoxWidth / 2;
              const midX = startX + (targetX - startX) / 2;
              const pathD = `M ${startX} ${l1.y} C ${midX} ${l1.y}, ${midX} ${subY}, ${targetX - 6} ${subY}`;
              return (
                <path
                  key={`h-l1-l2-${l1.label}-${sIdx}`}
                  d={pathD}
                  fill="none"
                  stroke={inkColor}
                  strokeWidth="1.4"
                  markerEnd={`url(#arrowhead-h-${handFont})`}
                />
              );
            });
          })}

          {/* Root Node Box */}
          <g transform={`translate(${rootX}, ${rootY})`}>
            <rect x={-rootBoxWidth / 2} y={-rootFontSize - 6} width={rootBoxWidth} height={rootFontSize * 2 + 10} rx="10" fill="#FEF08A" stroke={inkColor} strokeWidth="2" transform="rotate(-1)" />
            <text x="0" y={rootFontSize / 3} textAnchor="middle" fill="#0F172A" fontWeight="bold" fontSize={rootFontSize}>{root}</text>
          </g>

          {/* Level 1 Nodes */}
          {l1Nodes.map((l1, idx) => (
            <g key={`h-node-l1-${idx}`} transform={`translate(${level1X}, ${l1.y})`}>
              <rect x={-l1BoxWidth / 2} y={-l1FontSize - 5} width={l1BoxWidth} height={l1FontSize * 2 + 8} rx="6" fill="#E0F2FE" stroke={inkColor} strokeWidth="1.8" />
              <text x="0" y={l1FontSize / 3} textAnchor="middle" fill={inkColor} fontWeight="bold" fontSize={l1FontSize}>{l1.label}</text>
            </g>
          ))}

          {/* Level 2 Nodes */}
          {l1Nodes.map((l1) => {
            const subChildren = l1.children || [];
            if (subChildren.length === 0) return null;
            const stepY = (subChildren.length * nodeRowHeight) / (subChildren.length + 1);

            return subChildren.map((sub, sIdx) => {
              const subY = l1.startY + stepY * (sIdx + 1);
              const labelText = typeof sub === 'string' ? sub : sub.label || '';
              return (
                <g key={`h-node-l2-${l1.label}-${sIdx}`} transform={`translate(${level2X}, ${subY})`}>
                  <rect x={-l2BoxWidth / 2} y={-l2FontSize - 4} width={l2BoxWidth} height={l2FontSize * 2 + 6} rx="5" fill="#F3E8FF" stroke={inkColor} strokeWidth="1.2" />
                  <text x="0" y={l2FontSize / 3} textAnchor="middle" fill={inkColor} fontWeight="600" fontSize={l2FontSize}>{labelText}</text>
                </g>
              );
            });
          })}
        </svg>
      </div>
    );
  }

  // Vertical Layout
  const leafCountPerL1 = children.map(c => Math.max(1, (c.children?.length || 1)));
  const totalLeafUnits = leafCountPerL1.reduce((a, b) => a + b, 0);

  const unitWidth = Math.max(180, Math.round(fontSize * 11));
  const svgWidth = Math.max(680, totalLeafUnits * unitWidth);
  const svgHeight = Math.round(fontSize * 14 + 40);

  const rootX = svgWidth / 2;
  const rootY = 35;
  const level1Y = rootY + Math.round(fontSize * 4.2);
  const level2Y = level1Y + Math.round(fontSize * 4.2);

  let currentLeafX = 0;
  const l1Positions = children.map((c, idx) => {
    const units = leafCountPerL1[idx];
    const startX = currentLeafX * unitWidth;
    const endX = (currentLeafX + units) * unitWidth;
    const centerX = (startX + endX) / 2;
    currentLeafX += units;
    return { ...c, label: typeof c === 'string' ? c : c.label || '', x: centerX, units, startX, endX };
  });

  return (
    <div className="my-2 p-2 rounded-xl bg-white/60 dark:bg-black/10 border border-slate-200 dark:border-slate-800 shadow-xs inline-block w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto block"
        style={{ fontFamily: `${handFont}, cursive` }}
      >
        <defs>
          <marker id={`arrowhead-v-${handFont}`} markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={inkColor} />
          </marker>
        </defs>

        {/* Level 1 Connectors */}
        {l1Positions.map((l1, idx) => {
          const midY = rootY + (level1Y - rootY) / 2;
          const pathD = `M ${rootX} ${rootY + 18} C ${rootX} ${midY}, ${l1.x} ${midY}, ${l1.x} ${level1Y - 18}`;
          return (
            <path
              key={`v-path-root-l1-${idx}`}
              d={pathD}
              fill="none"
              stroke={inkColor}
              strokeWidth="1.8"
              strokeDasharray="4 3"
              markerEnd={`url(#arrowhead-v-${handFont})`}
            />
          );
        })}

        {/* Level 2 Connectors */}
        {l1Positions.map((l1) => {
          const subChildren = l1.children || [];
          if (subChildren.length === 0) return null;
          const numSub = subChildren.length;
          const subSpacing = (l1.endX - l1.startX) / (numSub + 1);

          return subChildren.map((sub, sIdx) => {
            const subX = l1.startX + subSpacing * (sIdx + 1);
            const midY = level1Y + (level2Y - level1Y) / 2;
            const pathD = `M ${l1.x} ${level1Y + 18} C ${l1.x} ${midY}, ${subX} ${midY}, ${subX} ${level2Y - 14}`;
            return (
              <path
                key={`v-path-l1-l2-${l1.label}-${sIdx}`}
                d={pathD}
                fill="none"
                stroke={inkColor}
                strokeWidth="1.4"
                markerEnd={`url(#arrowhead-v-${handFont})`}
              />
            );
          });
        })}

        {/* Root Node */}
        <g transform={`translate(${rootX}, ${rootY})`}>
          <rect x="-80" y={-rootFontSize - 6} width="160" height={rootFontSize * 2 + 10} rx="12" fill="#FEF08A" stroke={inkColor} strokeWidth="2" transform="rotate(-1)" />
          <text x="0" y={rootFontSize / 3} textAnchor="middle" fill="#0F172A" fontWeight="bold" fontSize={rootFontSize}>{root}</text>
        </g>

        {/* Level 1 Nodes */}
        {l1Positions.map((l1, idx) => {
          const labelText = l1.label;
          const boxWidth = Math.max(140, Math.min(220, labelText.length * (l1FontSize * 0.6) + 30));
          return (
            <g key={`v-node-l1-${idx}`} transform={`translate(${l1.x}, ${level1Y})`}>
              <rect x={-boxWidth / 2} y={-l1FontSize - 5} width={boxWidth} height={l1FontSize * 2 + 8} rx="8" fill="#E0F2FE" stroke={inkColor} strokeWidth="1.8" />
              <text x="0" y={l1FontSize / 3} textAnchor="middle" fill={inkColor} fontWeight="bold" fontSize={l1FontSize}>{labelText}</text>
            </g>
          );
        })}

        {/* Level 2 Nodes */}
        {l1Positions.map((l1) => {
          const subChildren = l1.children || [];
          if (subChildren.length === 0) return null;
          const numSub = subChildren.length;
          const subSpacing = (l1.endX - l1.startX) / (numSub + 1);

          return subChildren.map((sub, sIdx) => {
            const subX = l1.startX + subSpacing * (sIdx + 1);
            const labelText = typeof sub === 'string' ? sub : sub.label || '';
            const boxWidth = Math.max(120, Math.min(180, labelText.length * (l2FontSize * 0.6) + 24));
            return (
              <g key={`v-node-l2-${l1.label}-${sIdx}`} transform={`translate(${subX}, ${level2Y})`}>
                <rect x={-boxWidth / 2} y={-l2FontSize - 4} width={boxWidth} height={l2FontSize * 2 + 6} rx="6" fill="#F3E8FF" stroke={inkColor} strokeWidth="1.2" />
                <text x="0" y={l2FontSize / 3} textAnchor="middle" fill={inkColor} fontWeight="600" fontSize={l2FontSize}>{labelText}</text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}
