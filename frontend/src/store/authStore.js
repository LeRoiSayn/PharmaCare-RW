import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  init: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ user: JSON.parse(user), isAuthenticated: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password, phone, address) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register({ name, email, password, phone, address });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  updateProfile: async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      const updated = res.data.user;
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
      toast.success('Profile updated');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return { success: false };
    }
  },
}));

export default useAuthStore;
