import { Clock, CalendarDays } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPhotos, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RecentlyAddedPage() {
  let photos: Photo[];
  try {
    photos = await getPhotos();
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  // Sort strictly by newest createdAt / uploadedAt timestamp first
  const sortedPhotos = [...photos].sort((a, b) => {
    const timeA = new Date(a.uploadedAt || a.createdAt).getTime();
    const timeB = new Date(b.uploadedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const latestPhoto = sortedPhotos[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Chronological Feed
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Recently Added Photos
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Your latest imports and uploads organized by upload timestamp.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3.5 py-2 rounded-full border border-border/60 self-start sm:self-auto">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{sortedPhotos.length} {sortedPhotos.length === 1 ? "photo" : "photos"}</span>
            {latestPhoto && (
              <>
                <span>•</span>
                <span>Latest: {new Date(latestPhoto.uploadedAt || latestPhoto.createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={sortedPhotos}
        emptyTitle="No photos uploaded yet"
        emptyDescription="Upload your first photos to see them appear chronologically in your feed."
      />
    </div>
  );
}
