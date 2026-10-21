import { Calendar, PartyPopper } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const eventCategory = categories.find((c) => c.slug === "events");
  const eventCategoryId = eventCategory?.id;

  const eventKeywords = [
    "event",
    "events",
    "party",
    "dinner",
    "gathering",
    "celebration",
    "wedding",
    "birthday",
    "weekend",
    "friends",
    "festival",
    "ceremony",
    "concert",
  ];

  const eventPhotos = photos.filter((p) => {
    const matchesCategory = eventCategoryId ? p.categoryIds.includes(eventCategoryId) : false;
    const matchesTag = p.tags.some((t) => eventKeywords.includes(t.toLowerCase()));
    const matchesName = eventKeywords.some((kw) => p.filename.toLowerCase().includes(kw));
    return matchesCategory || matchesTag || matchesName;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <PartyPopper className="h-3.5 w-3.5 text-primary" />
              Celebrations & Gatherings
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Events & Memories
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Parties, dinners, ceremonies, weekends with friends, and milestones.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3.5 py-2 rounded-full border border-border/60 self-start sm:self-auto">
            <Calendar className="h-3.5 w-3.5" />
            <span>{eventPhotos.length} {eventPhotos.length === 1 ? "event memory" : "event memories"}</span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={eventPhotos}
        emptyTitle="No event photos found"
        emptyDescription="Tag photos with 'event', 'dinner', or select the Events category to collect them here."
      />
    </div>
  );
}
