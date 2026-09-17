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
  isFirstLogin?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  plan: string;
  logoUrl?: string;
  logo?: string;
  currency: string;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating?: boolean;
  impersonatedTenant?: Tenant | null;
  originalUser?: User | null;
  originalTenant?: Tenant | null;
  setAuth: (user: any, tenant: any, token: string, isFirstLogin?: boolean) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  updateUser: (user: Partial<User>) => void;
  startImpersonation: (targetTenant: Tenant) => void;
  stopImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isImpersonating: false,
      impersonatedTenant: null,
      originalUser: null,
      originalTenant: null,

      setAuth: (rawUser: any, rawTenant: any, accessToken: string, isFirstLogin?: boolean) => {
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
          isFirstLogin:
            typeof isFirstLogin === "boolean"
              ? isFirstLogin
              : typeof rawUser.isFirstLogin === "boolean"
              ? rawUser.isFirstLogin
              : undefined,
        };

        const resolvedLogo = rawTenant?.logoUrl || rawTenant?.logo || "";

        const tenant: Tenant = rawTenant
          ? {
              ...rawTenant,
              id: rawTenant.id || rawTenant._id,
              name: rawTenant.name || "DineFlow Restaurant",
              slug: rawTenant.slug || "dineflow",
              type: rawTenant.businessType || rawTenant.type || "restaurant",
              plan: rawTenant.plan || "growth",
              logoUrl: resolvedLogo,
              logo: resolvedLogo,
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
          isImpersonating: false,
          impersonatedTenant: null,
          originalUser: null,
          originalTenant: null,
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
          isImpersonating: false,
          impersonatedTenant: null,
          originalUser: null,
          originalTenant: null,
        }),

      updateTenant: (tenantUpdates) =>
        set((state) => ({
          tenant: state.tenant ? { ...state.tenant, ...tenantUpdates } : null,
        })),

      updateUser: (userUpdates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        })),

      startImpersonation: (targetTenant: Tenant) => {
        const state = get();
        set({
          originalUser: state.user,
          originalTenant: state.tenant,
          isImpersonating: true,
          impersonatedTenant: targetTenant,
          tenant: targetTenant,
        });
      },

      stopImpersonation: () => {
        const state = get();
        if (state.originalTenant) {
          set({
            tenant: state.originalTenant,
            user: state.originalUser || state.user,
            isImpersonating: false,
            impersonatedTenant: null,
            originalUser: null,
            originalTenant: null,
          });
        } else {
          set({
            isImpersonating: false,
            impersonatedTenant: null,
            originalUser: null,
            originalTenant: null,
          });
        }
      },
    }),
    {
      name: "dineflow_auth",
    }
  )
);
