import PptxGenJS from 'pptxgenjs';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const exportToPptx = async (contentJson, docTitle) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'DocuForge AI';
  pptx.title = docTitle;

  const pages = contentJson.pages || [];

  for (const page of pages) {
    const slide = pptx.addSlide();
    
    // Add page title / header
    slide.addText(page.title || page.type.toUpperCase(), {
      x: 0.5,
      y: 0.5,
      w: 9.0,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: (contentJson.theme?.primaryColor || '1E5B3F').replace('#', ''),
      align: 'left'
    });

    // Add elements
    const elements = page.elements || [];
    let currentY = 1.5;

    for (const el of elements) {
      if (el.type === 'text') {
        slide.addText(el.content, {
          x: 0.5,
          y: currentY,
          w: 9.0,
          h: 1.2,
          fontSize: el.fontSize ? Math.round(el.fontSize * 0.8) : 14,
          color: (el.color || '333333').replace('#', ''),
          align: el.align || 'left'
        });
        currentY += 1.3;
      }
    }
  }

  const base64 = await pptx.write({ outputType: 'base64' });
  return `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`;
};

export const exportToDocx = async (contentJson, docTitle) => {
  const pages = contentJson.pages || [];
  const docChildren = [];

  // Title section
  docChildren.push(
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  for (const page of pages) {
    docChildren.push(
      new Paragraph({
        text: page.title || page.type.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
    );

    const elements = page.elements || [];
    for (const el of elements) {
      if (el.type === 'text') {
        const textRuns = el.content.split('\n').map((line, idx) => {
          return new TextRun({
            text: line,
            bold: Boolean(el.fontWeight === 'bold'),
            break: idx > 0 ? 1 : 0,
            size: el.fontSize ? el.fontSize * 2 : 24,
          });
        });

        docChildren.push(
          new Paragraph({
            children: textRuns,
            alignment: el.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { after: 150 }
          })
        );
      }
    }
  }

  const doc = new DocxDocument({
    sections: [{ properties: {}, children: docChildren }]
  });

  const buffer = await Packer.toBuffer(doc);
  return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`;
};

export const exportToPdfHtml = (contentJson, docTitle) => {
  const theme = contentJson.theme || {};
  const pages = contentJson.pages || [];
  const primaryColor = theme.primaryColor || '#1E5B3F';
  const accentColor = theme.accentColor || '#C1663E';
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

  let htmlPages = pages.map((page, pIdx) => {
    const pageElementsHtml = (page.elements || []).map((el) => {
      if (el.type === 'text') {
        const topPos = el.y || 50;
        const leftPos = el.x || 45;
        const widthVal = el.width || 610;
        const fontFam = el.fontFamily || theme.fontFamily || 'Georgia';

        // Resolve element text color to active theme colors for headers & titles
        let textColor = el.color || primaryColor;
        if (
          el.id === 'c_1' || el.id === 'c_4' || el.id === 'cert_1' ||
          el.id === 'decl_1' || el.id === 'ind_1' || el.id === 'bib_1' ||
          (el.id && el.id.includes('ch_') && el.id.includes('_title'))
        ) {
          textColor = primaryColor;
        } else if (
          el.id === 'c_2' || el.id === 'cert_sub' ||
          (el.id && el.id.includes('ch_') && el.id.includes('_sub'))
        ) {
          textColor = accentColor;
        }

        const style = `
          position: absolute;
          top: ${topPos}px;
          left: ${leftPos}px;
          width: ${widthVal}px;
          max-width: ${widthVal}px;
          font-size: ${el.fontSize || 14}px;
          font-weight: ${el.fontWeight || 'normal'};
          font-family: '${fontFam}', 'Inter', 'Geist', 'Cinzel', serif, sans-serif;
          text-align: ${el.align || 'left'};
          color: ${textColor};
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          line-height: 1.4;
          box-sizing: border-box;
        `;
        return `<div class="element-text" style="${style}">${el.content}</div>`;
      } else if (el.type === 'image' && el.url) {
        const style = `
          position: absolute;
          top: ${el.y || 100}px;
          left: ${el.x || 50}px;
          width: ${el.width || 320}px;
          height: ${el.height || 220}px;
          object-fit: fill;
          border-radius: 4px;
          box-sizing: border-box;
        `;
        return `<img src="${el.url}" style="${style}" alt="Inserted Media" />`;
      }
      return '';
    }).join('');

    return `
      <div class="page" style="
        width: 794px;
        height: 1123px;
        padding: 20px;
        margin: 0 auto;
        background: ${theme.backgroundColor || '#FAFAF8'};
        box-sizing: border-box;
        position: relative;
        font-family: '${defaultFontFamily}', 'Inter', 'Geist', 'Cinzel', serif, sans-serif;
        page-break-after: always;
        page-break-inside: avoid;
        overflow: hidden;
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
          <div style="position: absolute; bottom: 16px; left: 35px; right: 35px; display: flex; justify-content: space-between; font-size: 11px; color: #888; border-top: 1px solid #E5E7EB; padding-top: 6px;">
            <span>DocuForge AI Studio</span>
            <span>Page ${pIdx + 1} of ${pages.length}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400..800;1,9..40,400..800&family=Fira+Code:wght@400;500;600&family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #ECECEC; padding: 0; font-family: '${defaultFontFamily}', 'Inter', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 794px; height: 1123px; position: relative; overflow: hidden; page-break-after: always; page-break-inside: avoid; }
          .element-text { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
          @media print {
            body { background: white; padding: 0; }
            .page { margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; page-break-after: always; }
          }
        </style>
      </head>
      <body>
        ${htmlPages}
      </body>
    </html>
  `;
};
