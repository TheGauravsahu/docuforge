import { ai, GEMINI_MODELS, MODEL_FALLBACK_LIST } from '../../config/gemini.js';

const generateContentWithFallback = async (prompt, config = { responseMimeType: 'application/json' }) => {
  if (!ai) return null;

  for (const model of MODEL_FALLBACK_LIST) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`[Gemini AI] Model "${model}" failed (${err.status || err.message}). Retrying with next fallback model...`);
    }
  }

  return null;
};

export const generateSectionService = async ({ title, topic = '' }) => {
  const prompt = `You are an expert academic author.
Generate detailed academic page content for a new section / chapter titled: "${title}" ${topic ? `for the project topic: "${topic}"` : ''}.

The content MUST be specifically about "${title}" related to "${topic || title}". Do NOT write about any other subject.

Respond ONLY with valid JSON in the following format:
{
  "title": "${title}",
  "subtopics": ["Subtopic 1 related to ${title}", "Subtopic 2 related to ${title}", "Subtopic 3 related to ${title}"],
  "bodyParagraphs": [
    "Paragraph 1 specifically introducing concepts of ${title}...",
    "Paragraph 2 with theoretical frameworks, key concepts, and important facts about ${title}...",
    "Paragraph 3 with practical applications, examples, and significance of ${title}..."
  ]
}`;

  if (ai) {
    const responseText = await generateContentWithFallback(prompt, { responseMimeType: 'application/json' });
    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch (err) {
        console.warn('[Gemini AI] Failed to parse JSON response:', err.message);
      }
    }
  }

  return {
    title,
    subtopics: ['Core Principles & Theory', 'Key Concepts & Framework', 'Applications & Significance'],
    bodyParagraphs: [
      `This section provides a detailed academic analysis of ${title}. ${topic ? `Within the context of ${topic}, this chapter` : 'This chapter'} explores the foundational principles, theoretical underpinnings, and practical relevance of the subject matter.`,
      `Theoretical Framework & Key Concepts:\nThe study of ${title} involves understanding its core mechanisms, governing principles, and relationship to broader academic fields. Researchers and scholars have identified several critical dimensions that define this domain and contribute to its academic and practical importance.`,
      `Practical Applications & Academic Significance:\nThe insights gained from studying ${title} have far-reaching implications in both theoretical and applied contexts. By systematically analyzing the evidence and data, we can draw meaningful conclusions about the significance of this topic and its contribution to the broader field of knowledge.`
    ]
  };
};

export const generateOutlineService = async ({ topic, docType = 'PDF', referenceText = '' }) => {
  const prompt = `You are an expert academic document author.
Given the topic: "${topic}" ${referenceText ? `and reference text: "${referenceText.substring(0, 500)}"` : ''}.
Generate a structured JSON outline for a high-quality academic project / presentation / report (${docType}).

The outline MUST be specifically tailored to the topic "${topic}". All chapter titles and subtopics MUST be directly relevant to "${topic}".

Respond ONLY with valid JSON in the following format:
{
  "title": "Full Academic Project Title about ${topic}",
  "subtitle": "Detailed Subtitle or Research Scope about ${topic}",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Introduction & Historical Context of ${topic}",
      "subtopics": ["Background & Principles of ${topic}", "Historical Development", "Real-world Significance"]
    },
    {
      "chapterNumber": 2,
      "title": "Theoretical Framework & Governing Laws of ${topic}",
      "subtopics": ["Core Concepts", "Mathematical/Scientific Derivations", "Working Principle & Mechanisms"]
    },
    {
      "chapterNumber": 3,
      "title": "Experimental Setup & Methodology for ${topic}",
      "subtopics": ["Required Equipment & Specifications", "Model Description", "Step-by-Step Procedure"]
    },
    {
      "chapterNumber": 4,
      "title": "Quantitative Observations & Data Analysis of ${topic}",
      "subtopics": ["Tabulated Measurements", "Calculations & Error Analysis", "Graphical Trends & Interpretation"]
    },
    {
      "chapterNumber": 5,
      "title": "Applications & Engineering Significance of ${topic}",
      "subtopics": ["Modern Technological Applications", "Performance & Efficiency", "Safety & Environmental Considerations"]
    },
    {
      "chapterNumber": 6,
      "title": "Conclusion & Future Scope of ${topic}",
      "subtopics": ["Summary of Findings", "Sources of Experimental Error", "Future Scope & Innovations"]
    }
  ]
}`;

  if (ai) {
    const responseText = await generateContentWithFallback(prompt, { responseMimeType: 'application/json' });
    if (responseText) {
      try {
        return JSON.parse(responseText);
      } catch (err) {
        console.warn('[Gemini AI] Failed to parse JSON response:', err.message);
      }
    }
  }

  // Robust structured topic-aware fallback if AI API key is not present or offline
  const cleanTopic = topic ? topic.trim() : 'Academic Project Study';
  return {
    title: cleanTopic.toUpperCase(),
    subtitle: `A Comprehensive Theoretical, Experimental & Mathematical Analysis of ${cleanTopic}`,
    chapters: [
      {
        chapterNumber: 1,
        title: `Introduction & Historical Context of ${cleanTopic}`,
        subtopics: ['Background & Fundamental Principles', 'Historical Development', 'Significance in Modern Study']
      },
      {
        chapterNumber: 2,
        title: `Theoretical Framework & Core Concepts of ${cleanTopic}`,
        subtopics: ['Core Principles', 'Mathematical Derivations', 'Working Mechanics']
      },
      {
        chapterNumber: 3,
        title: `Experimental Setup & Methodology for ${cleanTopic}`,
        subtopics: ['Required Apparatus & Specifications', 'Model Description', 'Step-by-Step Procedure']
      },
      {
        chapterNumber: 4,
        title: `Quantitative Analysis & Findings of ${cleanTopic}`,
        subtopics: ['Tabulated Measurements', 'Calculations & Error Analysis', 'Graphical Interpretation']
      },
      {
        chapterNumber: 5,
        title: `Practical Applications & Innovations of ${cleanTopic}`,
        subtopics: ['Modern Applications', 'Efficiency & Performance', 'Environmental Considerations']
      },
      {
        chapterNumber: 6,
        title: `Conclusion & Future Scope of ${cleanTopic}`,
        subtopics: ['Summary of Findings', 'Sources of Error', 'Future Enhancements']
      }
    ]
  };
};

const defaultTemplates = {
  tpl_physics_proj: {
    theme: {
      fontFamily: 'Georgia',
      primaryColor: '#1E5B3F',
      accentColor: '#C1663E',
      borderStyle: 'double',
      backgroundColor: '#FAFAF8'
    }
  },
  tpl_cert_excellence: {
    theme: {
      fontFamily: 'Georgia',
      primaryColor: '#8B6508',
      accentColor: '#D4AF37',
      borderStyle: 'ornamental',
      backgroundColor: '#FFFDF9'
    }
  },
  tpl_lab_report: {
    theme: {
      fontFamily: 'Inter',
      primaryColor: '#1E293B',
      accentColor: '#2563EB',
      borderStyle: 'single',
      backgroundColor: '#FFFFFF'
    }
  }
};

export const generateFullDocumentModelService = async ({
  topic,
  docType = 'PDF',
  templateId = 'tpl_physics_proj',
  placeholders = {},
  outline = null
}) => {
  const chosenOutline = outline || (await generateOutlineService({ topic, docType }));

  const schoolName = (placeholders.school_name && placeholders.school_name.trim())
    ? placeholders.school_name.trim()
    : 'DEPARTMENT OF EDUCATION';
  const studentName = (placeholders.student_name && placeholders.student_name.trim())
    ? placeholders.student_name.trim()
    : 'Student Name';
  const rollNumber = (placeholders.roll_number && placeholders.roll_number.trim())
    ? placeholders.roll_number.trim()
    : 'XXXXX';
  const academicYear = (placeholders.academic_year && placeholders.academic_year.trim())
    ? placeholders.academic_year.trim()
    : `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`;
  const guideTeacher = (placeholders.guide_teacher && placeholders.guide_teacher.trim())
    ? placeholders.guide_teacher.trim()
    : 'Teacher-in-Charge';
  const subjectName = (placeholders.subject && placeholders.subject.trim())
    ? placeholders.subject.trim()
    : 'Science & Technology';
  const className = (placeholders.class && placeholders.class.trim())
    ? placeholders.class.trim()
    : 'Class XII';

  const template = defaultTemplates[templateId] || defaultTemplates.tpl_physics_proj;
  const theme = template.theme;

  // ─── Generate AI content for ALL chapters in parallel ───
  console.log(`[AI] Generating unique content for ${chosenOutline.chapters.length} chapters in parallel...`);
  const chapterContents = await Promise.all(
    chosenOutline.chapters.map(async (ch) => {
      try {
        const sec = await generateSectionService({
          title: ch.title,
          topic: chosenOutline.title || topic,
        });
        return sec;
      } catch (err) {
        console.warn(`[AI] Chapter "${ch.title}" content generation failed, using topic-aware fallback.`);
        return {
          title: ch.title,
          subtopics: ch.subtopics || [],
          bodyParagraphs: [
            `This chapter explores ${ch.title} within the context of ${chosenOutline.title || topic}. The foundational concepts and theoretical principles of this subject are essential for a comprehensive understanding of the broader project topic.`,
            `Key Concepts & Framework:\nThe study of ${ch.title} encompasses multiple dimensions of academic inquiry. By examining the core principles, methodologies, and empirical findings associated with this topic, students can develop a thorough grasp of how these elements interconnect and contribute to the field.`,
            `Practical Applications & Conclusions:\nThe knowledge gained from studying ${ch.title} has direct applications in real-world scenarios. Through systematic analysis and experimentation, we can validate the theoretical predictions and draw meaningful conclusions about the practical significance of these findings.`
          ]
        };
      }
    })
  );
  console.log(`[AI] Chapter content generation complete.`);

  const pages = [];

  // 1. Cover Page
  pages.push({
    id: `p_cover_${Date.now()}`,
    type: 'cover',
    title: 'Cover Page',
    elements: [
      { id: 'c_1', type: 'text', content: schoolName.toUpperCase(), fontSize: 24, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: theme.primaryColor },
      { id: 'c_2', type: 'text', content: `DEPARTMENT OF ${subjectName.toUpperCase()} — ${className.toUpperCase()}`, fontSize: 13, fontWeight: 'bold', align: 'center', x: 45, y: 120, width: 610, color: theme.accentColor },
      { id: 'c_3', type: 'text', content: 'INVESTIGATORY PROJECT REPORT', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 200, width: 610, color: '#1A1A1A' },
      { id: 'c_4', type: 'text', content: chosenOutline.title || topic, fontSize: 18, fontWeight: 'bold', align: 'center', x: 45, y: 260, width: 610, color: theme.primaryColor },
      { id: 'c_5', type: 'text', content: chosenOutline.subtitle || 'A Comprehensive Theoretical, Experimental & Mathematical Analysis', fontSize: 13, align: 'center', x: 45, y: 310, width: 610, color: '#555555' },
      { id: 'c_6', type: 'text', content: `Submitted By:\n${studentName}\nRoll Number: ${rollNumber}\nClass & Section: ${className}\n\nUnder the Guidance of:\n${guideTeacher}\nDepartment of ${subjectName}\n${schoolName}\n\nAcademic Session: ${academicYear}`, fontSize: 13, align: 'center', x: 45, y: 440, width: 610, color: '#222222' }
    ]
  });

  // 2. Certificate Page
  pages.push({
    id: `p_cert_${Date.now()}`,
    type: 'certificate',
    title: 'Certificate',
    elements: [
      { id: 'cert_1', type: 'text', content: 'BONAFIDE CERTIFICATE', fontSize: 22, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: theme.primaryColor },
      { id: 'cert_sub', type: 'text', content: `DEPARTMENT OF ${subjectName.toUpperCase()} — ${schoolName.toUpperCase()}`, fontSize: 12, fontWeight: 'bold', align: 'center', x: 45, y: 110, width: 610, color: theme.accentColor },
      { id: 'cert_2', type: 'text', content: `This is to certify that ${studentName}, a bonafide student of ${className} holding Roll Number ${rollNumber} at ${schoolName}, has successfully completed the investigatory project entitled:\n\n"${chosenOutline.title}"\n\nduring the academic session ${academicYear} in partial fulfillment of the requirements for the ${subjectName} curriculum as prescribed by the Board of Examination.`, fontSize: 13, align: 'left', x: 45, y: 170, width: 610, color: '#222222' },
      { id: 'cert_3', type: 'text', content: `The student has exhibited deep scientific curiosity, analytical rigor, and diligence throughout the experimental work and report preparation under my direct supervision. The results documented herein represent authentic experimental data and theoretical derivations.`, fontSize: 13, align: 'left', x: 45, y: 340, width: 610, color: '#333333' },
      { id: 'cert_4', type: 'text', content: `___________________________              ___________________________\nTeacher-in-Charge                          Principal / Head of Institution\n(${guideTeacher})                          (${schoolName})\n\n\n___________________________              ___________________________\nInternal Examiner Signature                External Examiner Signature`, fontSize: 12, align: 'left', x: 45, y: 520, width: 610, color: '#1A1A1A' }
    ]
  });

  // 3. Declaration Page
  pages.push({
    id: `p_decl_${Date.now()}`,
    type: 'declaration',
    title: 'Declaration',
    elements: [
      { id: 'decl_1', type: 'text', content: 'CANDIDATE DECLARATION', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: theme.primaryColor },
      { id: 'decl_2', type: 'text', content: `I, ${studentName}, student of ${className} (Roll Number: ${rollNumber}) at ${schoolName}, hereby declare that the investigatory project titled:\n\n"${chosenOutline.title}"\n\nis an authentic record of my own research and experimental work carried out under the academic guidance and supervision of ${guideTeacher}.\n\nI further declare that this report has not been previously submitted to any other school, university, board, or institution for the award of any degree, diploma, or certificate. All literature sources, mathematical formulations, and diagrams cited herein have been explicitly acknowledged.`, fontSize: 13, align: 'left', x: 45, y: 150, width: 610, color: '#222222' },
      { id: 'decl_3', type: 'text', content: `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nPlace: ${schoolName}`, fontSize: 12, align: 'left', x: 45, y: 440, width: 610, color: '#444444' },
      { id: 'decl_4', type: 'text', content: `___________________________\nCandidate Signature\n(${studentName})\nRoll No: ${rollNumber} | ${className}`, fontSize: 12, align: 'left', x: 45, y: 530, width: 610, color: '#1A1A1A' }
    ]
  });

  // 4. Index Page (Table of Contents)
  const indexLines = chosenOutline.chapters.map((ch, idx) => `${ch.chapterNumber}. ${ch.title} ................................................................ Page ${idx + 5}`).join('\n\n');
  pages.push({
    id: `p_index_${Date.now()}`,
    type: 'index',
    title: 'Index',
    elements: [
      { id: 'ind_1', type: 'text', content: 'TABLE OF CONTENTS', fontSize: 22, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: theme.primaryColor },
      { id: 'ind_2', type: 'text', content: indexLines, fontSize: 13, align: 'left', x: 45, y: 150, width: 610, color: '#222222' },
      { id: 'ind_3', type: 'text', content: `7. Bibliography & Academic References ........................................ Page ${chosenOutline.chapters.length + 5}`, fontSize: 13, align: 'left', x: 45, y: 480, width: 610, color: '#222222' }
    ]
  });

  // 5. Chapter Content Pages — using AI-generated unique content per chapter
  chosenOutline.chapters.forEach((ch, idx) => {
    const aiContent = chapterContents[idx];
    const subtopicList = (aiContent?.subtopics || ch.subtopics || []).map((s) => `• ${s}`).join('\n');
    const bodyParagraphs = aiContent?.bodyParagraphs || [];

    pages.push({
      id: `p_ch_${idx + 1}_${Date.now()}`,
      type: 'content',
      title: `Chapter ${ch.chapterNumber}: ${ch.title}`,
      elements: [
        {
          id: `ch_${idx}_title`,
          type: 'text',
          content: `${ch.chapterNumber}. ${ch.title}`,
          fontSize: 18,
          fontWeight: 'bold',
          align: 'left',
          x: 45,
          y: 60,
          width: 610,
          color: theme.primaryColor
        },
        {
          id: `ch_${idx}_sub`,
          type: 'text',
          content: `Key Focus Areas:\n${subtopicList}`,
          fontSize: 12,
          fontWeight: 'bold',
          align: 'left',
          x: 45,
          y: 105,
          width: 610,
          color: theme.accentColor
        },
        {
          id: `ch_${idx}_body1`,
          type: 'text',
          content: bodyParagraphs[0] || `Introduction to ${ch.title}:\nThis chapter provides a comprehensive overview of ${ch.title} in the context of ${chosenOutline.title || topic}. Understanding these foundational principles is essential for both theoretical knowledge and practical applications.`,
          fontSize: 13,
          align: 'left',
          x: 45,
          y: 200,
          width: 610,
          color: '#222222'
        },
        {
          id: `ch_${idx}_body2`,
          type: 'text',
          content: bodyParagraphs[1] || `Theoretical Framework & Key Concepts:\nThe study of ${ch.title} encompasses multiple dimensions of academic inquiry. By examining the core principles, methodologies, and empirical findings, students can develop a thorough grasp of the subject matter and its broader implications.`,
          fontSize: 13,
          align: 'left',
          x: 45,
          y: 400,
          width: 610,
          color: '#333333'
        },
        {
          id: `ch_${idx}_body3`,
          type: 'text',
          content: bodyParagraphs[2] || `Practical Applications & Conclusions:\nThe knowledge gained from studying ${ch.title} has direct applications in real-world scenarios. Through systematic analysis, we can validate the theoretical predictions and draw meaningful conclusions about the significance of these findings.`,
          fontSize: 13,
          align: 'left',
          x: 45,
          y: 620,
          width: 610,
          color: '#222222'
        }
      ]
    });
  });

  // 6. Bibliography Page
  pages.push({
    id: `p_bib_${Date.now()}`,
    type: 'bibliography',
    title: 'Bibliography',
    elements: [
      { id: 'bib_1', type: 'text', content: 'BIBLIOGRAPHY & ACADEMIC REFERENCES', fontSize: 20, fontWeight: 'bold', align: 'center', x: 45, y: 70, width: 610, color: theme.primaryColor },
      { id: 'bib_2', type: 'text', content: `1. NCERT ${subjectName} Textbook for ${className} (Part I & II) — National Council of Educational Research and Training.\n\n2. Fundamentals of ${subjectName} — Standard Reference Textbook (Latest Edition, Academic Publishers).\n\n3. Concepts and Principles of ${topic} — Peer-Reviewed Academic Journal Articles.\n\n4. Research Methodology & Scientific Investigation — Standard Academic Reference.\n\n5. IEEE Educational Publications & Peer-Reviewed Scientific Journals on ${subjectName}.\n\n6. National Science Digital Library (NSDL) & MIT OpenCourseWare Repositories.`, fontSize: 13, align: 'left', x: 45, y: 150, width: 610, color: '#333333' }
    ]
  });

  return {
    theme,
    placeholders: {
      school_name: schoolName,
      student_name: studentName,
      roll_number: rollNumber,
      academic_year: academicYear,
      guide_teacher: guideTeacher,
      subject: subjectName,
      class: className,
      topic_title: chosenOutline.title
    },
    outline: chosenOutline,
    pages
  };
};

// ─── AI DIAGRAM GENERATOR ───
const DIAGRAM_FALLBACKS = {
  flowchart: (prompt) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, serif">
  <rect width="600" height="400" fill="#FAFAF8" rx="8"/>
  <rect x="220" y="20" width="160" height="50" rx="8" fill="#1E5B3F" stroke="#1E5B3F"/>
  <text x="300" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">START</text>
  <line x1="300" y1="70" x2="300" y2="100" stroke="#1E5B3F" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="180" y="100" width="240" height="50" rx="8" fill="white" stroke="#1E5B3F" stroke-width="2"/>
  <text x="300" y="130" text-anchor="middle" fill="#1E5B3F" font-size="12">${prompt.substring(0, 30)}</text>
  <line x1="300" y1="150" x2="300" y2="180" stroke="#1E5B3F" stroke-width="2" marker-end="url(#arrow)"/>
  <polygon points="300,180 240,220 300,260 360,220" fill="white" stroke="#C1663E" stroke-width="2"/>
  <text x="300" y="225" text-anchor="middle" fill="#C1663E" font-size="11">Decision</text>
  <line x1="300" y1="260" x2="300" y2="310" stroke="#1E5B3F" stroke-width="2" marker-end="url(#arrow)"/>
  <rect x="220" y="310" width="160" height="50" rx="8" fill="#1E5B3F" stroke="#1E5B3F"/>
  <text x="300" y="340" text-anchor="middle" fill="white" font-size="14" font-weight="bold">END</text>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1E5B3F"/></marker></defs>
</svg>`,
  mindmap: (prompt) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, serif">
  <rect width="600" height="400" fill="#FAFAF8" rx="8"/>
  <circle cx="300" cy="200" r="60" fill="#1E5B3F"/>
  <text x="300" y="205" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MAIN</text>
  <text x="300" y="220" text-anchor="middle" fill="white" font-size="11">TOPIC</text>
  <line x1="240" y1="200" x2="100" y2="120" stroke="#C1663E" stroke-width="2"/>
  <circle cx="80" cy="110" r="40" fill="#C1663E"/>
  <text x="80" y="115" text-anchor="middle" fill="white" font-size="11">Branch 1</text>
  <line x1="240" y1="200" x2="100" y2="280" stroke="#2B4C7E" stroke-width="2"/>
  <circle cx="80" cy="290" r="40" fill="#2B4C7E"/>
  <text x="80" y="295" text-anchor="middle" fill="white" font-size="11">Branch 2</text>
  <line x1="360" y1="200" x2="500" y2="120" stroke="#8B6508" stroke-width="2"/>
  <circle cx="520" cy="110" r="40" fill="#8B6508"/>
  <text x="520" y="115" text-anchor="middle" fill="white" font-size="11">Branch 3</text>
  <line x1="360" y1="200" x2="500" y2="280" stroke="#1E5B3F" stroke-width="2"/>
  <circle cx="520" cy="290" r="40" fill="#1E5B3F"/>
  <text x="520" y="295" text-anchor="middle" fill="white" font-size="11">Branch 4</text>
</svg>`,
  timeline: (prompt) => `<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, serif">
  <rect width="600" height="200" fill="#FAFAF8" rx="8"/>
  <line x1="40" y1="100" x2="560" y2="100" stroke="#1E5B3F" stroke-width="3"/>
  <circle cx="100" cy="100" r="10" fill="#1E5B3F"/><text x="100" y="80" text-anchor="middle" fill="#1E5B3F" font-size="11" font-weight="bold">2020</text><text x="100" y="125" text-anchor="middle" fill="#333" font-size="10">Event 1</text>
  <circle cx="220" cy="100" r="10" fill="#C1663E"/><text x="220" y="80" text-anchor="middle" fill="#C1663E" font-size="11" font-weight="bold">2021</text><text x="220" y="125" text-anchor="middle" fill="#333" font-size="10">Event 2</text>
  <circle cx="340" cy="100" r="10" fill="#2B4C7E"/><text x="340" y="80" text-anchor="middle" fill="#2B4C7E" font-size="11" font-weight="bold">2022</text><text x="340" y="125" text-anchor="middle" fill="#333" font-size="10">Event 3</text>
  <circle cx="460" cy="100" r="10" fill="#8B6508"/><text x="460" y="80" text-anchor="middle" fill="#8B6508" font-size="11" font-weight="bold">2023</text><text x="460" y="125" text-anchor="middle" fill="#333" font-size="10">Event 4</text>
</svg>`
};

export const generateDiagramService = async ({ prompt, diagramType = 'flowchart', topic = '' }) => {
  const diagramInstructions = {
    flowchart: 'a process flowchart with boxes, arrows, and decision diamonds. Use rectangles for process steps, diamonds for decisions, and directional arrows to show flow.',
    mindmap: 'a mind map with a central topic circle and branches radiating outward. Each branch should have sub-branches for key concepts.',
    scientific: 'a labeled scientific diagram with clear annotations, measurement labels, and component descriptions.',
    timeline: 'a horizontal timeline with events marked as circles on a line, with dates above and descriptions below.',
    process: 'a step-by-step process diagram with numbered steps, icons/shapes for each step, and connecting arrows.',
    comparison: 'a comparison table or Venn diagram comparing two or more concepts with clear labels and visual differentiation.',
    graph: 'a bar graph or line graph with labeled axes, data points, and a title. Include grid lines for readability.',
    conceptmap: 'a concept map showing relationships between ideas with labeled connecting lines/arrows indicating the type of relationship.',
    infographic: 'an informative infographic with icons, statistics, key facts, and visual hierarchy using colors and typography.',
  };

  const svgPrompt = `You are an expert SVG diagram creator for academic documents.
Create a clean, professional, and visually informative SVG diagram for the following request:

Topic/Description: "${prompt}"
${topic ? `Context: This is for a document about "${topic}"` : ''}
Diagram Type: ${diagramType} — Generate ${diagramInstructions[diagramType] || 'a clear informative diagram'}.

CRITICAL SVG REQUIREMENTS:
1. Output ONLY valid SVG code. No markdown, no explanation, no code blocks.
2. Start with <svg and end with </svg>
3. Use viewBox="0 0 700 500" for the SVG dimensions
4. Use font-family="Georgia, serif" for text
5. Use these colors: primary=#1E5B3F, accent=#C1663E, blue=#2B4C7E, gold=#8B6508, light background=#FAFAF8, dark text=#1A1A1A
6. Include a white/light background rectangle as first element
7. Add a title text element at the top showing what the diagram represents
8. All text must be readable (font-size between 10 and 16)
9. Make it informative and specifically about the requested topic
10. Include proper labels, annotations, and legend if needed
11. Use stroke and fill attributes properly, NO CSS styles
12. Ensure the diagram content is specifically about "${prompt}" - do NOT use placeholder text`;

  if (ai) {
    try {
      const responseText = await generateContentWithFallback(svgPrompt, { responseMimeType: 'text/plain' });
      if (responseText) {
        // Extract SVG from the response
        let svgCode = responseText.trim();

        // Remove any markdown code blocks if present
        svgCode = svgCode.replace(/```(?:svg|xml|html)?\n?/gi, '').replace(/```/g, '').trim();

        // Ensure it starts with <svg
        const svgStart = svgCode.indexOf('<svg');
        const svgEnd = svgCode.lastIndexOf('</svg>');
        if (svgStart !== -1 && svgEnd !== -1) {
          svgCode = svgCode.substring(svgStart, svgEnd + 6);
        }

        if (svgCode.startsWith('<svg')) {
          // Convert SVG to base64 data URL
          const base64 = Buffer.from(svgCode, 'utf-8').toString('base64');
          return {
            svgCode,
            dataUrl: `data:image/svg+xml;base64,${base64}`,
            diagramType,
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini AI] Diagram generation failed:', err.message);
    }
  }

  // Fallback: use simple prebuilt SVG based on diagram type
  const fallbackFn = DIAGRAM_FALLBACKS[diagramType] || DIAGRAM_FALLBACKS.flowchart;
  const fallbackSvg = fallbackFn(prompt);
  const base64 = Buffer.from(fallbackSvg, 'utf-8').toString('base64');
  return {
    svgCode: fallbackSvg,
    dataUrl: `data:image/svg+xml;base64,${base64}`,
    diagramType,
  };
};
