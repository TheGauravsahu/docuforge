import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { toast } from 'sonner';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let res;
    if (isRegister) {
      res = await register(formData.name, formData.email, formData.password);
    } else {
      res = await login(formData.email, formData.password);
    }

    if (res.success) {
      toast.success(isRegister ? 'Account created! Welcome to DocuForge.' : 'Welcome back!');
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  const handleSwitch = (toRegister) => {
    setIsRegister(toRegister);
    setErrorMsg('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex">

      {/* Left: branded dark-green gradient panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B1F17 0%, #123326 50%, #1E5B3F 100%)',
        }}
      >
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Sparkles className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-[17px] text-white">DocuForge AI</span>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-[24px] font-semibold leading-snug text-white">
            "Generated my entire Physics project in under 10 minutes. The canvas editor made customisation effortless."
          </blockquote>
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
              alt="Student"
              className="w-10 h-10 rounded-full border-2 border-white/30"
            />
            <div>
              <div className="text-[14px] font-semibold text-white">Priya Sharma</div>
              <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Class XII, JNV Bhopal</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {['10,000+ projects generated', 'PDF, PPTX & DOCX export', 'Gemini 2.5 powered'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-16"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <div className="w-full max-w-[380px] space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>DocuForge</span>
          </div>

          <div>
            <h1 className="text-[26px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              {isRegister
                ? 'Start building structured documents with AI.'
                : 'Sign in to your DocuForge workspace.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1"
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            {[{ label: 'Sign in', val: false }, { label: 'Sign up', val: true }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => handleSwitch(val)}
                className="flex-1 py-2 rounded-lg text-[14px] font-medium transition-all"
                style={{
                  backgroundColor: isRegister === val ? 'var(--surface-1)' : 'transparent',
                  color: isRegister === val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isRegister === val ? '600' : '500',
                  boxShadow: isRegister === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              className="px-4 py-3 rounded-xl text-[13px] font-medium"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)', border: '1px solid #FECACA' }}
            >
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-[14px] border outline-none transition-colors"
                    style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="you@school.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-[14px] border outline-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-[14px] border outline-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-[13px] text-center" style={{ color: 'var(--text-muted)' }}>
            By continuing, you agree to our{' '}
            <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>.
          </p>

        </div>
      </div>

    </div>
  );
}
