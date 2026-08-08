import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api.js';

export const useFolderStore = create(
  persist(
    (set, get) => ({
      folders: [],
      activeFolderId: null,
      isLoading: false,

      fetchFolders: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/folders');
          set({ folders: res.data.folders || [], isLoading: false });
        } catch (err) {
          set({ isLoading: false });
        }
      },

      createFolder: async (name, parentId = null) => {
        try {
          const res = await api.post('/folders', { name, parentId });
          set({ folders: [...get().folders, res.data.folder] });
          return res.data.folder;
        } catch (err) {
          console.error(err);
        }
      },

      setActiveFolder: (folderId) => set({ activeFolderId: folderId }),
    }),
    {
      name: 'docuforge_folder_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
