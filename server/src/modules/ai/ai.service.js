import { ai, GEMINI_MODELS } from '../../config/gemini.js';

export const generateSectionService = async ({ title, topic = '' }) => {
  const prompt = `You are an expert academic author.
Generate detailed academic page content for a new section / chapter titled: "${title}" ${topic ? `for the project topic: "${topic}"` : ''}.

Respond ONLY with valid JSON in the following format:
{
  "title": "${title}",
  "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
  "bodyParagraphs": [
    "Paragraph 1 introducing the section concepts...",
    "Paragraph 2 with theoretical equations, physical significance and formulas...",
    "Paragraph 3 with procedure steps, experimental observations and key conclusions..."
  ]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.FLASH,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('[Gemini AI] Section writer fallback triggered:', err.message);
    }
  }

  return {
    title,
    subtopics: ['Core Principles & Theory', 'Mathematical Formulation', 'Applications & Results'],
    bodyParagraphs: [
      `This section provides a detailed scientific analysis of ${title}. Understanding these foundational principles is essential for theoretical validation and engineering design.`,
      `Mathematical Formulation & Physics Principles:\nPhysical interactions in this system follow fundamental governing equations. When variables change dynamically over time dt, proportional potentials are generated across system boundaries in strict compliance with conservation laws.`,
      `Experimental Procedure & Key Observations:\n1. Calibrate laboratory instruments and set baseline parameters.\n2. Record measurements systematically across multiple experimental trials.\n3. Verify that percentage errors remain within acceptable theoretical thresholds.`
    ]
  };
};

export const generateOutlineService = async ({ topic, docType = 'PDF', referenceText = '' }) => {
  const prompt = `You are an expert academic document author.
Given the topic: "${topic}" ${referenceText ? `and reference text: "${referenceText.substring(0, 500)}"` : ''}.
Generate a structured JSON outline for a high-quality academic project / presentation / report (${docType}).

Respond ONLY with valid JSON in the following format:
{
  "title": "Full Academic Project Title",
  "subtitle": "Detailed Subtitle or Research Scope",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Introduction & Historical Context",
      "subtopics": ["Background & Principles", "Historical Development", "Real-world Significance"]
    },
    {
      "chapterNumber": 2,
      "title": "Theoretical Framework & Governing Laws",
      "subtopics": ["Core Physics Laws", "Mathematical Derivations", "Working Principle & Field Equations"]
    },
    {
      "chapterNumber": 3,
      "title": "Experimental Setup & Apparatus Specifications",
      "subtopics": ["Required Equipment & Specifications", "Schematic Circuit / Model Description", "Step-by-Step Experimental Procedure"]
    },
    {
      "chapterNumber": 4,
      "title": "Quantitative Observations & Data Analysis",
      "subtopics": ["Tabulated Experimental Measurements", "Mathematical Calculations & Error Analysis", "Graphical Trends & Interpretation"]
    },
    {
      "chapterNumber": 5,
      "title": "Industrial Applications & Engineering Significance",
      "subtopics": ["Modern Technological Applications", "Power Transmission & Efficiency", "Safety & Environmental Considerations"]
    },
    {
      "chapterNumber": 6,
      "title": "Conclusion & Future Enhancements",
      "subtopics": ["Summary of Experimental Findings", "Sources of Experimental Error", "Future Scope & Innovations"]
    }
  ]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.FLASH,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const responseText = response.text || '';
      return JSON.parse(responseText);
    } catch (err) {
      console.warn('[Gemini AI] Outline fallback triggered:', err.message);
    }
  }

  // Robust structured fallback if AI API key is not present or rate limited
  return {
    title: topic ? topic.toUpperCase() : 'STUDY OF ELECTROMAGNETIC INDUCTION AND ITS APPLICATIONS',
    subtitle: `A Comprehensive Theoretical, Experimental & Mathematical Analysis of ${topic || 'Electromagnetism'}`,
    chapters: [
      {
        chapterNumber: 1,
        title: `Introduction to ${topic || 'Electromagnetism'}`,
        subtopics: ['Background & Fundamental Principles', 'Historical Context & Faraday\'s Discoveries', 'Significance in Modern Physics & Technology']
      },
      {
        chapterNumber: 2,
        title: 'Theoretical Framework & Governing Laws',
        subtopics: ['Faraday\'s Laws of Induction', 'Lenz\'s Law & Energy Conservation', 'Mathematical Equations & Flux Derivatives']
      },
      {
        chapterNumber: 3,
        title: 'Experimental Setup & Methodology',
        subtopics: ['Required Apparatus & Circuit Specifications', 'Schematic Diagram & Setup Instructions', 'Step-by-Step Experimental Procedure']
      },
      {
        chapterNumber: 4,
        title: 'Observations & Quantitative Data Analysis',
        subtopics: ['Tabulated Measurements & Readings', 'Calculations, Graphs & Error Analysis', 'Practical Applications in Power Generation']
      },
      {
        chapterNumber: 5,
        title: 'Industrial Applications & Modern Devices',
        subtopics: ['Transformers & Power Distribution', 'Induction Motors & Generators', 'Eddy Currents & Electromagnetic Braking']
      },
      {
        chapterNumber: 6,
        title: 'Conclusion & References',
        subtopics: ['Summary of Results & Key Verification', 'Precautions & Sources of Error', 'Academic Bibliography']
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

  // 5. Chapter Content Pages
  chosenOutline.chapters.forEach((ch, idx) => {
    const subtopicList = ch.subtopics.map((s) => `• ${s}`).join('\n');
    pages.push({
      id: `p_ch_${idx + 1}_${Date.now()}`,
      type: 'content',
      title: `Chapter ${ch.chapterNumber}: ${ch.title}`,
      elements: [
        { id: `ch_${idx}_title`, type: 'text', content: `${ch.chapterNumber}. ${ch.title}`, fontSize: 18, fontWeight: 'bold', align: 'left', x: 45, y: 60, width: 610, color: theme.primaryColor },
        { id: `ch_${idx}_sub`, type: 'text', content: `Key Focus Areas:\n${subtopicList}`, fontSize: 12, fontWeight: 'bold', align: 'left', x: 45, y: 105, width: 610, color: theme.accentColor },
        { id: `ch_${idx}_body1`, type: 'text', content: `1. Introduction & Theoretical Foundations:\nIn the realm of modern ${subjectName.toLowerCase()}, understanding ${ch.title.toLowerCase()} is fundamental for both theoretical physics and practical engineering applications. This investigation focuses on analyzing physical field interactions, flux variations, and conservation principles governing dynamic system behavior.`, fontSize: 13, align: 'left', x: 45, y: 200, width: 610, color: '#222222' },
        { id: `ch_${idx}_body2`, type: 'text', content: `2. Mathematical Formulation & Governing Physics Laws:\nPhysical phenomena in this domain follow strict conservation laws. When magnetic flux (Φ = B · A · cos θ) varies dynamically across a closed conductive loop over time dt, an electromotive force (e.m.f.) is induced according to Faraday's law of induction:\n\n                        ε = - N (dΦ / dt)\n\nThe negative sign signifies Lenz's law, which states that the direction of the induced current always opposes the change in magnetic flux that produces it, satisfying the law of conservation of energy.`, fontSize: 13, align: 'left', x: 45, y: 340, width: 610, color: '#333333' },
        { id: `ch_${idx}_body3`, type: 'text', content: `3. Experimental Setup & Observation Methodology:\nTo verify these theoretical derivations experimentally, the apparatus was assembled as per standard laboratory protocol. Independent variables were systematically varied while recording output responses using calibrated digital meters.\n\nKey Experimental Observations:\n• Increase in relative velocity or magnetic field strength produced a proportional increase in induced current.\n• Primary-to-secondary coil turns ratio determined the step-up / step-down transformation efficiency.\n• Calculated percentage error remained under 4.2%, well within acceptable experimental limits.`, fontSize: 13, align: 'left', x: 45, y: 560, width: 610, color: '#222222' }
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
      { id: 'bib_2', type: 'text', content: `1. NCERT ${subjectName} Textbook for ${className} (Part I & II) — National Council of Educational Research and Training.\n\n2. Fundamentals of Physics — David Halliday, Robert Resnick, and Jearl Walker (10th Edition, John Wiley & Sons).\n\n3. Concepts of Physics — Dr. H. C. Verma (Volume I & II, Bharati Bhawan Publishers).\n\n4. The Feynman Lectures on Physics — Richard P. Feynman (Volume II: Electromagnetism and Matter).\n\n5. IEEE Educational Publications & Peer-Reviewed Scientific Journals on Applied Electromagnetics.\n\n6. National Science Digital Library (NSDL) & MIT OpenCourseWare Repositories.`, fontSize: 13, align: 'left', x: 45, y: 150, width: 610, color: '#333333' }
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
