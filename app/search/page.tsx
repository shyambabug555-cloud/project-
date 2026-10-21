import { GalleryGrid } from "@/components/gallery-grid";
import { DatabaseError } from "@/components/database-error";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q ?? "").trim().toLowerCase();
  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const matches = photos.filter((photo) => {
    if (!query) return true;

    const searchableText = [
      photo.filename,
      photo.tags.join(" "),
      categories
        .filter((category) => photo.categoryIds.includes(category.id))
        .map((category) => category.name)
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Search</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
          {query ? `Results for “${query}”` : "Explore your archive"}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "portrait",
          "travel",
          "document",
          "friends",
          "nature",
          "work",
        ].map((term) => (
          <a
            key={term}
            href={`/search?q=${term}`}
            className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {term}
          </a>
        ))}
      </div>

      <GalleryGrid
        photos={matches}
        emptyTitle="No matches found"
        emptyDescription="Try a filename, tag, album, or category such as travel, portrait, or work."
      />
    </div>
  );
}
