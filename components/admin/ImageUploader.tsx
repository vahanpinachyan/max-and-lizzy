"use client";

import { useRef, useState } from "react";

export interface UploaderImage {
  src: string;
  alt: string;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Upload failed.");
  return body.url as string;
}

export function ImageUploader({ initial }: { initial: UploaderImage[] }) {
  const [images, setImages] = useState<UploaderImage[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadFile(file);
        setImages((prev) => [...prev, { src: url, alt: "" }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function updateAlt(index: number, alt: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function removeAt(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.src + i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDragOverIndex(null)}
              className={`group relative cursor-move rounded-xl border bg-white p-2 transition-colors ${
                dragOverIndex === i ? "border-terracotta" : "border-tan"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-beige">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-espresso/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-espresso/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
              <input
                value={img.alt}
                onChange={(e) => updateAlt(i, e.target.value)}
                placeholder="Alt text"
                className="mt-2 w-full rounded-lg border border-tan bg-white px-2 py-1 text-xs focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading > 0}
          className="rounded-full border border-wood/40 bg-wood/10 px-4 py-1.5 text-xs font-semibold text-wood-dark hover:bg-wood/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading > 0 ? `Uploading ${uploading}…` : "+ Add photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {images.length > 1 && <p className="text-xs text-espresso/60">Drag photos to reorder. The first photo is the main image.</p>}
      {error && <p className="text-xs text-terracotta-dark">{error}</p>}
    </div>
  );
}
