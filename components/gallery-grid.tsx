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
  Download,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";

import { LightboxViewer } from "@/components/lightbox-viewer";
import { SlideshowModal } from "@/components/slideshow-modal";
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
  const [deletingSingleId, setDeletingSingleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Slideshow state
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);

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

  const handleDownloadPhoto = async (
    e: React.MouseEvent,
    src: string,
    filename: string,
    id: string,
  ) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      const res = await fetch(src, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.download = filename || "photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteSingle = async (
    e: React.MouseEvent,
    id: string,
    filename: string,
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Permanently delete "${filename}" from your photo archive?`);
    if (!confirmed) return;

    setDeletingSingleId(id);
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeletedIds((prev) => [...prev, id]);
        router.refresh();
      } else {
        alert(data.error || "Failed to delete photo");
      }
    } catch {
      alert("Failed to delete photo");
    } finally {
      setDeletingSingleId(null);
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
      {/* Top Toolbar: Photo count & Play Slideshow Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/70 p-2.5 sm:p-3.5 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{activePhotos.length}</span>{" "}
          {activePhotos.length === 1 ? "photo" : "photos"} in collection
        </div>

        <div className="flex items-center gap-2">
          {/* Play Slideshow Button */}
          <button
            type="button"
            onClick={() => {
              setSlideshowStartIndex(0);
              setSlideshowOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition shadow-md"
            title="Start Slideshow (Advances every 4 sec with animations)"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Play Slideshow</span>
            <span className="text-[10px] font-mono opacity-80 rounded bg-background/20 px-1 py-0.5">
              4s
            </span>
          </button>
        </div>
      </div>

      {/* Bulk selection action bar */}
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
              Delete Selected
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

      {/* Photos Grid */}
      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        }
      >
        {activePhotos.map((photo, index) => {
          const selected = selectedIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-[20px] sm:rounded-[26px] border border-border/80 bg-card shadow-[0_4px_20px_rgba(15,15,15,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,15,15,0.08)]"
            >
              {/* Photo click opens lightbox */}
              <button
                type="button"
                className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-foreground/30 rounded-[20px] sm:rounded-[26px]"
                onClick={() => setActiveIndex(index)}
                aria-label={`View full image for ${photo.filename}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={photo.thumbnailSrc}
                    alt={photo.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
              </button>

              {/* Bottom Card Overlay: Info & Action Buttons */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 sm:p-3 opacity-100">
                <div className="flex flex-col gap-0.5 sm:gap-1 max-w-[55%] min-w-0">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-white/80">
                    <span>{photo.createdAt?.slice(0, 10)}</span>
                    {photo.metadata?.location && (
                      <>
                        <span>•</span>
                        <span className="truncate hidden sm:inline">{photo.metadata.location}</span>
                      </>
                    )}
                  </div>
                  <div
                    className="text-xs sm:text-sm font-medium text-white truncate"
                    title={photo.filename}
                  >
                    {photo.filename}
                  </div>
                </div>

                {/* Card Action Buttons: Slideshow, Download, Like, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Quick Slideshow from this photo */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideshowStartIndex(index);
                      setSlideshowOpen(true);
                    }}
                    title="Start slideshow from this photo"
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 hover:bg-black/70 hover:scale-110 active:scale-95 transition shrink-0"
                    aria-label="Start slideshow"
                  >
                    <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current ml-0.5" />
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadPhoto(e, photo.src, photo.filename, photo.id)}
                    disabled={downloadingId === photo.id}
                    title="Download photo"
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 hover:bg-black/70 hover:scale-110 active:scale-95 transition shrink-0"
                    aria-label={`Download ${photo.filename}`}
                  >
                    {downloadingId === photo.id ? (
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-white" />
                    ) : (
                      <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                    )}
                  </button>

                  {/* Like / Favorite Button */}
                  {(() => {
                    const isFav =
                      favoriteOverrides[photo.id] !== undefined
                        ? favoriteOverrides[photo.id]
                        : photo.isFavorite;
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(photo.id, isFav);
                        }}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                        className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition hover:scale-110 active:scale-95 shrink-0 ${
                          isFav
                            ? "border-rose-200 bg-rose-500/90 text-white shadow-sm"
                            : "border-white/20 bg-black/40 text-white/90 hover:bg-black/70"
                        }`}
                        aria-label={isFav ? "Remove favorite" : "Add favorite"}
                      >
                        <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isFav ? "fill-current text-white" : ""}`} />
                      </button>
                    );
                  })()}

                  {/* Single Delete Photo Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSingle(e, photo.id, photo.filename)}
                    disabled={deletingSingleId === photo.id}
                    title="Delete photo permanently"
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 hover:bg-rose-600 hover:border-rose-400 transition hover:scale-110 active:scale-95 shrink-0"
                    aria-label={`Delete ${photo.filename}`}
                  >
                    {deletingSingleId === photo.id ? (
                      <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-white" />
                    ) : (
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Selection Checkbox */}
              <button
                type="button"
                aria-label={selected ? "Deselect photo" : "Select photo"}
                onClick={() => toggleSelected(photo.id)}
                className={`absolute left-2 top-2 sm:left-3 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-white/40 bg-black/35 text-white/90 backdrop-blur-sm hover:scale-105"
                }`}
              >
                {selected ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-current" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Lightbox Viewer */}
      {activeIndex >= 0 && (
        <LightboxViewer
          slides={slides}
          index={activeIndex}
          onClose={() => setActiveIndex(-1)}
        />
      )}

      {/* 4-Second Slideshow with Multiple Selectable Animations */}
      <SlideshowModal
        photos={activePhotos}
        startIndex={slideshowStartIndex}
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        onDeletePhoto={(id) => {
          setDeletedIds((prev) => [...prev, id]);
          router.refresh();
        }}
        onToggleFavorite={(id, currentFav) => handleToggleFavorite(id, currentFav)}
      />
    </div>
  );
}
