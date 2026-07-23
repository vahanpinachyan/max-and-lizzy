export type AgeRange = "0-3" | "3-6" | "6-12";

export type Category =
  | "educational"
  | "wooden-toys"
  | "outdoor-play"
  | "puzzles-games"
  | "baby-toddler";

export interface CategoryInfo {
  slug: Category;
  name: string;
  shortDescription: string;
  image: string;
  subcategories: { slug: string; name: string }[];
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductReview {
  id: string;
  productSlug: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  date: string; // ISO date
  verifiedPurchase: boolean;
}

export interface ProductRating {
  average: number | null;
  count: number;
}

export interface Product {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceAmd: number;
  compareAtPriceAmd?: number;
  category: Category;
  subcategory: string;
  ageRange: AgeRange;
  materials: string[];
  safetyInfo: string[];
  brand: string;
  images: ProductImage[];
  inStock: boolean;
  sku: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  relatedSlugs?: string[];
  dimensions?: string;
  weightGrams?: number;
  careInstructions?: string;
  countryOfOrigin?: string;
  packageContents?: string;
  assemblyRequired?: boolean;
  assemblyNote?: string;
  supervisionNote?: string;
  warranty?: string;
  pickBy?: "max" | "lizzy";
  pickNote?: string;
  rating?: number | null;
  reviewCount?: number;
}

export interface Testimonial {
  id: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  titleHy?: string;
  titleRu?: string;
  excerpt: string;
  excerptHy?: string;
  excerptRu?: string;
  content: string; // markdown-ish, rendered with simple paragraph splitting
  contentHy?: string;
  contentRu?: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageAltHy?: string;
  coverImageAltRu?: string;
  author: string;
  date: string; // ISO date
  tags: string[];
  tagsHy?: string[];
  tagsRu?: string[];
  metaDescription: string;
  metaDescriptionHy?: string;
  metaDescriptionRu?: string;
}

export interface CartItem {
  slug: string;
  name: string;
  priceAmd: number;
  image: string;
  quantity: number;
  sku: string;
}
