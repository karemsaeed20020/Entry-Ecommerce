import { createOrderFromCart } from "@/lib/orderApi";
import { createCheckoutSession, redirectToCheckout, StripeCheckoutItem } from "@/lib/stripe";
import { useCartStore } from "@/lib/store";

export const processDirectCheckout = async (
  authUser: any | null,
  auth_token: string | null,
  cartItemsWithQuantities: any[],
  callbacks: {
    onStart?: () => void;
    onSuccess?: () => void;
    onError?: (message: string) => void;
  },
  couponCode?: string
) => {
  if (!authUser || !auth_token) {
    callbacks.onError?.("You must be logged in to place an order.");
    return;
  }

  if (!cartItemsWithQuantities || cartItemsWithQuantities.length === 0) {
    callbacks.onError?.("Your cart is empty.");
    return;
  }

  callbacks.onStart?.();

  try {
    // Resolve user address or use a dummy fallback since we are bypassing the checkout form
    let selectedAddress;
    if (authUser.addresses && authUser.addresses.length > 0) {
      // Prefer default address, otherwise use the first one
      const defaultAddress = authUser.addresses.find((addr: any) => addr.isDefault);
      selectedAddress = defaultAddress || authUser.addresses[0];
    } else {
      // Use fallback required fields for the backend if user has no address specified in profile yet
      selectedAddress = {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
        postalCode: "00000",
      };
    }

    const orderItems = cartItemsWithQuantities.map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || item.product.image,
    }));

    // 1. Create the pending order in the database
    const orderResponse = await createOrderFromCart(
      auth_token,
      orderItems,
      selectedAddress,
      couponCode
    );

    if (!orderResponse.success || !orderResponse.order) {
      console.error("❌ Order creation failed:", orderResponse);
      throw new Error(orderResponse.message || "Failed to create order");
    }

    const finalOrder = orderResponse.order;

    // 2. Format items for Stripe
    let discountRemaining = Math.round((finalOrder.discount || 0) * 100);
    const subtotalCents = orderItems.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0);

    const stripeItems: StripeCheckoutItem[] = finalOrder.items.map((item: any, index: number) => {
      let itemPriceCents = Math.round(item.price * 100);
      
      if (discountRemaining > 0 && subtotalCents > 0) {
        // Calculate proportional discount for this item
        const itemSubtotal = itemPriceCents * item.quantity;
        const itemDiscount = index === finalOrder.items.length - 1 
          ? discountRemaining // Give all remaining discount to the last item
          : Math.floor((itemSubtotal / subtotalCents) * Math.round((finalOrder.discount || 0) * 100));
        
        // Deduct from unit price (must handle the quantity)
        // Note: Stripe requires unit_amount to be an integer. 
        // If we can't divide perfectly, we might have a slight discrepancy.
        // To be safe, we'll subtract from the first item's unit_amount as much as possible.
        discountRemaining -= itemDiscount;
        itemPriceCents = Math.max(0, Math.round((itemSubtotal - itemDiscount) / item.quantity));
      }

      return {
        name: item.name,
        description: `Quantity: ${item.quantity}${finalOrder.discount ? " (Discount applied)" : ""}`,
        amount: itemPriceCents,
        currency: "usd",
        quantity: item.quantity,
        images: item.image ? [item.image] : undefined,
      };
    });

    // Calculate shipping and tax explicitly based on cart logic
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const freeDeliveryThreshold = parseFloat(
      process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999"
    );
    const shipping = subtotal > freeDeliveryThreshold 
      ? 0 
      : parseFloat(process.env.NEXT_PUBLIC_SHIPPING_COST || "15");
    const taxRate = parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0");
    const tax = subtotal * taxRate;

    if (shipping > 0) {
      stripeItems.push({
        name: "Shipping",
        description: "Standard shipping",
        amount: Math.round(shipping * 100),
        currency: "usd",
        quantity: 1,
      });
    }

    if (tax > 0) {
      stripeItems.push({
        name: "Tax",
        description: "Sales tax",
        amount: Math.round(tax * 100),
        currency: "usd",
        quantity: 1,
      });
    }

    // 3. Create Stripe Checkout Session
    const originUrl = typeof window !== "undefined" ? window.location.origin : "";
    const stripeResult = await createCheckoutSession({
      items: stripeItems,
      customerEmail: authUser?.email,
      successUrl: `${originUrl}/success?orderId=${finalOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${originUrl}/user/orders/${finalOrder._id}`,
      metadata: {
        orderId: finalOrder._id,
        shippingAddress: JSON.stringify(selectedAddress),
      },
    });

    if ("url" in stripeResult && stripeResult.url) {
      // 4. Redirect to Stripe
      useCartStore.getState().clearCart(); // Clear the cart before redirect
      callbacks.onSuccess?.();
      await redirectToCheckout(stripeResult.url);
    } else if ("error" in stripeResult && stripeResult.error) {
      throw new Error(stripeResult.error);
    } else {
      throw new Error("Failed to get checkout session URL");
    }

  } catch (error) {
    console.error("❌ Direct Checkout Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment failed. Please try again.";
    callbacks.onError?.(errorMessage);
  }
};
