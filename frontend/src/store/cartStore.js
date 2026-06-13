import { create } from 'zustand';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      const { data } = await cartAPI.get();
      set({ cart: data });
    } catch {}
  },

  addToCart: async (productId, quantity = 1, productName) => {
    set({ loading: true });
    try {
      const { data } = await cartAPI.add(productId, quantity);
      set({ cart: data });
      toast.success(`${productName || 'Item'} added to cart`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const { data } = await cartAPI.update(itemId, quantity);
      set({ cart: data });
    } catch {
      toast.error('Failed to update quantity');
    }
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await cartAPI.remove(itemId);
      set({ cart: data });
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: { ...get().cart, items: [] } });
    } catch {}
  },

  getTotal: () => {
    const { cart } = get();
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  getItemCount: () => {
    const { cart } = get();
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  hasPrescriptionRequired: () => {
    const { cart } = get();
    return cart?.items?.some((item) => item.product.prescriptionRequired) || false;
  },
}));

export default useCartStore;
