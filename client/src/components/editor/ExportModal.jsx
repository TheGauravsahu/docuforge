import React, { useState } from 'react';
import { X, FileText, Presentation, FileCode, Download, Loader2, CheckCircle2, Printer } from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

export default function ExportModal({ isOpen, onClose }) {
  const { document } = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  if (!isOpen || !document) return null;

  const handlePrintPdf = (customHtml) => {
    const htmlToPrint = customHtml || exportResult?.htmlContent;
    if (!htmlToPrint) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to open the PDF window.');
      return;
    }
    printWindow.document.write(htmlToPrint);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);
    try {
      const res = await api.post(`/documents/${document.id}/export`, {
        format: selectedFormat,
        contentJson: document.contentJson,
      });
      const exp = res.data.export;
      setExportResult(exp);
      setIsExporting(false);

      if (selectedFormat === 'PDF' && exp?.htmlContent) {
        toast.success('PDF document compiled! Opening print / save window...');
        handlePrintPdf(exp.htmlContent);
      } else if (exp?.fileUrl) {
        // Direct PPTX / DOCX download
        const link = window.document.createElement('a');
        link.href = exp.fileUrl;
        link.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedFormat.toLowerCase()}`;
        link.click();
        toast.success(`${selectedFormat} downloaded successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Export failed. Please try again.');
      setIsExporting(false);
    }
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
              Export Document
            </h2>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Export your project in print-ready PDF, PowerPoint slides, or Word format.
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

        {/* Content */}
        <div className="space-y-4">
          <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Choose Target Export Format
          </span>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'PDF', label: 'PDF Document', desc: 'Printable A4 (All Pages)', icon: FileText },
              { id: 'PPTX', label: 'PowerPoint', desc: '.pptx slides', icon: Presentation },
              { id: 'DOCX', label: 'MS Word', desc: '.docx file', icon: FileCode },
            ].map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedFormat(id)}
                className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center"
                style={{
                  borderColor: selectedFormat === id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedFormat === id ? 'var(--accent-soft)' : 'var(--surface-2)',
                }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: selectedFormat === id ? 'var(--primary)' : 'var(--text-muted)' }}
                />
                <span
                  className="text-[13px] font-bold"
                  style={{ color: selectedFormat === id ? 'var(--primary)' : 'var(--text-primary)' }}
                >
                  {label}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              </button>
            ))}
          </div>

          {exportResult && (
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>
                <CheckCircle2 className="w-4 h-4" />
                Export generated successfully!
              </div>

              {exportResult.htmlContent && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => handlePrintPdf()}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Printer className="w-4 h-4" />
                    Print / Save PDF (All Pages)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-[13px] font-medium rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
            >
              Close
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {selectedFormat}...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate & Export {selectedFormat}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
