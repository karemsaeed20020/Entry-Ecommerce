import FeaturesPageClient from "@/components/pages/features/FeaturesPageClient";
import { fetchData } from "@/lib/api";
import { Brand, Category, ProductType, Seller } from "@/lib/types";

interface CategoriesResponse {
  categories: Category[];
}

export default async function FeaturesPage() {
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
    console.error("Failed to fetch features page data:", error);
  }

  return (
    <FeaturesPageClient 
      categories={categories}
      brands={brands}
      sellers={sellers}
      productTypes={productTypes}
    />
  );
}