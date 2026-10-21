import Link from "next/link";
import { MapPinned, Globe, Navigation, Compass } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TravelPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location: selectedLocation } = await searchParams;

  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const travelCategory = categories.find((c) => c.slug === "travel");
  const travelCategoryId = travelCategory?.id;

  const travelKeywords = ["travel", "trip", "coast", "city", "beach", "shore", "street", "vacation", "mountain", "rail", "subway", "explore"];

  // Photos that qualify as travel
  const allTravelPhotos = photos.filter((p) => {
    const matchesCategory = travelCategoryId ? p.categoryIds.includes(travelCategoryId) : false;
    const hasLocation = Boolean(p.metadata?.location && p.metadata.location.trim().length > 0);
    const matchesTag = p.tags.some((t) => travelKeywords.includes(t.toLowerCase()));
    return matchesCategory || hasLocation || matchesTag;
  });

  // Unique locations from travel photos
  const locations = Array.from(
    new Set(
      allTravelPhotos
        .map((p) => p.metadata?.location)
        .filter((loc): loc is string => Boolean(loc && loc.trim().length > 0)),
    ),
  ).sort();

  // Filter by selected location if any
  const displayedPhotos = selectedLocation
    ? allTravelPhotos.filter((p) => p.metadata?.location?.toLowerCase() === selectedLocation.toLowerCase())
    : allTravelPhotos;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <MapPinned className="h-3.5 w-3.5 text-primary" />
              Travel & Escapes
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {selectedLocation ? `Travel in ${selectedLocation}` : "Travel & Places"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Explore your journeys, scenic escapes, landmarks, and city walks.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3.5 py-2 rounded-full border border-border/60 self-start sm:self-auto">
            <Globe className="h-3.5 w-3.5" />
            <span>{locations.length} {locations.length === 1 ? "location" : "locations"}</span>
            <span>•</span>
            <span>{displayedPhotos.length} {displayedPhotos.length === 1 ? "photo" : "photos"}</span>
          </div>
        </div>

        {/* Location Filter Chips */}
        {locations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Compass className="h-3.5 w-3.5" />
              <span>Filter by Destination:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/travel"
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  !selectedLocation
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                All Destinations ({allTravelPhotos.length})
              </Link>
              {locations.map((loc) => {
                const count = allTravelPhotos.filter((p) => p.metadata?.location === loc).length;
                const isSelected = selectedLocation?.toLowerCase() === loc.toLowerCase();

                return (
                  <Link
                    key={loc}
                    href={isSelected ? "/travel" : `/travel?location=${encodeURIComponent(loc)}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-foreground text-background shadow-sm"
                        : "border border-border bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Navigation className="h-3 w-3" />
                    <span>{loc}</span>
                    <span className="opacity-70">({count})</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={displayedPhotos}
        emptyTitle={selectedLocation ? `No photos found in ${selectedLocation}` : "No travel photos found"}
        emptyDescription="Add photos with location metadata or travel category to explore them here."
      />
    </div>
  );
}
