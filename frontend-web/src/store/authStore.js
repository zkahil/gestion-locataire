// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            login: async (email, password) => {
                set({ loading: true });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    set({ user, token, loading: false });
                    return { success: true };
                } catch (error) {
                    set({ loading: false });
                    return { 
                        success: false, 
                        error: error.response?.data?.message || 'Erreur de connexion' 
                    };
                }
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },
            setUser: (user) => set({ user }),
        }),
        { name: 'auth-storage' }
    )
);

export default useAuthStore;