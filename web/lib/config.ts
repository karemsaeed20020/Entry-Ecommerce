// NOTE: js-cookie is NOT imported at the top level — it relies on `document.cookie`
// which is unavailable in the Node.js server runtime (SSR).
// Each usage is guarded by `typeof window !== 'undefined'` and uses require().

interface ApiConfig {
  baseUrl: string;
  isProduction: boolean;
}

/**
 * Get API configuration based on environment
 */
export const getApiConfig = (): ApiConfig => {
  // Check if we're in browser or server environment
  const isClient = typeof window !== "undefined";

  let baseUrl: string;

  if (isClient) {
    // Client-side: use NEXT_PUBLIC_API_URL
    baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
  } else {
    // Server-side: use API_ENDPOINT or NEXT_PUBLIC_API_URL as fallback
    // During build, NEXT_PUBLIC_API_URL might be the only one available
    baseUrl =
      process.env.API_ENDPOINT ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000/";
  }

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";

  return {
    baseUrl,
    isProduction,
  };
};

/**
 * Enhanced fetch function with better error handling
 */
// Helper to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Enhanced fetch function with better error handling and automatic token refresh
 */
export async function fetchWithConfig<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { baseUrl } = getApiConfig();
  const isClient = typeof window !== "undefined";

  // Ensure endpoint starts with / and prepend /api
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const apiEndpoint = normalizedEndpoint.startsWith("/api")
    ? normalizedEndpoint
    : `/api${normalizedEndpoint}`;

  const url = `${baseUrl.replace(/\/$/, "")}${apiEndpoint}`;

  const method = (options?.method ?? "GET").toUpperCase();
  const isMutation = method !== "GET";

  // Build default headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  // If running in browser, prioritize the latest token from cookies
  // to avoid using stale tokens from component state.
  if (isClient) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Cookies = require("js-cookie");
    const cookieToken = Cookies.get("auth_token");
    
    if (cookieToken) {
      const bearerToken = `Bearer ${cookieToken}`;
      // ALWAYS use the cookie token on the client if it exists,
      // as it's the source of truth updated by the refresh logic.
      headers.Authorization = bearerToken;
    }
  }

  const defaultOptions: RequestInit = {
    // Only apply Next.js cache for GET requests.
    ...(isMutation
      ? { cache: "no-store" as RequestCache }
      : {
          next: {
            revalidate: process.env.REVALIDATION_TIME
              ? parseInt(process.env.REVALIDATION_TIME)
              : 60,
          },
        }),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers,
  };

  try {
    if (isClient) {
      console.log(`[Fetch] ${method} ${url}`);
    }
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401 && isClient && !url.includes("/auth/login") && !url.includes("/auth/refresh")) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Cookies = require("js-cookie");
        const refreshToken = Cookies.get("refresh_token");
        
        if (refreshToken) {
          // If already refreshing, wait for it
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              subscribeTokenRefresh(async (token) => {
                try {
                  const retryOptions = {
                    ...mergedOptions,
                    headers: {
                      ...mergedOptions.headers,
                      Authorization: `Bearer ${token}`,
                    },
                  };
                  const retryResponse = await fetch(url, retryOptions);
                  if (!retryResponse.ok) throw new Error("Retry failed after waiting for refresh");
                  resolve(await retryResponse.json());
                } catch (err) {
                  reject(err);
                }
              });
            });
          }

          isRefreshing = true;

          try {
            const refreshResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              const accessToken = data.accessToken;
              
              if (accessToken) {
                // Update cookies
                Cookies.set("auth_token", accessToken, {
                   expires: 7,
                   secure: process.env.NODE_ENV === "production",
                   sameSite: "lax",
                });

                onTokenRefreshed(accessToken);
                
                // Update the Zustand store via custom event to avoid circular dependencies
                if (isClient) {
                  window.dispatchEvent(new CustomEvent("auth_token_refreshed", { 
                    detail: { accessToken } 
                  }));
                }

                isRefreshing = false;

                // Retry original request with new token
                const retryOptions = {
                  ...mergedOptions,
                  headers: {
                    ...mergedOptions.headers,
                    Authorization: `Bearer ${accessToken}`,
                  },
                };
                
                const retryResponse = await fetch(url, retryOptions);
                if (retryResponse.ok) {
                   return await retryResponse.json();
                }
              }
            }
            
            // If refresh failed or no token returned, clean up and redirect
            Cookies.remove("auth_token");
            Cookies.remove("refresh_token");
            
            // Also update the store if possible
            try {
              const { useUserStore } = require("./store");
              useUserStore.getState().logoutUser();
            } catch { /* ignore */ }

            isRefreshing = false;
            
            // Redirect to login if on a protected page
            if (isClient) {
              const currentPath = window.location.pathname;
              if (!currentPath.includes("/auth/")) {
                window.dispatchEvent(new CustomEvent("auth_session_expired"));
                window.location.href = `/auth/signin?redirect=${encodeURIComponent(currentPath)}`;
              }
            }
            throw new Error("Session expired. Please sign in again.");

          } catch (refreshError) {
            isRefreshing = false;
            throw refreshError;
          }
        } else {
          // No refresh token available, clean up and redirect
          Cookies.remove("auth_token");
          Cookies.remove("refresh_token");
          
          isRefreshing = false;
          
          if (isClient) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/auth/")) {
              window.location.href = `/auth/signin?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
          throw new Error("Session expired. Please sign in again.");
        }
      }

      // Try to parse error message from response body
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch { /* ignore */ }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Don't log expected redirection errors
    if (error instanceof Error && error.message === "Session expired. Please sign in again.") {
      throw error;
    }
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}


/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Build query string from parameters
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,

  // Brands
  BRANDS: "/brands",
  BRAND_BY_ID: (id: string) => `/brands/${id}`,

  // Users
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_PROFILE: "/users/profile",

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  USER_ORDERS: (userId: string) => `/orders/user/${userId}`,

  // Cart
  CART: "/cart",
  ADD_TO_CART: "/cart/add",
  REMOVE_FROM_CART: "/cart/remove",

  // Stats & Analytics
  STATS: "/stats",
  ANALYTICS: "/analytics",
  
  // Sellers
  SELLERS: "/sellers",
  SELLER_BY_ID: (id: string) => `/sellers/${id}`,
  // Reviews
  REVIEWS: "/reviews",
  MY_REVIEWS: "/reviews/my-reviews",
  REVIEW_HELPFUL: (reviewId: string) => `/reviews/${reviewId}/helpful`,
  REVIEW_BY_ID: (reviewId: string) => `/reviews/${reviewId}`,
  CONTACT: "/contact",
} as const;
