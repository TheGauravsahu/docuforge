import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api.js';

export const useEditorStore = create(
  persist(
    (set, get) => ({
      document: null,
      activePageIndex: 0,
      selectedElementId: null,
      history: [],
      historyIndex: -1,
      isDirty: false,
      zoomLevel: 100,

      setDocument: (doc) => {
        set({
          document: doc,
          activePageIndex: 0,
          selectedElementId: null,
          history: [JSON.parse(JSON.stringify(doc.contentJson))],
          historyIndex: 0,
          isDirty: false
        });
      },

      updateDocumentTitle: (newTitle) => {
        const doc = get().document;
        if (!doc) return;
        set({
          document: { ...doc, title: newTitle },
          isDirty: true,
        });
      },

      markSaved: () => set({ isDirty: false }),

      setActivePage: (index) => {
        set({ activePageIndex: index, selectedElementId: null });
      },

      setSelectedElement: (elementId) => {
        set({ selectedElementId: elementId });
      },

      updateElement: (pageIndex, elementId, newProperties) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || !doc.contentJson.pages[pageIndex]) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const page = newContentJson.pages[pageIndex];
        const element = page.elements.find((e) => e.id === elementId);

        if (element) {
          Object.assign(element, newProperties);

          set({
            document: { ...doc, contentJson: newContentJson },
            isDirty: true
          });
        }
      },

      addElement: (pageIndex, newElement) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || !doc.contentJson.pages[pageIndex]) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        newContentJson.pages[pageIndex].elements.push(newElement);

        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newContentJson)));

        set({
          document: { ...doc, contentJson: newContentJson },
          selectedElementId: newElement.id,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true
        });
      },

      deleteElement: (pageIndex, elementId) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || !doc.contentJson.pages[pageIndex]) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        newContentJson.pages[pageIndex].elements = newContentJson.pages[pageIndex].elements.filter(
          (e) => e.id !== elementId
        );

        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newContentJson)));

        set({
          document: { ...doc, contentJson: newContentJson },
          selectedElementId: null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true
        });
      },

      updateTheme: (newTheme) => {
        const doc = get().document;
        if (!doc || !doc.contentJson) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const oldTheme = newContentJson.theme || {};
        newContentJson.theme = { ...oldTheme, ...newTheme };

        const targetPrimary = newTheme.primaryColor;
        const targetAccent = newTheme.accentColor;
        const targetFont = newTheme.fontFamily;

        newContentJson.pages.forEach((page) => {
          page.elements.forEach((el) => {
            if (targetFont) {
              el.fontFamily = targetFont;
            }
            if (targetPrimary) {
              // Update headers and primary elements
              if (
                el.id === 'c_1' || el.id === 'c_4' || el.id === 'cert_1' ||
                el.id === 'decl_1' || el.id === 'ind_1' || el.id === 'bib_1' ||
                (el.id && el.id.includes('ch_') && el.id.includes('_title')) ||
                el.color === oldTheme.primaryColor ||
                el.color === '#1E5B3F' || el.color === '#2B4C7E' || el.color === '#8B6508'
              ) {
                el.color = targetPrimary;
              }
            }
            if (targetAccent) {
              if (
                el.id === 'c_2' || el.id === 'cert_sub' ||
                (el.id && el.id.includes('ch_') && el.id.includes('_sub')) ||
                el.color === oldTheme.accentColor ||
                el.color === '#C1663E' || el.color === '#D4AF37'
              ) {
                el.color = targetAccent;
              }
            }
          });
        });

        set({
          document: { ...doc, contentJson: newContentJson },
          isDirty: true
        });
      },

      updatePlaceholders: (newPlaceholders) => {
        const doc = get().document;
        if (!doc || !doc.contentJson) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const oldP = newContentJson.placeholders || {};
        const p = { ...oldP, ...newPlaceholders };
        newContentJson.placeholders = p;

        const studentName = p.student_name || 'Student Name';
        const schoolName = p.school_name || 'School Name';
        const rollNumber = p.roll_number || 'Roll No';
        const guideTeacher = p.guide_teacher || 'Teacher-in-Charge';
        const academicYear = p.academic_year || '2026 - 2027';
        const className = p.class || 'Class XII';
        const subjectName = p.subject || 'Science';
        const topicTitle = p.topic_title || doc.title || 'Project';

        newContentJson.pages.forEach((page) => {
          page.elements.forEach((el) => {
            if (el.content && typeof el.content === 'string') {
              if (oldP.school_name && el.content.includes(oldP.school_name)) {
                el.content = el.content.split(oldP.school_name).join(schoolName);
              }
              if (oldP.student_name && el.content.includes(oldP.student_name)) {
                el.content = el.content.split(oldP.student_name).join(studentName);
              }
              if (oldP.roll_number && el.content.includes(oldP.roll_number)) {
                el.content = el.content.split(oldP.roll_number).join(rollNumber);
              }
              if (oldP.guide_teacher && el.content.includes(oldP.guide_teacher)) {
                el.content = el.content.split(oldP.guide_teacher).join(guideTeacher);
              }
            }

            if (page.type === 'cover') {
              if (el.id === 'c_1') el.content = schoolName.toUpperCase();
              if (el.id === 'c_2') el.content = `DEPARTMENT OF ${subjectName.toUpperCase()} — ${className.toUpperCase()}`;
              if (el.id === 'c_6') el.content = `Submitted By:\n${studentName}\nRoll Number: ${rollNumber}\nClass & Section: ${className}\n\nUnder the Guidance of:\n${guideTeacher}\nDepartment of ${subjectName}\n${schoolName}\n\nAcademic Session: ${academicYear}`;
            }
            if (page.type === 'certificate') {
              if (el.id === 'cert_sub') el.content = `DEPARTMENT OF ${subjectName.toUpperCase()} — ${schoolName.toUpperCase()}`;
              if (el.id === 'cert_2') el.content = `This is to certify that ${studentName}, a bonafide student of ${className} (Roll No: ${rollNumber}) at ${schoolName}, has successfully completed the investigatory project entitled:\n\n"${topicTitle}"\n\nduring the academic session ${academicYear} in partial fulfillment of the requirements for the ${subjectName} curriculum as prescribed by the Board of Examination.`;
              if (el.id === 'cert_3') el.content = `The student has exhibited deep scientific curiosity, analytical rigor, and diligence throughout the experimental work and report preparation under my direct supervision. The results documented herein represent authentic experimental data and theoretical derivations.`;
              if (el.id === 'cert_4') el.content = `___________________________              ___________________________\nTeacher-in-Charge                          Principal / Head of Institution\n(${guideTeacher})                          (${schoolName})\n\n\n___________________________              ___________________________\nInternal Examiner Signature                External Examiner Signature`;
            }
            if (page.type === 'declaration') {
              if (el.id === 'decl_2') el.content = `I, ${studentName}, student of ${className} (Roll Number: ${rollNumber}) at ${schoolName}, hereby declare that the investigatory project titled:\n\n"${topicTitle}"\n\nis an authentic record of my own research and experimental work carried out under the academic guidance and supervision of ${guideTeacher}.\n\nI further declare that this report has not been previously submitted to any other school, university, board, or institution for the award of any degree, diploma, or certificate. All literature sources, mathematical formulations, and diagrams cited herein have been duly acknowledged.`;
              if (el.id === 'decl_3') el.content = `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nPlace: ${schoolName}`;
              if (el.id === 'decl_4') el.content = `___________________________\nCandidate Signature\n(${studentName})\nRoll No: ${rollNumber} | ${className}`;
            }
          });
        });

        set({
          document: { ...doc, contentJson: newContentJson },
          isDirty: true
        });
      },

      addPage: (pageType = 'content', title = 'New Section Page') => {
        const doc = get().document;
        if (!doc || !doc.contentJson) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const newPageId = `page_${Date.now()}`;

        newContentJson.pages.push({
          id: newPageId,
          type: pageType,
          title,
          elements: [
            {
              id: `el_${Date.now()}_1`,
              type: 'text',
              content: title,
              fontSize: 20,
              fontWeight: 'bold',
              align: 'left',
              x: 45,
              y: 60,
              width: 610,
              color: newContentJson.theme?.primaryColor || '#1E5B3F'
            },
            {
              id: `el_${Date.now()}_2`,
              type: 'text',
              content: 'Add your custom page content here using the visual editor toolbar...',
              fontSize: 13,
              align: 'left',
              x: 45,
              y: 120,
              width: 610,
              color: '#333333'
            }
          ]
        });

        set({
          document: { ...doc, contentJson: newContentJson },
          activePageIndex: newContentJson.pages.length - 1,
          isDirty: true
        });

        // Immediately sync database so exports use updated pages without delay
        api.put(`/documents/${doc.id}`, { contentJson: newContentJson }).catch(() => {});
      },

      deletePage: (pageIndex) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || doc.contentJson.pages.length <= 1) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        newContentJson.pages.splice(pageIndex, 1);

        const nextActiveIndex = Math.max(0, pageIndex - 1);

        set({
          document: { ...doc, contentJson: newContentJson },
          activePageIndex: nextActiveIndex,
          isDirty: true
        });

        // Immediately sync database so exports use updated pages without delay
        api.put(`/documents/${doc.id}`, { contentJson: newContentJson }).catch(() => {});
      },

      reorderPages: (startIndex, endIndex) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || startIndex === endIndex) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const [removed] = newContentJson.pages.splice(startIndex, 1);
        newContentJson.pages.splice(endIndex, 0, removed);

        set({
          document: { ...doc, contentJson: newContentJson },
          activePageIndex: endIndex,
          isDirty: true
        });
      },

      updatePageTitle: (pageIndex, newTitle) => {
        const doc = get().document;
        if (!doc || !doc.contentJson || !doc.contentJson.pages[pageIndex]) return;

        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const page = newContentJson.pages[pageIndex];
        const oldTitle = page.title;
        page.title = newTitle;

        // Also update main heading element on canvas if present
        page.elements.forEach((el) => {
          if (el.type === 'text' && (el.id?.endsWith('_title') || el.content === oldTitle)) {
            el.content = newTitle;
          }
        });

        // Auto-update Table of Contents (Index page) if present
        const contentChapters = newContentJson.pages.filter((p) => p.type === 'content');
        const indexPage = newContentJson.pages.find((p) => p.type === 'index');
        if (indexPage) {
          const indexLines = contentChapters
            .map((ch, idx) => `${idx + 1}. ${ch.title} ................................................................ Page ${idx + 5}`)
            .join('\n\n');
          const ind2 = indexPage.elements.find((e) => e.id === 'ind_2');
          if (ind2) ind2.content = indexLines;
        }

        set({
          document: { ...doc, contentJson: newContentJson },
          isDirty: true
        });
      },

      undo: () => {
        const { historyIndex, history, document } = get();
        if (historyIndex > 0) {
          const prevContent = history[historyIndex - 1];
          set({
            document: { ...document, contentJson: JSON.parse(JSON.stringify(prevContent)) },
            historyIndex: historyIndex - 1,
            isDirty: true
          });
        }
      },

      redo: () => {
        const { historyIndex, history, document } = get();
        if (historyIndex < history.length - 1) {
          const nextContent = history[historyIndex + 1];
          set({
            document: { ...document, contentJson: JSON.parse(JSON.stringify(nextContent)) },
            historyIndex: historyIndex + 1,
            isDirty: true
          });
        }
      },

      setZoom: (zoom) => set({ zoomLevel: zoom })
    }),
    {
      name: 'docuforge_editor_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        document: state.document,
        activePageIndex: state.activePageIndex,
        zoomLevel: state.zoomLevel,
      }),
    }
  )
);
