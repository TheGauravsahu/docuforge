import { ai, MODEL_FALLBACK_LIST } from '../../config/gemini.js';
import { getGradePromptInstructions } from '../ai/ai.service.js';

const executeWithFallback = async (aiCallFn) => {
  let lastError = null;
  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      return await aiCallFn(modelName);
    } catch (err) {
      console.warn(`[Notes AI Fallback] Model ${modelName} failed: ${err.message}. Trying next fallback...`);
      lastError = err;
      if (err.status === 429 || err.message?.includes('Quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  throw lastError || new Error('All Gemini API models failed for notes generation.');
};

export const generateNotesOutlineService = async ({ topic, referenceText, targetClass = 'Class X' }) => {
  if (!ai) {
    throw new Error('Gemini API Key is not configured on server.');
  }

  const gradeInstructions = getGradePromptInstructions(targetClass);

  const prompt = `You are an expert master educator creating structured handwritten study revision notes for students.
TOPIC: ${topic}
TARGET CLASS/LEVEL: ${targetClass}
${gradeInstructions}

${referenceText ? `REFERENCE MATERIAL (Use strictly as source text):\n${referenceText.substring(0, 3000)}\n` : ''}

Generate an outline for handwritten study notes. The outline must break the topic down into 4-6 key study sections (e.g. Overview & Definitions, Classification/Hierarchy, Key Properties & Comparisons, Visual Diagrams, and NCERT Revision Questions).

Return ONLY valid JSON matching this schema:
{
  "title": "Main Notes Title",
  "sections": [
    {
      "id": "sec_1",
      "heading": "Section Heading",
      "description": "Brief summary of what this section covers",
      "suggestedBlockTypes": ["banner_title", "definition_box", "bullet_list", "comparison_table", "hierarchy_diagram", "qa_section"]
    }
  ]
}`;

  return await executeWithFallback(async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(cleanJson);
  });
};

export const generateNotesBlocksService = async ({ topic, outline, styleConfig = {}, targetClass = 'Class X' }) => {
  if (!ai) {
    throw new Error('Gemini API Key is not configured on server.');
  }

  const gradeInstructions = getGradePromptInstructions(targetClass);

  const defaultStyleConfig = {
    handFont: styleConfig.handFont || 'kalam',
    paperType: styleConfig.paperType || 'ruled',
    paperColor: styleConfig.paperColor || '#FFFFFF',
    inkColor: styleConfig.inkColor || '#1E1B4B',
    highlightPalette: styleConfig.highlightPalette || ['#FFF176', '#FFB6C1', '#B2DFDB', '#D1C4E9']
  };

  const prompt = `You are an elite academic notes creator. Generate high-yield handwritten study revision notes for:
TOPIC: ${topic}
TARGET CLASS/LEVEL: ${targetClass}
${gradeInstructions}

OUTLINE SECTIONS:
${JSON.stringify(outline || [])}

Generate multi-page structured handwritten notebook pages (2 to 3 pages).
Block Types available:
1. "banner_title": { "type": "banner_title", "text": "MAIN TITLE", "highlightColor": "#FFF176" }
2. "definition_box": { "type": "definition_box", "label": "Term", "text": "Detailed definition", "highlightColor": "#B2DFDB" }
3. "bullet_list": { "type": "bullet_list", "heading": "Heading", "items": ["Item 1", "Item 2"], "sideNote": "Optional note" }
4. "comparison_table": { "type": "comparison_table", "heading": "Table Title", "columns": ["Col 1", "Col 2"], "rows": [["Cell 1", "Cell 2"]] }
5. "hierarchy_diagram": { "type": "hierarchy_diagram", "root": "Root Concept", "children": [{ "label": "Branch 1", "children": ["Leaf A", "Leaf B"] }] }
6. "qa_section": { "type": "qa_section", "items": [{ "question": "Q1?", "answer": "Answer...", "source": "NCERT" }] }
7. "side_annotation": { "type": "side_annotation", "text": "Key Exam Tip / Formula" }

RULES:
- Distribute content into 2 to 3 pages (e.g. Page 1: Overview & Definitions, Page 2: Classification Tree & Comparison Table, Page 3: Detailed Notes & NCERT Q&A).
- Each page should have 3 to 5 rich blocks.
- Ensure at least 1 "hierarchy_diagram" tree classification.
- Ensure at least 1 "comparison_table".
- Ensure a "qa_section" with 2-3 NCERT/board exam revision questions.

Return ONLY valid JSON matching this schema:
{
  "styleConfig": ${JSON.stringify(defaultStyleConfig)},
  "pages": [
    {
      "id": "page_1",
      "title": "Page 1: Overview & Key Concepts",
      "blocks": [
        { "type": "banner_title", "text": "${topic}", "highlightColor": "#FFF176" }
      ]
    },
    {
      "id": "page_2",
      "title": "Page 2: Classifications & Comparison",
      "blocks": []
    }
  ]
}`;

  const result = await executeWithFallback(async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleanJson);

    // If API returned flat blocks instead of pages, auto-chunk into pages
    if (parsed.blocks && (!parsed.pages || parsed.pages.length === 0)) {
      const allBlocks = parsed.blocks;
      const pages = [];
      const chunkSize = 4;
      for (let i = 0; i < allBlocks.length; i += chunkSize) {
        pages.push({
          id: `page_${pages.length + 1}`,
          title: `Page ${pages.length + 1}`,
          blocks: allBlocks.slice(i, i + chunkSize),
        });
      }
      parsed.pages = pages;
      delete parsed.blocks;
    }

    return parsed;
  });

  return result;
};

export const regenerateSingleBlockService = async ({ block, topic, styleConfig, targetClass = 'Class X' }) => {
  if (!ai) {
    throw new Error('Gemini API Key is not configured on server.');
  }

  const prompt = `Regenerate and enhance this single handwritten notes block for TOPIC: "${topic}".
Current Block:
${JSON.stringify(block)}

Return ONLY valid JSON for the updated block. Ensure it keeps the same block "type" but has updated, clear, accurate academic text.`;

  return await executeWithFallback(async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(cleanJson);
  });
};

export const continueNotesService = async ({ documentTitle, existingPages = [], userInstruction = '', targetClass = 'Class X' }) => {
  if (!ai) {
    throw new Error('Gemini API Key is not configured on server.');
  }

  const gradeInstructions = getGradePromptInstructions(targetClass);

  const existingSummary = existingPages.map((p, idx) => {
    const blockTitles = (p.blocks || []).map(b => b.heading || b.title || b.text || b.label || b.type).join(', ');
    return `Page ${idx + 1} (${p.title}): ${blockTitles}`;
  }).join('\n');

  const prompt = `You are a master educator continuing handwritten study revision notes for:
DOCUMENT TITLE: ${documentTitle}
TARGET CLASS/LEVEL: ${targetClass}
${gradeInstructions}

CURRENT PROGRESS & PAGES CREATED SO FAR:
${existingSummary}

USER INSTRUCTION FOR CONTINUATION:
${userInstruction ? userInstruction : 'Analyze the existing notes, see where they stopped, and generate the next 1 to 2 pages covering the logical next topics in the syllabus.'}

REQUIREMENTS:
- Analyze where the previous page left off and seamlessly continue with the next subtopics/concepts.
- Generate 1 to 2 new pages ("pages": [{ "id": "...", "title": "Page X: ...", "blocks": [...] }]).
- Include relevant block types ("banner_title", "definition_box", "bullet_list", "comparison_table", "hierarchy_diagram", "side_annotation", "qa_section").

Return ONLY valid JSON matching this schema:
{
  "pages": [
    {
      "id": "page_cont_1",
      "title": "Page ${existingPages.length + 1}: Next Concept",
      "blocks": [
        { "type": "banner_title", "text": "NEXT SECTION TITLE", "highlightColor": "#FFF176" }
      ]
    }
  ]
}`;

  return await executeWithFallback(async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    return JSON.parse(cleanJson);
  });
};
