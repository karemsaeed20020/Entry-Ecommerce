import { payment } from "@/assets/image";
import Container from "@/components/common/Container";
import { fetchData } from "@/lib/api";
import { isValidObjectId } from "@/lib/productHelpers";
import { Box, Truck } from "lucide-react";
import Image from "next/image";
import React from "react";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import ProductCard from "@/components/common/products/ProductCard";
import { Product } from "@/lib/types";
import BackToHome from "@/components/common/buttons/BackToHome";
import ProductImageGallery from "@/components/pages/product/ProductImageGallery";
import ProductDetailsClient from "@/components/pages/product/ProductDetailsClient";
import ProductDescriptionClient from "@/components/pages/product/ProductDescriptionClient";
import ProductReviews from "@/components/pages/product/ReviewForm";

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  let product: Product | null = null;

  try {
    product = await fetchData<Product>(`/products/${id}`, {
      next: { revalidate: 300 },
    });

    if (product && product.slug && isValidObjectId(id)) {
      redirect(`/product/${product.slug}`);
    }
  } catch (error) {
    console.error("Error fetching product during build:", error);
    return (
      <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
        <h2 className="text-lg">
          No products found with <span className="font-medium">#id</span>{" "}
          <span className="font-semibold text-primary underline">{id}</span>
        </h2>
        <BackToHome />
      </div>
    );
  }

  let relatedProducts: Product[] = [];
  if (product?.category?._id) {
    try {
      const response = await fetchData<{ products: Product[] }>(
        `/products?category=${product.category._id}&limit=5`
      );
      relatedProducts = response.products
        .filter((p) => p._id !== product!._id)
        .slice(0, 4);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  }

  const discountedPrice = product?.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product?.price;

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
        <h2 className="text-lg">
          No products found with <span className="font-medium">#id</span>{" "}
          <span className="font-semibold text-primary underline">{id}</span>
        </h2>
        <BackToHome />
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen pb-10">
      <Container className="">
        {/* Breadcrumb */}
        <div className="pt-5 pb-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product?.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/shop?category=${product.category._id}`}>
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {product?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── Main product section ── */}
        <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

            {/* Left — Image gallery */}
            <ProductImageGallery
              images={
                product?.images && product.images.length > 0
                  ? product.images
                  : [product?.image]
              }
              productName={product?.name}
              discountPercentage={product?.discountPercentage}
              stock={product?.stock}
            />

            {/* Right — All product details + actions */}
            <div className="flex flex-col gap-6">
              {/*
                ProductDetailsClient contains:
                - Star rating + review count (links to #reviews)
                - Product name (h1)
                - Price (discounted + original)
                - Stock status
                - About / description snippet
                - Category + Brand links
                - View count
                - Quantity stepper (− n +)
                - Add to Cart button
                - Wishlist + Compare row
                - Buy Now / Ask Question / Share row
              */}
              <ProductDetailsClient
                product={product}
                discountedPrice={discountedPrice}
              />

              {/* Delivery info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Truck className="text-primary mt-0.5" size={24} />
                  <div>
                    <p className="font-medium text-foreground">
                      Estimated Delivery
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(
                        Date.now() + 14 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Box className="text-primary mt-0.5" size={24} />
                  <div>
                    <p className="font-medium text-foreground">
                      Free Shipping & Returns
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      On all orders over $200.00
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment badge */}
              <div className="bg-muted flex flex-col items-center justify-center p-6 rounded-lg border border-muted-foreground/20">
                <Image
                  src={payment}
                  alt="paymentImage"
                  className="w-72 sm:w-80 mb-2"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Guaranteed safe & secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description tabs ── */}
        <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10 mt-6">
          <ProductDescriptionClient initialProduct={product} />
        </div>

        {/* ── PRODUCT REVIEWS SECTION - ADDED HERE ── */}
        {/* NO SHEET/DIALOG WRAPPER - Directly rendered */}
        {/* <div 
          id="reviews-section"
          className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10 mt-6"
        >
          <ProductReviews productId={product._id} />
        </div> */}

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetails;