"use client";

import Container from "@/components/common/Container";
import ProductCard from "@/components/common/products/ProductCard";
import { fetchData } from "@/lib/api";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Suspense,
} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EmptyListDesign from "@/components/common/products/EmptyListDesign";
import ShopSkeleton from "@/components/common/skeleton/ShopSkeleton";
import ProductCardSkeleton from "@/components/common/skeleton/ProductCardSkeleton";
import { X, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Brand, Category, Product, ProductType, Seller } from "@/lib/types";

interface ProductsResponse {
  products: Product[];
  total: number;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  productTypes: ProductType[];
  sellers: Seller[];
}

const NewArrivalsPageClient = ({
  categories,
  brands,
  productTypes,
  sellers,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [productType, setProductType] = useState<string>(searchParams.get("productType") || "");
  const [seller, setSeller] = useState<string>(searchParams.get("seller") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newlyLoadedProducts, setNewlyLoadedProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("sortOrder") as "asc" | "desc") || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [invalidCategory, setInvalidCategory] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const productsPerPage = 20;

  const updateURL = useCallback(
    (filters: {
      category?: string;
      brand?: string;
      search?: string;
      productType?: string;
      seller?: string;
      priceRange?: [number, number] | null;
      sortOrder?: "asc" | "desc";
    }) => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.search) params.set("search", filters.search);
      if (filters.productType) params.set("productType", filters.productType);
      if (filters.seller) params.set("seller", filters.seller);
      if (filters.priceRange) {
        params.set("priceMin", filters.priceRange[0].toString());
        params.set("priceMax", filters.priceRange[1].toString());
      }
      if (filters.sortOrder && filters.sortOrder !== "asc") {
        params.set("sortOrder", filters.sortOrder);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  const fetchProducts = useCallback(
    async (loadMore = false) => {
      if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        params.append("productType", "_new_arrivals"); // Specific for this page
        
        if (category) params.append("category", category);
        if (brand) params.append("brand", brand);
        if (search) params.append("search", search);
        if (seller) params.append("seller", seller);
        if (priceRange) {
          params.append("priceMin", priceRange[0].toString());
          params.append("priceMax", priceRange[1].toString());
        }
        params.append("page", currentPage.toString());
        params.append("limit", productsPerPage.toString());
        params.append("sortOrder", sortOrder);

        const response: ProductsResponse = await fetchData(`/products?${params.toString()}`);

        setTotal(response.total);

        if (loadMore) {
          setTimeout(() => {
            setNewlyLoadedProducts(response.products);
            setProducts((prev) => [...prev, ...response.products]);
            setLoadingMore(false);
          }, 300);
        } else {
          setNewlyLoadedProducts([]);
          setProducts(response.products);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        setTotal(0);
        if (!loadMore) setProducts([]);
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, brand, search, seller, priceRange, currentPage, sortOrder, productsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
  }, [category, brand, search, seller, priceRange, sortOrder]);

  useEffect(() => {
    if (currentPage === 1) fetchProducts(false);
    else fetchProducts(true);
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    if (newlyLoadedProducts.length > 0) {
      const timer = setTimeout(() => setNewlyLoadedProducts([]), 800);
      return () => clearTimeout(timer);
    }
  }, [newlyLoadedProducts]);

  const priceRanges: [number, number][] = [
    [0, 20],
    [20, 50],
    [50, 100],
    [100, Infinity],
  ];

  const totalPages = Math.ceil(total / productsPerPage);
  const hasMoreProducts = currentPage < totalPages;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loadingMore || loading || !hasMoreProducts) return;
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts && !loadingMore && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observerRef.current = observer;
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreProducts, loadingMore, loading]);

  const resetAllFilters = () => {
    setCategory("");
    setBrand("");
    setSearch("");
    setProductType("");
    setSeller("");
    setPriceRange(null);
    setSortOrder("asc");
    setCurrentPage(1);
    setInvalidCategory("");
    setProducts([]);
    router.push(pathname, { scroll: false });
  };

  const resetCategory = () => {
    setCategory("");
    setCurrentPage(1);
    updateURL({ category: "", brand, search, productType, seller, priceRange, sortOrder });
  };

  const resetBrand = () => {
    setBrand("");
    setCurrentPage(1);
    updateURL({ category, brand: "", search, productType, seller, priceRange, sortOrder });
  };

  const resetSeller = () => {
    setSeller("");
    setCurrentPage(1);
    updateURL({ category, brand, search, productType, seller: "", priceRange, sortOrder });
  };

  const resetPriceRange = () => {
    setPriceRange(null);
    setCurrentPage(1);
    updateURL({ category, brand, search, productType, seller, priceRange: null, sortOrder });
  };

  const resetSortOrder = () => {
    setSortOrder("asc");
    setCurrentPage(1);
    updateURL({ category, brand, search, productType, seller, priceRange, sortOrder: "asc" });
  };

  return (
    <Container className="">
      <div className="py-10">
        <div className="mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>New Arrivals</BreadcrumbPage></BreadcrumbItem>
              {category && (<><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{categories.find(c => c._id === category)?.name || "Category"}</BreadcrumbPage></BreadcrumbItem></>)}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">New Arrivals</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <p>{loading ? "Loading..." : `Showing ${products.length} of ${total} products`}</p>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs flex items-center gap-1.5" onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try { await navigator.share({ title: "New Arrivals - " + document.title, url }); }
                    catch { navigator.clipboard.writeText(url); toast.success("Page link copied to clipboard"); }
                  } else { navigator.clipboard.writeText(url); toast.success("Page link copied to clipboard"); }
                }}><Share2 size={14} />Share</Button>
            </div>
            {invalidCategory && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">Category &quot;{invalidCategory}&quot; not found.</p>
              </div>
            )}
          </div>
          {(category || brand || search || productType || seller || priceRange || sortOrder !== "asc") && (
            <Button variant="outline" onClick={resetAllFilters} className="text-sm border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-2" disabled={loading}>
              <X size={14} className="stroke-3" />Reset All Filters
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="bg-transparent w-full md:max-w-64 min-w-60">
            <div className="bg-background w-full p-5 rounded-lg border">
              <div className="md:hidden">
                <Button variant="outline" onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="w-full mb-4 flex items-center justify-between">
                  <span className="font-medium">Filters</span>
                  {isFiltersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </div>
              <div className="hidden md:block"><h3 className="text-lg font-medium mb-4">Filters</h3></div>
              <div className={`${isFiltersOpen ? "block" : "hidden"} md:block space-y-4`}>
                {search && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Search</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                        &quot;{search}&quot;
                        <button onClick={() => updateURL({ search: "" })} className="ml-2 text-blue-500 hover:text-blue-700"><X size={14} /></button>
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Category */}
                <div className="mb-4">
                  <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-2">Category</label>{category && <Button variant="link" size="sm" onClick={resetCategory} className="text-xs text-blue-600 p-0">Reset</Button>}</div>
                  <Select value={category || "All"} onValueChange={(v) => { const val = v === "All" ? "" : v; setCategory(val); updateURL({ category: val, brand, search, productType, seller, priceRange, sortOrder }); }}>
                    <SelectTrigger className="w-full p-2 border rounded"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent><SelectGroup><SelectLabel>Categories</SelectLabel><SelectItem value="All">All Categories</SelectItem>{categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="mb-4">
                  <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-2">Brand</label>{brand && <Button variant="link" size="sm" onClick={resetBrand} className="text-xs text-blue-600 p-0">Reset</Button>}</div>
                  <Select value={brand || "All"} onValueChange={(v) => { const val = v === "All" ? "" : v; setBrand(val); updateURL({ category, brand: val, search, productType, seller, priceRange, sortOrder }); }}>
                    <SelectTrigger className="w-full p-2 border rounded"><SelectValue placeholder="Select a brand" /></SelectTrigger>
                    <SelectContent><SelectGroup><SelectLabel>Brands</SelectLabel><SelectItem value="All">All Brands</SelectItem>{brands.map(brd => <SelectItem key={brd._id} value={brd._id}>{brd.name}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </div>

                {/* Seller */}
                <div className="mb-4">
                  <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-2">Seller</label>{seller && <Button variant="link" size="sm" onClick={resetSeller} className="text-xs text-blue-600 p-0">Reset</Button>}</div>
                  <Select value={seller || "All"} onValueChange={(v) => { const val = v === "All" ? "" : v; setSeller(val); updateURL({ category, brand, search, productType, seller: val, priceRange, sortOrder }); }}>
                    <SelectTrigger className="w-full p-2 border rounded"><SelectValue placeholder="Select a seller" /></SelectTrigger>
                    <SelectContent><SelectGroup><SelectLabel>Sellers</SelectLabel><SelectItem value="All">All Sellers</SelectItem>{sellers.map(s => <SelectItem key={s._id} value={s._id}>{s.storeName}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-2">Price Range</label>{priceRange && <Button variant="link" size="sm" onClick={resetPriceRange} className="text-xs text-blue-600 p-0">Reset</Button>}</div>
                  <Select value={priceRange ? `${priceRange[0]}-${priceRange[1]}` : "all"} onValueChange={(v) => { const val = v === "all" ? null : v.split("-").map(Number) as [number, number]; setPriceRange(val); updateURL({ category, brand, search, productType, seller, priceRange: val, sortOrder }); }}>
                    <SelectTrigger className="w-full p-2 border rounded"><SelectValue placeholder="Select a price range" /></SelectTrigger>
                    <SelectContent><SelectGroup><SelectLabel>Price Ranges</SelectLabel><SelectItem value="all">All Prices</SelectItem>{priceRanges.map(([min, max]) => <SelectItem key={`${min}-${max}`} value={`${min}-${max}`}>${min} - {max === Infinity ? "Above" : `$${max}`}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <div className="flex justify-between items-center"><label className="block text-sm font-medium mb-2">Sort By</label>{sortOrder !== "asc" && <Button variant="link" size="sm" onClick={resetSortOrder} className="text-xs text-blue-600 p-0">Reset</Button>}</div>
                  <Select value={sortOrder} onValueChange={(v: "asc" | "desc") => { setSortOrder(v); updateURL({ category, brand, search, productType, seller, priceRange, sortOrder: v }); }}>
                    <SelectTrigger className="w-full p-2 border rounded"><SelectValue placeholder="Sort By" /></SelectTrigger>
                    <SelectContent><SelectItem value="asc">Newest First</SelectItem><SelectItem value="desc">Oldest First</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background p-5 rounded-md w-full">
            {loading && products.length === 0 ? (
              <ShopSkeleton />
            ) : products?.length > 0 ? (
              <div className="w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {products?.map((product, index) => {
                    const isNewlyLoaded = newlyLoadedProducts.some(newP => newP._id === product._id);
                    return (
                      <div key={`${product._id}-${index}`} className={`transition-all duration-700 ease-out ${isNewlyLoaded ? "opacity-0 translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"}`} style={{ transitionDelay: isNewlyLoaded ? `${(index % productsPerPage) * 80}ms` : "0ms" }}>
                        <ProductCard product={product} />
                      </div>
                    );
                  })}
                  {loadingMore && Array.from({ length: 4 }).map((_, i) => <div key={`skeleton-${i}`} className="animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}><ProductCardSkeleton /></div>)}
                </div>
                {hasMoreProducts && <div ref={loadMoreRef} className="h-10" />}
                {!hasMoreProducts && products.length > 0 && total > 0 && !loadingMore && (
                  <div className="text-center py-6 mt-6">
                    <p className="text-gray-600 text-lg mb-2">🎉 You&apos;ve seen it all! No more products to show.</p>
                    <p className="text-gray-500 text-sm">Showing all {products.length} products</p>
                  </div>
                )}
              </div>
            ) : ( !loading && <EmptyListDesign message="No new arrivals match your filters." resetFilters={resetAllFilters} /> )}
          </div>
        </div>
      </div>
    </Container>
  );
};

const NewArrivalsPage = (props: Props) => {
  return (
    <Suspense fallback={<Container className=""><div className="py-10"><ShopSkeleton /></div></Container>}>
      <NewArrivalsPageClient {...props} />
    </Suspense>
  );
};

export default NewArrivalsPage;
