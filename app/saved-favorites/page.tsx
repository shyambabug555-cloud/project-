import { BookmarkCheck, Heart, Sparkles, MapPin, Camera } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPhotos, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SavedFavoritesPage() {
  let photos: Photo[];
  try {
    photos = await getPhotos();
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const favorites = photos.filter((p) => p.isFavorite);

  // Stats across saved favorites
  const locations = Array.from(
    new Set(favorites.map((p) => p.metadata?.location).filter(Boolean)),
  );
  const cameras = Array.from(
    new Set(favorites.map((p) => p.metadata?.camera).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <BookmarkCheck className="h-3.5 w-3.5 text-rose-500" />
              Curated Collection
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Saved Favorites Archive
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Your handpicked best moments, pinned for high-priority access and safekeeping.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3.5 py-2 rounded-full border border-rose-500/20 self-start sm:self-auto font-medium">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>{favorites.length} {favorites.length === 1 ? "saved memory" : "saved memories"}</span>
          </div>
        </div>

        {/* Collection Insights */}
        {favorites.length > 0 && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Priority Collection</span>
            </div>
            {locations.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Across {locations.length} {locations.length === 1 ? "location" : "locations"}</span>
              </div>
            )}
            {cameras.length > 0 && (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <span>Captured with {cameras.slice(0, 2).join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={favorites}
        emptyTitle="No saved favorites yet"
        emptyDescription="Click the heart icon on any photo to save it to your curated archive."
      />
    </div>
  );
}
