import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  FileText, Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Bookmark,
  Award, Layers, Wand2, ShieldCheck, PenTool, Layout
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import api from '../lib/api.js';

export default function CreateManualPage() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('Investigatory Project Report');
  const [subject, setSubject] = useState('Physics');
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [guideTeacher, setGuideTeacher] = useState('');
  const [academicYear, setAcademicYear] = useState('2026 - 2027');
  const [className, setClassName] = useState('Class XII');

  // Included Pages
  const [includeCover, setIncludeCover] = useState(true);
  const [includeCertificate, setIncludeCertificate] = useState(true);
  const [includeDeclaration, setIncludeDeclaration] = useState(true);
  const [includeIndex, setIncludeIndex] = useState(true);
  const [contentPageCount, setContentPageCount] = useState(3);
  const [includeBibliography, setIncludeBibliography] = useState(true);

  // Theme Settings
  const [borderStyle, setBorderStyle] = useState('double');
  const [primaryColor, setPrimaryColor] = useState('#1E5B3F');
  const [borderColor, setBorderColor] = useState('#1E5B3F');
  const [fontFamily, setFontFamily] = useState('Georgia');

  const createDocumentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/documents', payload);
      return res.data.document;
    },
    onSuccess: (doc) => {
      toast.success('Document created successfully! Opening canvas editor...');
      navigate(`/editor/${doc.id}`);
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to create document. Please try again.');
    }
  });

  const handleCreateDocument = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a document title');

    const sName = studentName.trim() || 'Student Name';
    const rNum = rollNumber.trim() || 'Roll Number';
    const schName = schoolName.trim() || 'School Name';
    const gTeacher = guideTeacher.trim() || 'Teacher-in-Charge';
    const topicTitle = title.trim();

    const pages = [];

    // 1. Cover Page
    if (includeCover) {
      pages.push({
        id: `page_${Date.now()}_cover`,
        type: 'cover',
        title: 'Cover Page',
        elements: [
          {
            id: 'c_1',
            type: 'text',
            content: schName.toUpperCase(),
            fontSize: 22,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 90,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'c_2',
            type: 'text',
            content: `DEPARTMENT OF ${subject.toUpperCase()} — ${className.toUpperCase()}`,
            fontSize: 12,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 135,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'c_3',
            type: 'text',
            content: 'INVESTIGATORY PROJECT REPORT',
            fontSize: 18,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 230,
            width: 610,
            color: '#1A1A1A',
            fontFamily,
          },
          {
            id: 'c_4',
            type: 'text',
            content: topicTitle.toUpperCase(),
            fontSize: 20,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 280,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'c_5',
            type: 'text',
            content: `Submitted By:\n${sName}\nRoll Number: ${rNum}\nClass & Section: ${className}\n\nUnder the Guidance of:\n${gTeacher}\nDepartment of ${subject}\n${schName}\n\nAcademic Session: ${academicYear}`,
            fontSize: 12,
            align: 'center',
            x: 45,
            y: 450,
            width: 610,
            color: '#333333',
            fontFamily,
          },
        ]
      });
    }

    // 2. Certificate Page
    if (includeCertificate) {
      pages.push({
        id: `page_${Date.now()}_cert`,
        type: 'certificate',
        title: 'Bonafide Certificate',
        elements: [
          {
            id: 'cert_1',
            type: 'text',
            content: 'BONAFIDE CERTIFICATE',
            fontSize: 22,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 70,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'cert_sub',
            type: 'text',
            content: `DEPARTMENT OF ${subject.toUpperCase()} — ${schName.toUpperCase()}`,
            fontSize: 12,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 110,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'cert_2',
            type: 'text',
            content: `This is to certify that ${sName}, a bonafide student of ${className} holding Roll Number ${rNum} at ${schName}, has successfully completed the investigatory project entitled:\n\n"${topicTitle}"\n\nduring the academic session ${academicYear} in partial fulfillment of the requirements for the ${subject} curriculum as prescribed by the Board of Examination.`,
            fontSize: 13,
            align: 'left',
            x: 45,
            y: 170,
            width: 610,
            color: '#222222',
            fontFamily,
          },
          {
            id: 'cert_3',
            type: 'text',
            content: `The student has exhibited deep scientific curiosity, analytical rigor, and diligence throughout the experimental work and report preparation under my direct supervision. The results documented herein represent authentic experimental data and theoretical derivations.`,
            fontSize: 13,
            align: 'left',
            x: 45,
            y: 340,
            width: 610,
            color: '#333333',
            fontFamily,
          },
          {
            id: 'cert_4',
            type: 'text',
            content: `___________________________              ___________________________\nTeacher-in-Charge                          Principal / Head of Institution\n(${gTeacher})                          (${schName})\n\n\n___________________________              ___________________________\nInternal Examiner Signature                External Examiner Signature`,
            fontSize: 12,
            align: 'left',
            x: 45,
            y: 520,
            width: 610,
            color: '#1A1A1A',
            fontFamily,
          }
        ]
      });
    }

    // 3. Declaration Page
    if (includeDeclaration) {
      pages.push({
        id: `page_${Date.now()}_decl`,
        type: 'declaration',
        title: 'Candidate Declaration',
        elements: [
          {
            id: 'decl_1',
            type: 'text',
            content: 'CANDIDATE DECLARATION',
            fontSize: 20,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 70,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'decl_2',
            type: 'text',
            content: `I, ${sName}, student of ${className} (Roll Number: ${rNum}) at ${schName}, hereby declare that the investigatory project titled:\n\n"${topicTitle}"\n\nis an authentic record of my own research and experimental work carried out under the academic guidance and supervision of ${gTeacher}.\n\nI further declare that this report has not been previously submitted to any other school, university, board, or institution for the award of any degree, diploma, or certificate. All literature sources, mathematical formulations, and diagrams cited herein have been explicitly acknowledged.`,
            fontSize: 13,
            align: 'left',
            x: 45,
            y: 150,
            width: 610,
            color: '#222222',
            fontFamily,
          },
          {
            id: 'decl_3',
            type: 'text',
            content: `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nPlace: ${schName}`,
            fontSize: 12,
            align: 'left',
            x: 45,
            y: 440,
            width: 610,
            color: '#444444',
            fontFamily,
          },
          {
            id: 'decl_4',
            type: 'text',
            content: `___________________________\nCandidate Signature\n(${sName})\nRoll No: ${rNum} | ${className}`,
            fontSize: 12,
            align: 'left',
            x: 45,
            y: 530,
            width: 610,
            color: '#1A1A1A',
            fontFamily,
          }
        ]
      });
    }

    // 4. Index Page
    if (includeIndex) {
      pages.push({
        id: `page_${Date.now()}_index`,
        type: 'index',
        title: 'Table of Contents',
        elements: [
          {
            id: 'ind_1',
            type: 'text',
            content: 'TABLE OF CONTENTS',
            fontSize: 20,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 80,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'ind_2',
            type: 'text',
            content: `1. Introduction & Background .............................................. Page 5\n2. Theoretical Framework & Laws ........................................ Page 6\n3. Experimental Setup & Apparatus ...................................... Page 7\n4. Observations & Data Derivations .................................... Page 8\n5. Results, Graph & Discussion ......................................... Page 9\n6. Bibliography & References .............................................. Page 10`,
            fontSize: 13,
            align: 'left',
            x: 60,
            y: 160,
            width: 580,
            color: '#333333',
            fontFamily,
          }
        ]
      });
    }

    // 5. Content Pages
    for (let i = 1; i <= contentPageCount; i++) {
      pages.push({
        id: `page_${Date.now()}_ch_${i}`,
        type: 'content',
        title: `Chapter ${i}: Section ${i}`,
        elements: [
          {
            id: `ch_${i}_title`,
            type: 'text',
            content: `CHAPTER ${i}: SECTION TITLE`,
            fontSize: 18,
            fontWeight: 'bold',
            align: 'left',
            x: 45,
            y: 60,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: `ch_${i}_body`,
            type: 'text',
            content: `Enter your detailed research findings, experimental observations, formulas, and diagrams for Section ${i} here...\n\nClick to edit text directly on canvas or use the AI Section Writer tool in the sidebar to generate custom content.`,
            fontSize: 13,
            align: 'left',
            x: 45,
            y: 120,
            width: 610,
            color: '#333333',
            fontFamily,
          }
        ]
      });
    }

    // 6. Bibliography Page
    if (includeBibliography) {
      pages.push({
        id: `page_${Date.now()}_bib`,
        type: 'bibliography',
        title: 'Bibliography',
        elements: [
          {
            id: 'bib_1',
            type: 'text',
            content: 'BIBLIOGRAPHY & REFERENCES',
            fontSize: 20,
            fontWeight: 'bold',
            align: 'center',
            x: 45,
            y: 80,
            width: 610,
            color: primaryColor,
            fontFamily,
          },
          {
            id: 'bib_2',
            type: 'text',
            content: `1. NCERT Textbook for ${subject} (${className}), National Council of Educational Research and Training.\n2. Fundamentals of ${subject}, Standard Academic Reference Edition.\n3. Encyclopaedia Britannica — Science & Technology Digital Database.\n4. Experimental Physics Manual & Laboratory Guidelines.`,
            fontSize: 13,
            align: 'left',
            x: 60,
            y: 160,
            width: 580,
            color: '#333333',
            fontFamily,
          }
        ]
      });
    }

    const payload = {
      title: topicTitle,
      type: 'PROJECT',
      contentJson: {
        theme: {
          primaryColor,
          accentColor: '#C1663E',
          backgroundColor: '#FAFAF8',
          borderColor,
          borderStyle,
          fontFamily,
        },
        pages,
        placeholders: {
          student_name: sName,
          school_name: schName,
          roll_number: rNum,
          guide_teacher: gTeacher,
          academic_year: academicYear,
          class: className,
          subject,
          topic_title: topicTitle,
        }
      }
    };

    createDocumentMutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 select-none">
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[13px] font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header Title */}
        <div className="flex items-start justify-between flex-wrap gap-4 border-b pb-5" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
              <PenTool className="w-4 h-4" /> Manual Scratch Studio
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Create Document from Scratch
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Build custom academic project reports, certificates, and slide decks manually without using AI quota.
            </p>
          </div>

          <Link
            to="/generate"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors border"
            style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Switch to AI Generator
          </Link>
        </div>

        <form onSubmit={handleCreateDocument} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div
            className="p-6 rounded-2xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-4 h-4 text-emerald-500" /> 1. Project & Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetic Induction Report"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Subject / Discipline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Chemistry, Computer Science"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Student Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gaurav Sahu"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1210459"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  School / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Public School"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Guide Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. P. Sharma"
                  value={guideTeacher}
                  onChange={e => setGuideTeacher(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Page Structure */}
          <div
            className="p-6 rounded-2xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-4 h-4 text-emerald-500" /> 2. Page Structure & Sequence
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: '📌 Cover Page', state: includeCover, setState: setIncludeCover },
                { label: '📜 Certificate', state: includeCertificate, setState: setIncludeCertificate },
                { label: '✍️ Declaration', state: includeDeclaration, setState: setIncludeDeclaration },
                { label: '📖 Table of Contents', state: includeIndex, setState: setIncludeIndex },
                { label: '📚 Bibliography', state: includeBibliography, setState: setIncludeBibliography },
              ].map(({ label, state, setState }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setState(!state)}
                  className="p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all"
                  style={{
                    backgroundColor: state ? 'var(--accent-soft)' : 'var(--surface-2)',
                    borderColor: state ? 'var(--primary)' : 'var(--border)',
                    color: state ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{label}</span>
                  {state && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Number of Blank Content Pages ({contentPageCount} pages)
              </label>
              <input
                type="range"
                min={1}
                max={15}
                value={contentPageCount}
                onChange={e => setContentPageCount(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Section 3: Visual Theme */}
          <div
            className="p-6 rounded-2xl border space-y-4 shadow-sm"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layout className="w-4 h-4 text-emerald-500" /> 3. Visual Styling & Theme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Border Style
                </label>
                <select
                  value={borderStyle}
                  onChange={e => setBorderStyle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="double">Double Border</option>
                  <option value="single">Single Border</option>
                  <option value="ornamental">Ornamental Border</option>
                  <option value="none">No Border</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="Georgia">Georgia (Classic Serif)</option>
                  <option value="Cinzel">Cinzel (Academic Serif)</option>
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="DM Sans">DM Sans (SaaS Sans)</option>
                  <option value="Geist">Geist (Modern Sans)</option>
                  <option value="Roboto">Roboto (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Page Border Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={e => setBorderColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border cursor-pointer"
                  />
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {borderColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 text-xs font-medium rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDocumentMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <PenTool className="w-4 h-4" />
              {createDocumentMutation.isPending ? 'Creating Document...' : 'Create Blank Document & Open Canvas'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
