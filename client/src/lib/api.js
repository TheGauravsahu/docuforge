import axios from 'axios';
import { toast } from 'sonner';
import { useEditorStore } from '../store/useEditorStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('docuforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirectingToAuth = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401;
    const isAuthPage = window.location.pathname.startsWith('/auth');

    if (is401 && !isAuthPage && !isRedirectingToAuth) {
      isRedirectingToAuth = true;

      try {
        // Back up active document from editor store if editing
        const currentDoc = useEditorStore.getState().document;
        if (currentDoc && currentDoc.id) {
          localStorage.setItem(`docuforge_unsaved_doc_${currentDoc.id}`, JSON.stringify(currentDoc));
          localStorage.setItem('docuforge_pending_redirect_doc_id', currentDoc.id);
        }
      } catch (e) {
        console.error('[API 401 Handler] Failed to backup unsaved document:', e);
      }

      // Remove expired token
      localStorage.removeItem('docuforge_token');

      // Toast notification
      toast.error('Session expired. Unsaved work saved to local storage. Please log in to resume.');

      // Redirect to auth page
      setTimeout(() => {
        isRedirectingToAuth = false;
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth?session_expired=true';
        }
      }, 600);
    }

    return Promise.reject(error);
  }
);

export default api;
