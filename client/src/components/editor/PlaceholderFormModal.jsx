import React, { useState, useEffect } from 'react';
import { X, Check, School, User, Hash, Calendar, GraduationCap, BookOpen } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { toast } from 'sonner';

export default function PlaceholderFormModal({ isOpen, onClose }) {
  const { document, updatePlaceholders } = useEditorStore();
  const { user } = useAuthStore();
  const currentPlaceholders = document?.contentJson?.placeholders || {};

  // Try loading saved student info from localStorage
  const savedStudentInfo = () => {
    try {
      const stored = localStorage.getItem('docuforge_student_info');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const [formData, setFormData] = useState({
    school_name: '',
    student_name: '',
    roll_number: '',
    academic_year: '',
    guide_teacher: '',
    class: '',
    subject: '',
  });

  useEffect(() => {
    if (isOpen) {
      const saved = savedStudentInfo();
      setFormData({
        school_name: currentPlaceholders.school_name || saved.school_name || user?.school || '',
        student_name: currentPlaceholders.student_name || saved.student_name || user?.name || '',
        roll_number: currentPlaceholders.roll_number || saved.roll_number || user?.rollNumber || '',
        academic_year: currentPlaceholders.academic_year || saved.academic_year || `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
        guide_teacher: currentPlaceholders.guide_teacher || saved.guide_teacher || '',
        class: currentPlaceholders.class || saved.class || user?.grade || 'Class XII',
        subject: currentPlaceholders.subject || saved.subject || '',
      });
    }
  }, [isOpen, document, user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update store
    updatePlaceholders(formData);
    // Save to localStorage for sync across all documents
    try {
      localStorage.setItem('docuforge_student_info', JSON.stringify(formData));
    } catch (err) {
      console.error(err);
    }
    toast.success('Student & School info updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 space-y-5 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Fill Student & School Info
            </h2>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Automatically populates cover pages, bonafide certificates, and student declarations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <School className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              School / College Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kendriya Vidyalaya / JNV Bhopal"
              value={formData.school_name}
              onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
              className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                Student Name *
              </label>
              <input
                type="text"
                required
                placeholder="Student Name"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Hash className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                Roll Number / ID *
              </label>
              <input
                type="text"
                required
                placeholder="Roll Number"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                Class / Grade
              </label>
              <input
                type="text"
                placeholder="e.g. Class XII"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                Teacher / Guide Name
              </label>
              <input
                type="text"
                placeholder="Guide Teacher Name"
                value={formData.guide_teacher}
                onChange={(e) => setFormData({ ...formData, guide_teacher: e.target.value })}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              Academic Session
            </label>
            <input
              type="text"
              placeholder="2025 - 2026"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[13px] font-medium rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Check className="w-4 h-4" />
              Apply & Sync Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
