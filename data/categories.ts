import type { CategoryInfo } from "@/types";

export const categories: CategoryInfo[] = [
  {
    slug: "educational",
    name: "Educational",
    shortDescription: "Toys that build skills through play — counting, sorting, language, and early STEM.",
    image: "/images/categories/educational.svg",
    subcategories: [
      { slug: "early-learning", name: "Early Learning" },
      { slug: "stem", name: "STEM & Building" },
      { slug: "language-literacy", name: "Language & Literacy" },
      { slug: "sensory-play", name: "Sensory Play" },
    ],
  },
  {
    slug: "wooden-toys",
    name: "Wooden Toys",
    shortDescription: "Sustainably sourced solid wood toys built to last through siblings and years.",
    image: "/images/categories/wooden-toys.svg",
    subcategories: [
      { slug: "stacking-sorting", name: "Stacking & Sorting" },
      { slug: "push-pull", name: "Push & Pull" },
      { slug: "pretend-play", name: "Pretend Play" },
      { slug: "musical", name: "Musical Toys" },
    ],
  },
  {
    slug: "outdoor-play",
    name: "Outdoor Play",
    shortDescription: "Active, imaginative play for the yard, park, or balcony.",
    image: "/images/categories/outdoor-play.svg",
    subcategories: [
      { slug: "ride-on", name: "Ride-On Toys" },
      { slug: "sand-water", name: "Sand & Water Play" },
      { slug: "active-play", name: "Active Play" },
    ],
  },
  {
    slug: "puzzles-games",
    name: "Puzzles & Games",
    shortDescription: "Chunky first puzzles and cooperative games for growing minds.",
    image: "/images/categories/puzzles-games.svg",
    subcategories: [
      { slug: "wooden-puzzles", name: "Wooden Puzzles" },
      { slug: "matching-memory", name: "Matching & Memory" },
      { slug: "first-games", name: "First Games" },
    ],
  },
  {
    slug: "baby-toddler",
    name: "Baby & Toddler",
    shortDescription: "Gentle, safe first toys for little hands, from newborn to age three.",
    image: "/images/categories/baby-toddler.svg",
    subcategories: [
      { slug: "rattles-teethers", name: "Rattles & Teethers" },
      { slug: "first-blocks", name: "First Blocks" },
      { slug: "soft-toys", name: "Soft & Plush Toys" },
      { slug: "bath-toys", name: "Bath Toys" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
