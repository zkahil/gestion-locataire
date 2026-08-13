
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    loading: false,
    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            await AsyncStorage.setItem('token', token);
            set({ user, token, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, error: error.response?.data?.message };
        }
    },
    logout: async () => { await AsyncStorage.removeItem('token'); set({ user: null, token: null }); },
    loadUser: async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/auth/me');
            set({ user: res.data.user, token });
        } catch { await AsyncStorage.removeItem('token'); set({ user: null, token: null }); }
    }
}));
export default useAuthStore;
