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
  const dragCounter = useRef(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

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

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
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

  // Dropzone handlers for dragging photo files in from outside the browser
  // (Explorer/Finder), separate from the tile drag above (which reorders
  // existing photos and carries no Files, so it's ignored here).
  function handleZoneDragEnter(e: React.DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounter.current += 1;
    setIsDraggingFile(true);
  }

  function handleZoneDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleZoneDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDraggingFile(false);
  }

  function handleZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDraggingFile(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
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
              onDrop={(e) => handleDrop(e, i)}
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

      <div
        onDragEnter={handleZoneDragEnter}
        onDragOver={handleZoneDragOver}
        onDragLeave={handleZoneDragLeave}
        onDrop={handleZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDraggingFile ? "border-terracotta bg-terracotta/5" : "border-tan hover:border-wood/50"
        }`}
      >
        <span className="text-sm font-semibold text-wood-dark">
          {uploading > 0 ? `Uploading ${uploading}…` : isDraggingFile ? "Drop to upload" : "+ Add photos"}
        </span>
        <span className="text-xs text-espresso/60">Drag and drop photos here, or click to browse</span>
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
