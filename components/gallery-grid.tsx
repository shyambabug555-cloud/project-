"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Share2,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { LightboxViewer } from "@/components/lightbox-viewer";
import type { Photo } from "@/lib/queries";

type GalleryGridProps = {
  photos: Photo[];
  emptyTitle?: string;
  emptyDescription?: string;
  compact?: boolean;
};

export function GalleryGrid({
  photos,
  emptyTitle = "No photos found",
  emptyDescription = "Try another filter or add a few more images to this collection.",
  compact = false,
}: GalleryGridProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter out any locally deleted photos
  const activePhotos = useMemo(
    () => photos.filter((p) => !deletedIds.includes(p.id)),
    [photos, deletedIds],
  );

  const slides = useMemo(
    () =>
      activePhotos.map((photo) => ({
        src: photo.src,
        alt: photo.filename,
        width: photo.width,
        height: photo.height,
      })),
    [activePhotos],
  );

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    const nextVal = !currentFav;
    setFavoriteOverrides((prev) => ({ ...prev, [id]: nextVal }));
    try {
      const res = await fetch(`/api/photos/${id}/favorite`, { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        setFavoriteOverrides((prev) => ({ ...prev, [id]: currentFav }));
      }
    } catch {
      setFavoriteOverrides((prev) => ({ ...prev, [id]: currentFav }));
    }
  };

  const handleShare = async () => {
    const selectedPhotos = activePhotos.filter((p) => selectedIds.includes(p.id));
    const urls = selectedPhotos.map((p) => p.src).join("\n");
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(urls || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected photo(s)?`,
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/photos/${id}`, { method: "DELETE" }),
        ),
      );
      setDeletedIds((prev) => [...prev, ...selectedIds]);
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete photos", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!activePhotos.length) {
    return (
      <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-card/50 px-6 text-center">
        <div className="mb-4 rounded-full bg-accent p-3 text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{emptyTitle}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {selectedIds.length} photo(s) selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/albums"
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Add to album
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Link Copied!" : "Share Link"}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Deselect all
            </button>
          </div>
        </div>
      )}

      <div
        className={
          compact
            ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {activePhotos.map((photo, index) => {
          const selected = selectedIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-[0_10px_30px_rgba(15,15,15,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,15,15,0.08)]"
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setActiveIndex(index)}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={photo.thumbnailSrc}
                    alt={photo.filename}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3.5 opacity-100">
                <div className="flex flex-col gap-1 max-w-[70%]">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/80">
                    <span>{photo.createdAt?.slice(0, 10)}</span>
                    {photo.metadata?.location && (
                      <>
                        <span>•</span>
                        <span className="truncate">{photo.metadata.location}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-medium text-white truncate" title={photo.filename}>
                    {photo.filename}
                  </div>
                </div>

                {(() => {
                  const isFav =
                    favoriteOverrides[photo.id] !== undefined
                      ? favoriteOverrides[photo.id]
                      : photo.isFavorite;
                  return (
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(photo.id, isFav)}
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-110 active:scale-95 ${
                        isFav
                          ? "border-rose-200 bg-rose-500/90 text-white shadow-sm"
                          : "border-white/20 bg-black/30 text-white/90 hover:bg-black/50"
                      }`}
                      aria-label={isFav ? "Remove favorite" : "Add favorite"}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? "fill-current text-white" : ""}`} />
                    </button>
                  );
                })()}
              </div>

              <button
                type="button"
                aria-label={selected ? "Deselect photo" : "Select photo"}
                onClick={() => toggleSelected(photo.id)}
                className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/30 bg-black/25 text-white/80 backdrop-blur-sm hover:scale-105"
                }`}
              >
                {selected ? <Check className="h-4 w-4" /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
              </button>
            </div>
          );
        })}
      </div>

      {activeIndex >= 0 && (
        <LightboxViewer
          slides={slides}
          index={activeIndex}
          onClose={() => setActiveIndex(-1)}
        />
      )}
    </div>
  );
}
