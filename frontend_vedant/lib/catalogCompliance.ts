import type { Product } from "@/lib/types/product";

const restrictedCatalogTerms = /\b(medicine|medicines|aark|ark|ayurveda|triphala|inhalant)\b/i;

type CatalogLike = Partial<Pick<Product, "name" | "slug" | "type" | "category" | "brand" | "description" | "tags">>;

export const isCatalogCategoryVisible = (name?: string | null) => {
  return !restrictedCatalogTerms.test(name || "");
};

export const getCatalogCategoryDisplayName = (name: string) => {
  return name.replace(/Yoga\s*&\s*Healing\s*Oils/i, "Yoga & Meditation Oils");
};

export const isProductVisibleForRazorpay = (product?: CatalogLike | null) => {
  if (!product) return false;
  if (product.type === "service") return false;

  const searchableValues = [
    product.name,
    product.slug,
    product.category,
    product.brand,
    product.description,
    ...(product.tags || []),
  ];

  return searchableValues.every((value) => !restrictedCatalogTerms.test(value || ""));
};

export const filterVisibleProducts = <T extends CatalogLike>(products: T[] = []) => {
  return products.filter(isProductVisibleForRazorpay);
};
