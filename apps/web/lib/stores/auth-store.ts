import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name?: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  avatar?: string;
  phone?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  plan: string;
  logoUrl?: string;
  currency: string;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: any, tenant: any, token: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (rawUser: any, rawTenant: any, accessToken: string) => {
        const rawName = (rawUser.name || "").trim();
        const nameParts = rawName.split(" ");
        const firstName = rawUser.firstName || nameParts[0] || "User";
        const lastName = rawUser.lastName || nameParts.slice(1).join(" ") || "";
        const name = rawName || `${firstName} ${lastName}`.trim();

        const user: User = {
          ...rawUser,
          id: rawUser.id || rawUser._id,
          tenantId: rawUser.tenantId || rawTenant?.id || rawTenant?._id,
          name,
          firstName,
          lastName,
          role: rawUser.role || "owner",
        };

        const tenant: Tenant = rawTenant
          ? {
              ...rawTenant,
              id: rawTenant.id || rawTenant._id,
              name: rawTenant.name || "DineFlow Restaurant",
              slug: rawTenant.slug || "dineflow",
              type: rawTenant.businessType || rawTenant.type || "restaurant",
              plan: rawTenant.plan || "growth",
              currency: rawTenant.currency || "INR",
              onboardingCompleted: rawTenant.onboarding?.completed ?? rawTenant.onboardingCompleted ?? true,
            }
          : null!;

        set({
          user,
          tenant,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setAccessToken: (accessToken) =>
        set({
          accessToken,
          isAuthenticated: !!accessToken,
        }),

      clearAuth: () =>
        set({
          user: null,
          tenant: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateTenant: (tenantUpdates) =>
        set((state) => ({
          tenant: state.tenant ? { ...state.tenant, ...tenantUpdates } : null,
        })),

      updateUser: (userUpdates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        })),
    }),
    {
      name: "dineflow_auth",
    }
  )
);
