import { fetchData } from "./api";

// Track product view
export const trackProductView = async (productId: string) => {
  try {
    const response = await fetchData(`/products/${productId}/view`, {
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Error tracking product view:", error);
    return null;
  }
};

