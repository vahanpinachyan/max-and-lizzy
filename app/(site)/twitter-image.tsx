import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — Wooden & Eco-Friendly Toys`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f2e5d2 0%, #ddc4a0 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "#d97a4d",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 64, color: "#fbf6ee" }}>🧸</div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#3d2b1f" }}>{site.name}</div>
        <div style={{ fontSize: 32, color: "#7c4f2e", marginTop: 16 }}>
          Educational · Wooden · Eco-Friendly Toys
        </div>
      </div>
    ),
    { ...size }
  );
}
