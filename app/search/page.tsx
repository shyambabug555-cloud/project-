import Link from "next/link";
import { Search as SearchIcon, X, Tag } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q ?? "").trim();
  const queryLower = query.toLowerCase();

  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const matches = photos.filter((photo) => {
    if (!queryLower) return true;

    const searchableText = [
      photo.filename,
      photo.tags.join(" "),
      photo.metadata?.location ?? "",
      photo.metadata?.camera ?? "",
      photo.metadata?.lens ?? "",
      categories
        .filter((category) => photo.categoryIds.includes(category.id))
        .map((category) => category.name)
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(queryLower);
  });

  const popularTags = [
    "portrait",
    "travel",
    "sunset",
    "beach",
    "nature",
    "work",
    "friends",
    "city",
    "document",
  ];

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <SearchIcon className="h-3.5 w-3.5 text-primary" />
              Archive Search
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {query ? `Results for “${query}”` : "Search Your Entire Photo Archive"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Search across filenames, tags, destinations, camera metadata, and categories.
            </p>
          </div>

          {/* In-page Search Form for Mobile & Quick Desktop Input */}
          <form method="GET" action="/search" className="relative w-full max-w-2xl">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search filenames, tags, cameras, locations..."
              className="h-12 w-full rounded-2xl border border-border/80 bg-muted/20 pl-11 pr-12 text-sm text-foreground outline-none focus:border-foreground/50 focus:ring-2 focus:ring-foreground/10 transition"
            />
            {query && (
              <Link
                href="/search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </Link>
            )}
          </form>

          {/* Quick Filter Tags */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              <span>Suggested Searches:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${term}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    queryLower === term
                      ? "bg-foreground text-background shadow-sm"
                      : "border border-border bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  #{term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs sm:text-sm text-muted-foreground">
        <span>
          Found <strong>{matches.length}</strong> {matches.length === 1 ? "match" : "matches"}
          {query ? ` for "${query}"` : " in photo library"}
        </span>
        {query && (
          <Link href="/search" className="hover:text-foreground underline underline-offset-4">
            Reset search
          </Link>
        )}
      </div>

      {/* Gallery Grid */}
      <GalleryGrid
        photos={matches}
        emptyTitle={`No results matching "${query}"`}
        emptyDescription="Try searching for another keyword, tag, location name, or photographer camera model."
      />
    </div>
  );
}
