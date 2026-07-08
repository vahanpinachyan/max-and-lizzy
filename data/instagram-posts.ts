export interface InstagramPost {
  slug: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
}

// Placeholder feed. Replace with a real Instagram Graph API feed or an
// embed widget (see README "Instagram feed" section) once the business
// account is connected.
export const instagramPosts: InstagramPost[] = [
  { slug: "post-1", image: "/images/instagram/post-1.svg", caption: "Stacking arches in the shop window 🌈", likes: 128, comments: 6 },
  { slug: "post-2", image: "/images/instagram/post-2.svg", caption: "New wooden blocks just arrived!", likes: 94, comments: 3 },
  { slug: "post-3", image: "/images/instagram/post-3.svg", caption: "A little customer testing bikes", likes: 211, comments: 14 },
  { slug: "post-4", image: "/images/instagram/post-4.svg", caption: "Puzzle table on a Saturday morning", likes: 76, comments: 2 },
  { slug: "post-5", image: "/images/instagram/post-5.svg", caption: "Behind the scenes: sanding down edges", likes: 143, comments: 9 },
  { slug: "post-6", image: "/images/instagram/post-6.svg", caption: "Weekend market pop-up stand", likes: 89, comments: 5 },
];
