
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000/api';
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(async (c) => {
    const token = await AsyncStorage.getItem('token');
    if (token) c.headers.Authorization = 'Bearer ' + token;
    return c;
});
api.interceptors.response.use((r) => r, async (e) => {
    if (e.response?.status === 401) await AsyncStorage.removeItem('token');
    return Promise.reject(e);
});
export default api;
