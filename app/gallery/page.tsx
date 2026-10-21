import Link from "next/link";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

const sortLabels = {
  newest: "Newest first",
  oldest: "Oldest first",
  filename: "Filename",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; favorite?: string; album?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const sort = params.sort ?? "newest";
  const favoriteOnly = params.favorite === "true";
  const query = (params.q ?? "").toLowerCase();
  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const categoryIds = new Set(
    categories.filter((item) => item.slug === category).map((item) => item.id),
  );

  const filtered = photos.filter((photo) => {
    const matchesCategory = category === "all" || photo.categoryIds.some((id) => categoryIds.has(id));
    const matchesFavorite = !favoriteOnly || photo.isFavorite;
    const matchesQuery =
      !query ||
      photo.filename.toLowerCase().includes(query) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      photo.categoryIds.some((id) => categories.some((categoryItem) => categoryItem.id === id && categoryItem.name.toLowerCase().includes(query)));

    return matchesCategory && matchesFavorite && matchesQuery;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "filename") return a.filename.localeCompare(b.filename);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-4 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Archive</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">All photos</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/gallery?category=${item.slug}`}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  category === item.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-border/80 bg-card/80 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(sortLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/gallery?category=${category}&sort=${key}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                sort === key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-muted/20 text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/favorites" className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
            Favorites only
          </Link>
        </div>
      </div>

      <GalleryGrid
        photos={sorted}
        emptyTitle="No images match this view"
        emptyDescription="Change the filters or browse another collection for more photos."
      />
    </div>
  );
}
