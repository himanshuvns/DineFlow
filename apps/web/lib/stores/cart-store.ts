import { create } from "zustand";

export interface CartModifier {
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // unique per configuration
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedVariant?: string;
  selectedModifiers: CartModifier[];
  notes?: string;
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  tenantSlug: string;
  tableSlug: string;
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
  setContext: (tenantSlug: string, tableSlug: string) => void;
  setCustomerInfo: (name: string, phone: string, instructions?: string) => void;
  addItem: (item: Omit<CartItem, "cartItemId" | "totalPrice">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tenantSlug: "",
  tableSlug: "",
  customerName: "",
  customerPhone: "",
  specialInstructions: "",

  setContext: (tenantSlug, tableSlug) => set({ tenantSlug, tableSlug }),

  setCustomerInfo: (customerName, customerPhone, specialInstructions = "") =>
    set({ customerName, customerPhone, specialInstructions }),

  addItem: (newItem) =>
    set((state) => {
      // Calculate single item unit with modifiers
      let modTotal = 0;
      for (const m of newItem.selectedModifiers) {
        modTotal += m.price;
      }
      const singlePrice = newItem.unitPrice + modTotal;
      const cartItemId = `${newItem.menuItemId}-${newItem.selectedVariant || "default"}-${newItem.selectedModifiers
        .map((m) => m.name)
        .sort()
        .join(",")}`;

      const existingIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: singlePrice * newQty,
          notes: newItem.notes || existing.notes,
        };
        return { items: updated };
      }

      return {
        items: [
          ...state.items,
          {
            ...newItem,
            cartItemId,
            totalPrice: singlePrice * newItem.quantity,
          },
        ],
      };
    }),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
      }
      return {
        items: state.items.map((i) => {
          if (i.cartItemId === cartItemId) {
            let modTotal = 0;
            for (const m of i.selectedModifiers) {
              modTotal += m.price;
            }
            const single = i.unitPrice + modTotal;
            return { ...i, quantity, totalPrice: single * quantity };
          }
          return i;
        }),
      };
    }),

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  getTax: () => {
    return Math.round(get().getSubtotal() * 0.05 * 100) / 100; // 5% standard GST
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
