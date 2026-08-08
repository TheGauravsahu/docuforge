import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Wand2, FileText, ChevronRight, ArrowRight, Info } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import api from '../lib/api.js';
import { useEditorStore } from '../store/useEditorStore.js';

const TEMPLATES = [
  { id: 'physics', label: 'Physics', topic: 'Electromagnetic Induction and its Applications' },
  { id: 'chemistry', label: 'Chemistry', topic: 'Study of Electrochemical Cells and Batteries' },
  { id: 'bio', label: 'Biology', topic: 'Effect of Light Intensity on Photosynthesis Rate' },
  { id: 'cs', label: 'Computer Science', topic: 'Artificial Intelligence in Healthcare Systems' },
  { id: 'maths', label: 'Mathematics', topic: 'Application of Derivatives in Real Life' },
];

const FORMATS = [
  { val: 'PDF', label: 'PDF', desc: 'Best for printing and submission' },
  { val: 'PPTX', label: 'PowerPoint', desc: 'For presentations and seminars' },
  { val: 'DOCX', label: 'Word Document', desc: 'For editing and collaboration' },
];

const CLASSES = ['Class IX', 'Class X', 'Class XI', 'Class XII', 'Graduation'];

export default function GeneratePage() {
  const navigate = useNavigate();
  const { setDocument } = useEditorStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    studentName: '',
    class: 'Class XII',
    school: '',
    subject: '',
    rollNumber: '',
    outputFormat: 'PDF',
    includeCoverPage: true,
    includeBonafide: true,
    includeCertificate: true,
    borderStyle: 'double',
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Map form fields → API expected shape
      const payload = {
        topic: formData.topic,
        type: formData.outputFormat,
        placeholders: {
          student_name: formData.studentName || '',
          school_name: formData.school || '',
          roll_number: formData.rollNumber || '',
          class: formData.class || 'Class XII',
          subject: formData.subject || '',
          guide_teacher: formData.guideTeacher || 'Teacher-in-Charge',
          academic_year: new Date().getFullYear() + ' - ' + (new Date().getFullYear() + 1),
        },
        borderStyle: formData.borderStyle,
        includeCoverPage: formData.includeCoverPage,
        includeBonafide: formData.includeBonafide,
        includeCertificate: formData.includeCertificate,
      };
      const response = await api.post('/ai/generate', payload);
      return response.data.document;
    },
    onSuccess: (doc) => {
      toast.success('Document generated!');
      setDocument(doc);
      navigate(`/editor/${doc.id}`);
    },
    onError: (err) => {
      console.error(err);
      if (err.response?.status === 429 || err.response?.data?.error?.includes('quota')) {
        toast.error('AI quota reached. Please wait a few seconds and try again.');
      } else {
        toast.error(err.response?.data?.error || 'Generation failed. Please try again.');
      }
    },
  });

  const handleQuickFill = (template) => {
    setFormData(prev => ({ ...prev, topic: template.topic, subject: template.label }));
  };

  const isStep1Valid = formData.topic.trim().length > 3;
  const isStep2Valid = formData.studentName.trim() && formData.school.trim();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Manual Fallback Banner */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-sm"
          style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Info className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>AI quota limit hit or prefer building from scratch? Create your document manually.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/create-manual')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 border"
            style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            Build Manually →
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[13px] font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: 'var(--text-primary)' }}>AI Generator</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Generate with AI
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Describe your project and student details. Gemini AI will generate a complete, structured document.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                style={{
                  backgroundColor: step >= s ? 'var(--primary)' : 'var(--surface-2)',
                  color: step >= s ? 'white' : 'var(--text-muted)',
                }}
              >
                {s}
              </div>
              <span className="text-[13px] font-medium" style={{ color: step === s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s === 1 ? 'Project details' : 'Student info'}
              </span>
              {s < 2 && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Project details */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Quick topic templates */}
            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Quick topic templates</h2>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Click to auto-fill topic</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleQuickFill(t)}
                    className="px-3.5 py-1.5 rounded-xl text-[13px] font-medium border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--accent-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'var(--surface-2)'; }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic & subject */}
            <div
              className="rounded-2xl border p-5 space-y-5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Project topic</h2>

              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Describe your topic *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder='e.g. "Study of Solar Energy and its practical applications in modern architecture"'
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none resize-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Physics, Chemistry..."
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none transition-colors"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Class / Year
                  </label>
                  <select
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Format + Options */}
            <div
              className="rounded-2xl border p-5 space-y-5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Export format</h2>

              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map(f => (
                  <button
                    key={f.val}
                    onClick={() => setFormData({ ...formData, outputFormat: f.val })}
                    className="rounded-xl p-4 text-left border transition-all"
                    style={{
                      borderColor: formData.outputFormat === f.val ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: formData.outputFormat === f.val ? 'var(--accent-soft)' : 'var(--surface-2)',
                    }}
                  >
                    <div className="text-[13px] font-bold mb-1" style={{ color: formData.outputFormat === f.val ? 'var(--primary)' : 'var(--text-primary)' }}>{f.label}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
                  </button>
                ))}
              </div>

              {/* Inclusions */}
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Include pages</h3>
                {[
                  { key: 'includeCoverPage', label: 'Cover Page' },
                  { key: 'includeBonafide', label: 'Bonafide Certificate' },
                  { key: 'includeCertificate', label: 'Student Declaration' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: formData[key] ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: formData[key] ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {formData[key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Continue to student info
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Student info */}
        {step === 2 && (
          <div className="space-y-6">
            <div
              className="rounded-2xl border p-5 space-y-5"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Student information</h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'studentName', label: 'Student name *', placeholder: 'Aarav Sharma', required: true },
                  { key: 'rollNumber', label: 'Roll number', placeholder: '12345' },
                  { key: 'school', label: 'School name *', placeholder: 'JNV Bhopal', required: true },
                ].map(({ key, label, placeholder, required }) => (
                  <div key={key} className={key === 'school' ? 'col-span-2' : ''}>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <input
                      type="text"
                      required={required}
                      placeholder={placeholder}
                      value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none transition-colors"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>

              {/* Border style */}
              <div>
                <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Document border style</label>
                <div className="flex gap-3">
                  {['double', 'single', 'ornamental'].map(b => (
                    <button
                      key={b}
                      onClick={() => setFormData({ ...formData, borderStyle: b })}
                      className="flex-1 py-2.5 rounded-xl border text-[13px] font-medium capitalize transition-all"
                      style={{
                        borderColor: formData.borderStyle === b ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: formData.borderStyle === b ? 'var(--accent-soft)' : 'var(--surface-2)',
                        color: formData.borderStyle === b ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: formData.borderStyle === b ? '600' : '500',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI notice */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border)' }}
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                Gemini AI will generate 8–12 chapters, a bibliography, cover page, and all selected certificate pages. This uses <strong>1 generation credit</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-1)' }}
              >
                Back
              </button>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={!isStep2Valid || generateMutation.isPending}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate document
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
