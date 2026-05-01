import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
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
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  setAuthData: (token: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  checkIsAdmin: () => boolean;
  canPerformCRUD: () => boolean;
  isReadOnly: () => boolean;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (credentials) => {
        try {
          const response = await api.post("/auth/login", credentials);
          
          // Debug: Log the entire response to see its structure
          console.log("Full response:", response);
          console.log("Response data:", response.data);
          
          // Option 1: If user is directly in response.data
          let user = response.data.user || response.data;
          let accessToken = response.data.accessToken || response.data.token;
          let refreshToken = response.data.refreshToken || response.data.refresh_token;
          
          // Option 2: If response is nested (e.g., response.data.data)
          if (response.data.data) {
            user = response.data.data.user || response.data.data;
            accessToken = response.data.data.accessToken || response.data.data.token;
            refreshToken = response.data.data.refreshToken || response.data.data.refresh_token;
          }
          
          console.log("Extracted user:", user);
          console.log("Extracted accessToken:", accessToken);
          console.log("Extracted refreshToken:", refreshToken);
          
          // Check if user exists before accessing role
          if (!user) {
            console.error("No user object found in response");
            throw new Error("Invalid response structure: user not found");
          }
          
          // Check if user is admin
          if (user.role !== "admin") {
            console.error("Access denied: User is not an admin. Role:", user.role);
            throw new Error("Access denied. Admin privileges required.");
          }
          
          if (accessToken && user) {
            set({
              user: user,
              token: accessToken,
              refreshToken: refreshToken,
              isAuthenticated: true,
            });
            console.log("Login successful for admin user:", user.name);
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
        if (user.role !== "admin") {
          throw new Error("Access denied. Admin privileges required.");
        }
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
           // Clear persisted storage
        localStorage.removeItem("auth-storage");
        
        // Clear any other stored data
        sessionStorage.clear();
      },

      checkIsAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },
       canPerformCRUD: () => {
        const { user } = get();
        return canPerformCRUD(user?.email, user?.role);
      },

      isReadOnly: () => {
        const { user } = get();
        return isReadOnlyUser(user?.email);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;