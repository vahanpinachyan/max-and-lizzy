import "server-only";
import { instagramPosts as placeholderPosts, type InstagramPost } from "@/data/instagram-posts";

interface GraphMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface GraphMediaResponse {
  data: GraphMediaItem[];
}

export interface LiveInstagramPost extends InstagramPost {
  permalink: string;
}

// Falls back to the static placeholder feed (data/instagram-posts.ts) when
// INSTAGRAM_ACCESS_TOKEN/INSTAGRAM_USER_ID aren't set, so the section always
// renders something instead of erroring — same pattern as lib/translate.ts.
export async function getInstagramPosts(limit = 6): Promise<LiveInstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return placeholderPosts.map((p) => ({ ...p, permalink: "" }));
  }

  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
  const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&access_token=${token}`;

  try {
    // Revalidates hourly so new posts appear without a redeploy.
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`Instagram Graph API error: ${res.status} ${await res.text()}`);
      return placeholderPosts.map((p) => ({ ...p, permalink: "" }));
    }
    const json = (await res.json()) as GraphMediaResponse;

    return json.data
      .filter((item) => item.media_type !== "VIDEO" || item.thumbnail_url)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((item) => ({
        slug: item.id,
        image: item.media_type === "VIDEO" ? item.thumbnail_url! : item.media_url,
        caption: item.caption?.split("\n")[0]?.slice(0, 200) || "Max & Lizzy on Instagram",
        likes: item.like_count ?? 0,
        comments: item.comments_count ?? 0,
        permalink: item.permalink,
      }));
  } catch (err) {
    console.error("Instagram Graph API fetch failed:", err);
    return placeholderPosts.map((p) => ({ ...p, permalink: "" }));
  }
}
