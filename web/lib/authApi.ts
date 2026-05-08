import { fetchWithConfig } from "./config";
import Cookies from "js-cookie";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string | number;
  };
};

/**
 * Enhanced authApi that uses fetchWithConfig internally.
 * This ensures that token refresh logic is unified.
 */
const authApi = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const data = await fetchWithConfig<T>(url, {
        ...options,
        method: "GET",
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "An error occurred",
          code: error.status || "ERROR",
        },
      };
    }
  },

  post: async <T>(url: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const data = await fetchWithConfig<T>(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "An error occurred",
          code: error.status || "ERROR",
        },
      };
    }
  },

  put: async <T>(url: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const data = await fetchWithConfig<T>(url, {
        ...options,
        method: "PUT",
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "An error occurred",
          code: error.status || "ERROR",
        },
      };
    }
  },

  delete: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const data = await fetchWithConfig<T>(url, {
        ...options,
        method: "DELETE",
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "An error occurred",
          code: error.status || "ERROR",
        },
      };
    }
  },

  patch: async <T>(url: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const data = await fetchWithConfig<T>(url, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "An error occurred",
          code: error.status || "ERROR",
        },
      };
    }
  },
};

/**
 * Helper to set cookie (for updating token after refresh)
 */
export const setCookie = (name: string, value: string, days: number = 7) => {
  Cookies.set(name, value, {
    expires: days,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  });
};

/**
 * Helper to remove cookie
 */
export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" });
};

export default authApi;
