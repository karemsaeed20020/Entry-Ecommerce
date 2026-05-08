import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
import axios from "axios";
import { canPerformCRUD, isReadOnlyUser } from "../lib/readOnlyConfig";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  permissions?: string[];
  employee_role?: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  axiosPrivate: ReturnType<typeof axios.create>; // ← add this
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  setAuthData: (token: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  checkIsAdmin: () => boolean;
  checkIsSeller: () => boolean;
  canPerformCRUD: () => boolean;
  isReadOnly: () => boolean;
};

// Create the private axios instance once, outside the store
const axiosPrivateInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      axiosPrivate: axiosPrivateInstance, // ← expose it

      login: async (credentials) => {
        try {
          const response = await api.post("/auth/login", credentials);

          let user = response.data.user || response.data;
          let accessToken = response.data.accessToken || response.data.token;
          let refreshToken = response.data.refreshToken || response.data.refresh_token;

          if (response.data.data) {
            user = response.data.data.user || response.data.data;
            accessToken = response.data.data.accessToken || response.data.data.token;
            refreshToken = response.data.data.refreshToken || response.data.data.refresh_token;
          }

          if (!user) throw new Error("Invalid response structure: user not found");
          if (user.role !== "admin" && user.role !== "seller" && user.role !== "employee") throw new Error("Access denied. Admin or Seller privileges required.");

          if (accessToken && user) {
            // ← inject token into axiosPrivate on login
            axiosPrivateInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            set({ user, token: accessToken, refreshToken, isAuthenticated: true });
          } else {
            throw new Error("Missing accessToken or user data");
          }
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },

      register: async (userData) => {
        try {
          await api.post("/auth/register", userData);
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        }
      },

      setAuthData: (token: string, refreshToken: string, user: User) => {
        if (user.role !== "admin" && user.role !== "seller" && user.role !== "employee") throw new Error("Access denied. Admin or Seller privileges required.");
        axiosPrivateInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      setUser: (user: User) => set({ user }),

      logout: () => {
        // ← clear token from axiosPrivate on logout
        delete axiosPrivateInstance.defaults.headers.common["Authorization"];
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
        sessionStorage.clear();
      },

      checkIsAdmin: () => get().user?.role === "admin",
      checkIsSeller: () => get().user?.role === "seller",
      canPerformCRUD: () => canPerformCRUD(get().user?.email, get().user?.role),
      isReadOnly: () => isReadOnlyUser(get().user?.email),
    }),
    {
      name: "auth-storage",
      // ← re-hydrate the token into axiosPrivate after page refresh
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axiosPrivateInstance.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;