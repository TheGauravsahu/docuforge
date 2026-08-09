export const generatePdfHtml = (contentJson, docTitle = 'Document') => {
  const theme = contentJson.theme || {};
  const pages = contentJson.pages || [];
  const styleConfig = contentJson.styleConfig || {};

  const isNotes = Boolean(styleConfig.handFont || (pages[0] && pages[0].blocks));

  if (isNotes) {
    const handFont = styleConfig.handFont || 'Kalam';
    const paperType = styleConfig.paperType || 'ruled';
    const paperColor = styleConfig.paperColor || '#FFFFFF';
    const inkColor = styleConfig.inkColor || '#1E1B4B';
    const globalFontSize = styleConfig.fontSize || 16;
    const highlightPalette = styleConfig.highlightPalette || ['#FFF176', '#FFB6C1', '#B2DFDB', '#D1C4E9'];

    const getFontFamily = (name) => {
      switch (name) {
        case 'Caveat': return "'Caveat', cursive, sans-serif";
        case 'Patrick Hand': return "'Patrick Hand', cursive, sans-serif";
        case 'Permanent Marker': return "'Permanent Marker', cursive, sans-serif";
        case 'Shadows Into Light': return "'Shadows Into Light', cursive, sans-serif";
        case 'Kalam':
        default:
          return "'Kalam', cursive, sans-serif";
      }
    };

    const getPaperStyle = () => {
      if (paperType === 'ruled') {
        return `background-color: ${paperColor}; background-image: linear-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px); background-size: 100% 30px; line-height: 30px;`;
      } else if (paperType === 'grid') {
        return `background-color: ${paperColor}; background-image: linear-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.28) 1px, transparent 1px); background-size: 24px 24px;`;
      }
      return `background-color: ${paperColor};`;
    };

    const htmlPages = pages.map((page, pIdx) => {
      const blocksHtml = (page.blocks || []).map((b) => {
        const blockFont = b.font || handFont;
        const fontFam = getFontFamily(blockFont);
        const bFontSize = b.fontSize || globalFontSize;

        // Freeform Text
        if (b.type === 'freeform_text') {
          const textContent = b.text || b.content || '';
          return `
            <div class="block-item" style="margin: 16px 0; font-family: ${fontFam}; font-size: ${bFontSize}px; line-height: 1.5; page-break-inside: avoid; break-inside: avoid;">
              <p style="margin: 0;">${textContent}</p>
            </div>
          `;
        }

        // Banner Title
        if (b.type === 'banner_title') {
          const titleText = b.text || b.title || b.heading || '';
          return `
            <div class="block-item" style="margin: 18px 0; text-align: center; page-break-inside: avoid; break-inside: avoid;">
              <div style="display: inline-block; padding: 8px 28px; border-radius: 16px; border: 2px solid ${inkColor}; background-color: ${b.highlightColor || highlightPalette[0]}; transform: rotate(-1deg);">
                <h1 style="margin: 0; font-size: 20px; font-weight: 800; font-family: ${fontFam}; color: #0F172A; text-transform: uppercase;">
                  ${titleText}
                </h1>
              </div>
            </div>
          `;
        }

        // Definition Box
        if (b.type === 'definition_box') {
          const defLabel = b.label || b.title || b.term || 'Key Definition';
          const defText = b.text || b.definition || b.content || b.desc || b.explanation || '';
          return `
            <div class="block-item" style="padding: 12px 16px; border-radius: 16px; border: 2px solid ${inkColor}; background-color: ${b.highlightColor || highlightPalette[2]}; margin: 18px 0; font-family: ${fontFam}; font-size: ${bFontSize}px; transform: rotate(0.5deg); page-break-inside: avoid; break-inside: avoid;">
              <div style="font-weight: bold; font-size: 15px; border-bottom: 1px solid ${inkColor}40; padding-bottom: 4px; margin-bottom: 6px;">
                🏷️ ${defLabel}
              </div>
              <p style="margin: 0; line-height: 1.5;">${defText}</p>
            </div>
          `;
        }

        // Bullet List
        if (b.type === 'bullet_list') {
          const headingText = b.heading || b.title || '';
          const itemsList = b.items || b.bullets || b.points || [];
          const itemsHtml = itemsList.map(item => `<li style="margin-bottom: 4px; font-size: ${bFontSize}px;"><span style="color: #10B981; font-weight: bold;">•</span> ${item}</li>`).join('');
          return `
            <div class="block-item" style="margin: 18px 0; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              ${headingText ? `<h3 style="margin: 0 0 6px 0; font-size: ${bFontSize + 1}px; font-weight: bold; text-decoration: underline;">${headingText}</h3>` : ''}
              <ul style="list-style: none; padding-left: 14px; margin: 0;">${itemsHtml}</ul>
              ${b.sideNote || b.note ? `<div style="text-align: right; font-size: 12px; font-style: italic; opacity: 0.8; margin-top: 4px;">✍️ Note: ${b.sideNote || b.note}</div>` : ''}
            </div>
          `;
        }

        // Comparison Table
        if (b.type === 'comparison_table') {
          const cols = b.columns || b.cols || b.headers || [];
          const rows = b.rows || b.data || [];
          const colsHtml = cols.map(c => `<th style="padding: 8px 10px; border: 2px solid ${inkColor}; text-align: left; background-color: ${highlightPalette[0]}; font-size: 14px;">${c}</th>`).join('');
          const rowsHtml = rows.map(r => `<tr>${r.map(cell => `<td style="padding: 8px 10px; border: 2px solid ${inkColor}; font-size: 13.5px;">${cell}</td>`).join('')}</tr>`).join('');
          return `
            <div class="block-item" style="margin: 20px 0; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              ${b.heading || b.title ? `<h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold;">${b.heading || b.title}</h3>` : ''}
              <table style="width: 100%; border-collapse: collapse; border: 2px solid ${inkColor}; border-radius: 10px; overflow: hidden;">
                <thead><tr>${colsHtml}</tr></thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          `;
        }

        // Hierarchy Diagram (SVG Classification Tree)
        if (b.type === 'hierarchy_diagram') {
          const rootText = b.root || b.title || 'Classification';
          const childrenNodes = b.children || b.branches || [];
          const isHorizontal = (b.orientation || 'horizontal') === 'horizontal';

          const l1Labels = childrenNodes.map(c => typeof c === 'string' ? c : c.label || '');
          const allL2Labels = childrenNodes.flatMap(c => (c.children || []).map(sub => typeof sub === 'string' ? sub : sub.label || ''));

          const maxRootLen = Math.max(8, rootText.length);
          const maxL1Len = Math.max(10, ...l1Labels.map(l => l.length));
          const maxL2Len = Math.max(12, ...allL2Labels.map(l => l.length));

          const rootBoxWidth = Math.min(220, Math.max(120, maxRootLen * 8 + 24));
          const l1BoxWidth = Math.min(240, Math.max(140, maxL1Len * 7 + 24));
          const l2BoxWidth = Math.min(240, Math.max(130, maxL2Len * 6.5 + 24));

          const gap = 80;
          const rootX = rootBoxWidth / 2 + 10;
          const level1X = rootX + rootBoxWidth / 2 + l1BoxWidth / 2 + gap;
          const level2X = level1X + l1BoxWidth / 2 + l2BoxWidth / 2 + gap;

          const totalLeafUnits = childrenNodes.reduce((acc, c) => acc + Math.max(1, c.children?.length || 1), 0);
          const nodeRowHeight = 45;

          const svgWidth = Math.max(680, level2X + l2BoxWidth / 2 + 20);
          const svgHeight = Math.max(160, totalLeafUnits * nodeRowHeight + 20);

          const rootY = svgHeight / 2;

          let currentY = 20;
          const l1Nodes = childrenNodes.map((c) => {
            const subCount = Math.max(1, c.children?.length || 1);
            const nodeY = currentY + (subCount * nodeRowHeight) / 2;
            const startY = currentY;
            currentY += subCount * nodeRowHeight;
            return { ...c, label: typeof c === 'string' ? c : c.label || '', y: nodeY, startY, subCount };
          });

          const connectorsHtml = isHorizontal
            ? l1Nodes.map((l1, idx) => {
                const startX = rootX + rootBoxWidth / 2;
                const targetX = level1X - l1BoxWidth / 2;
                const midX = startX + (targetX - startX) / 2;
                return `<path d="M ${startX} ${rootY} C ${midX} ${rootY}, ${midX} ${l1.y}, ${targetX - 6} ${l1.y}" fill="none" stroke="${inkColor}" stroke-width="1.8" stroke-dasharray="4 3" />`;
              }).join('') +
              l1Nodes.flatMap((l1) => {
                const subChildren = l1.children || [];
                if (subChildren.length === 0) return [];
                const stepY = (subChildren.length * nodeRowHeight) / (subChildren.length + 1);
                return subChildren.map((sub, sIdx) => {
                  const subY = l1.startY + stepY * (sIdx + 1);
                  const startX = level1X + l1BoxWidth / 2;
                  const targetX = level2X - l2BoxWidth / 2;
                  const midX = startX + (targetX - startX) / 2;
                  return `<path d="M ${startX} ${l1.y} C ${midX} ${l1.y}, ${midX} ${subY}, ${targetX - 6} ${subY}" fill="none" stroke="${inkColor}" stroke-width="1.4" />`;
                });
              }).join('')
            : '';

          const rootNodeHtml = `<g transform="translate(${rootX}, ${rootY})">
            <rect x="${-rootBoxWidth / 2}" y="-16" width="${rootBoxWidth}" height="32" rx="8" fill="#FEF08A" stroke="${inkColor}" stroke-width="2" />
            <text x="0" y="4" text-anchor="middle" fill="#0F172A" font-weight="bold" font-size="12.5">${rootText}</text>
          </g>`;

          const l1NodesHtml = l1Nodes.map((l1) => `<g transform="translate(${level1X}, ${l1.y})">
            <rect x="${-l1BoxWidth / 2}" y="-14" width="${l1BoxWidth}" height="28" rx="6" fill="#E0F2FE" stroke="${inkColor}" stroke-width="1.8" />
            <text x="0" y="4" text-anchor="middle" fill="${inkColor}" font-weight="bold" font-size="11 shadow">${l1.label}</text>
          </g>`).join('');

          const l2NodesHtml = l1Nodes.flatMap((l1) => {
            const subChildren = l1.children || [];
            if (subChildren.length === 0) return [];
            const stepY = (subChildren.length * nodeRowHeight) / (subChildren.length + 1);
            return subChildren.map((sub, sIdx) => {
              const subY = l1.startY + stepY * (sIdx + 1);
              const labelText = typeof sub === 'string' ? sub : sub.label || '';
              return `<g transform="translate(${level2X}, ${subY})">
                <rect x="${-l2BoxWidth / 2}" y="-12" width="${l2BoxWidth}" height="24" rx="5" fill="#F3E8FF" stroke="${inkColor}" stroke-width="1.2" />
                <text x="0" y="3" text-anchor="middle" fill="${inkColor}" font-weight="600" font-size="10.5">${labelText}</text>
              </g>`;
            });
          }).join('');

          const scaleVal = b.scale ? `${b.scale}%` : '100%';

          return `
            <div class="block-item" style="margin: 18px auto; width: ${scaleVal}; padding: 6px; border-radius: 12px; background-color: rgba(255,255,255,0.6); border: 1px solid #CBD5E1; page-break-inside: avoid; break-inside: avoid;">
              <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: auto; display: block; font-family: ${fontFam};">
                ${connectorsHtml}
                ${rootNodeHtml}
                ${l1NodesHtml}
                ${l2NodesHtml}
              </svg>
            </div>
          `;
        }

        // Formula Box
        if (b.type === 'formula_box') {
          return `
            <div class="block-item" style="margin: 18px 0; padding: 12px; border-radius: 16px; border: 2px solid ${inkColor}; background-color: #FEF3C7; text-align: center; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #92400E;">⚡ ${b.title || 'Formula / Principle'}</div>
              <div style="font-size: 18px; font-weight: 800; margin: 4px 0; color: #1E1B4B;">${b.formula || b.equation || ''}</div>
              ${b.desc || b.description ? `<p style="margin: 0; font-size: 12px; font-style: italic;">${b.desc || b.description}</p>` : ''}
            </div>
          `;
        }

        // Checklist Summary
        if (b.type === 'checklist_summary') {
          const chkItems = b.items || b.points || [];
          const chkHtml = chkItems.map(item => `<div style="margin-bottom: 4px; font-size: 13.5px;"><span style="color: #10B981; font-weight: bold;">✓</span> ${item}</div>`).join('');
          return `
            <div class="block-item" style="margin: 18px 0; padding: 12px 16px; border-radius: 16px; border: 2px solid #10B981; background-color: #ECFDF5; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              <div style="font-weight: bold; font-size: 14.5px; border-bottom: 1px solid #10B98140; padding-bottom: 4px; margin-bottom: 6px; color: #065F46;">
                ☑️ ${b.heading || b.title || 'Quick Revision Checklist'}
              </div>
              ${chkHtml}
            </div>
          `;
        }

        // Q&A Section
        if (b.type === 'qa_section') {
          const qaItems = b.items || b.questions || [];
          const qaHtml = qaItems.map((qa, i) => {
            const q = typeof qa === 'string' ? qa : (qa.question || qa.q || qa.title || '');
            const a = typeof qa === 'string' ? '' : (qa.answer || qa.ans || qa.a || qa.content || '');
            return `
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 2px 0; font-weight: bold; color: #047857; font-size: 14px;">Q${i + 1}: ${q}</p>
                <p style="margin: 0; padding-left: 10px; font-size: 14px;"><strong style="color: #4F46E5;">Ans:</strong> ${a}</p>
              </div>
            `;
          }).join('');
          return `
            <div class="block-item" style="margin: 18px 0; padding: 12px 16px; border-radius: 16px; border: 2px solid ${inkColor}; background-color: #FEF3C7; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              <div style="font-weight: bold; font-size: 14.5px; border-bottom: 1px solid ${inkColor}40; padding-bottom: 4px; margin-bottom: 8px; color: #92400E;">
                ❓ ${b.title || 'NCERT & Board Revision Questions'}
              </div>
              ${qaHtml}
            </div>
          `;
        }

        // Side Annotation / Exam Tip
        if (b.type === 'side_annotation') {
          let tipText = b.text || b.note || b.tip || b.content || '';
          tipText = tipText.replace(/^(Exam Tip:|Note:|\s)+/i, '').trim();
          return `
            <div class="block-item" style="margin: 16px 0; padding: 8px 14px; border-left: 4px solid #10B981; background-color: #ECFDF5; border-radius: 8px; font-style: italic; font-size: 13.5px; font-family: ${fontFam}; page-break-inside: avoid; break-inside: avoid;">
              💡 <strong>Exam Tip:</strong> ${tipText}
            </div>
          `;
        }

        return '';
      }).join('');

      return `
        <div class="page-container" style="page-break-after: always; page-break-inside: auto; padding: 18mm 20mm; box-sizing: border-box; position: relative;">
          ${paperType === 'ruled' ? `<div style="position: absolute; top:0; bottom:0; left: 16mm; width: 2px; background-color: #EF4444; opacity: 0.7;"></div>` : ''}
          <div class="page-header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #CBD5E1; padding-bottom: 6px; margin-bottom: 16px; font-size: 12px; font-weight: bold; font-family: '${handFont}', cursive, sans-serif; color: ${inkColor};">
            <span>DATE: ${new Date().toLocaleDateString()}</span>
            <span style="font-size: 13px;">${page.title || docTitle}</span>
            <span>SECTION: ${pIdx + 1} / ${pages.length}</span>
          </div>
          <div class="page-body" style="
            font-family: '${handFont}', 'Kalam', cursive, sans-serif;
            font-size: ${globalFontSize}px;
            color: ${inkColor};
            ${getPaperStyle()}
            border-radius: 12px;
            padding: 16px;
            position: relative;
          ">
            ${blocksHtml}
          </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Permanent+Marker&family=Shadows+Into+Light&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Permanent+Marker&family=Shadows+Into+Light&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      font-family: '${handFont}', 'Kalam', cursive, sans-serif;
    }
    .page-container {
      page-break-after: always;
      page-break-inside: auto;
    }
    .block-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${htmlPages}
</body>
</html>`;
  }

  // Standard Document PDF Export
  const primaryColor = theme.primaryColor || '#1E5B3F';
  const borderStyleStr = theme.borderStyle || 'double';
  const defaultFontFamily = theme.fontFamily || 'Georgia';
  const borderColor = theme.borderColor || primaryColor;

  let pageBorderCss = 'border: 4px double ' + borderColor + ';';
  if (borderStyleStr.includes('single')) {
    pageBorderCss = 'border: 2px solid ' + borderColor + ';';
  } else if (borderStyleStr.includes('ornamental')) {
    pageBorderCss = 'border: 4px double ' + borderColor + '; outline: 1px solid ' + borderColor + '; outline-offset: 4px;';
  } else if (borderStyleStr.includes('none')) {
    pageBorderCss = 'border: none;';
  }

  const htmlPages = pages.map((page, pIdx) => {
    const pageElementsHtml = (page.elements || []).map((el) => {
      if (el.type === 'text') {
        const topPos = el.y || 50;
        const leftPos = el.x || 45;
        const widthVal = el.width || 610;
        const fontFam = el.fontFamily || theme.fontFamily || 'Georgia';
        const textColor = el.color || primaryColor;

        const style = `
          position: absolute;
          top: ${topPos}px;
          left: ${leftPos}px;
          width: ${widthVal}px;
          max-width: ${widthVal}px;
          font-size: ${el.fontSize || 14}px;
          font-weight: ${el.fontWeight || 'normal'};
          font-style: ${el.fontStyle || 'normal'};
          text-decoration: ${[el.underline ? 'underline' : '', el.linethrough ? 'line-through' : ''].filter(Boolean).join(' ') || 'none'};
          background-color: ${el.textBackgroundColor || 'transparent'};
          font-family: '${fontFam}', 'Inter', serif, sans-serif;
          text-align: ${el.align || 'left'};
          color: ${textColor};
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: ${el.lineHeight || 1.4};
          box-sizing: border-box;
        `;
        return `<div class="element-text" style="${style}">${el.content || ''}</div>`;
      } else if (el.type === 'image' && el.url) {
        const style = `
          position: absolute;
          top: ${el.y || 100}px;
          left: ${el.x || 50}px;
          width: ${el.width || 320}px;
          height: ${el.height || 220}px;
          object-fit: fill;
          border-radius: 4px;
        `;
        return `<img src="${el.url}" style="${style}" alt="Inserted Media" />`;
      }
      return '';
    }).join('');

    return `
      <div class="page" style="
        width: 100%;
        height: 100%;
        padding: 20px;
        background: ${theme.backgroundColor || '#FAFAF8'};
        box-sizing: border-box;
        position: relative;
        font-family: '${defaultFontFamily}', 'Georgia', serif, sans-serif;
        page-break-after: always;
        page-break-inside: avoid;
      ">
        <div class="page-frame" style="
          width: 100%;
          height: 100%;
          position: relative;
          box-sizing: border-box;
          ${pageBorderCss}
          padding: 20px;
        ">
          ${pageElementsHtml}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${docTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { page-break-after: always; page-break-inside: avoid; break-inside: avoid; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${htmlPages}
</body>
</html>`;
};

export const printDocumentPages = (contentJson, docTitle = 'Document') => {
  const htmlContent = generatePdfHtml(contentJson, docTitle);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print your document.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    // Wait for Google Fonts to be ready in print window before calling print
    if (printWindow.document.fonts) {
      printWindow.document.fonts.ready.then(() => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 300);
      });
    } else {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };
};
