import { GalleryGrid } from "@/components/gallery-grid";
import { DatabaseError } from "@/components/database-error";
import { getPhotos, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  let photos: Photo[];
  try {
    photos = await getPhotos();
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const favorites = photos.filter((photo) => photo.isFavorite);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Saved</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">Favorites</h1>
      </div>

      <GalleryGrid
        photos={favorites}
        emptyTitle="No favorites yet"
        emptyDescription="Tap the heart on any image to pin it here for quick access."
      />
    </div>
  );
}
