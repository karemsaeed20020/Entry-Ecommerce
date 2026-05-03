import NewArrivalsPageClient from "@/components/pages/new-arrivals/NewArrivalsPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category, ProductType, Seller } from "@/lib/types";

interface CategoriesResponse {
  categories: Category[];
}

export default async function NewArrivalsPage() {
  let brands: Brand[] = [];
  let categories: Category[] = [];
  let sellers: Seller[] = [];
  let productTypes: ProductType[] = [];

  try {
    // Fetch data for filters
    const [brandsData, categoriesData, sellersData, productTypesData] = await Promise.all([
      fetchData<Brand[]>("/brands").catch(() => []),
      fetchData<CategoriesResponse>("/categories").catch(() => ({ categories: [] })),
      fetchData<Seller[]>("/sellers/approved").catch(() => []),
      fetchData<ProductType[]>("/product-types").catch(() => []),
    ]);

    brands = brandsData;
    categories = categoriesData.categories;
    sellers = sellersData;
    productTypes = productTypesData;

  } catch (error) {
    console.error("Failed to fetch new arrivals page data:", error);
  }

  return (
    <NewArrivalsPageClient 
      categories={categories}
      brands={brands}
      sellers={sellers}
      productTypes={productTypes}
    />
  );
}
