import { Briefcase, Laptop } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const workCategory = categories.find((c) => c.slug === "work");
  const workCategoryId = workCategory?.id;

  const workKeywords = [
    "work",
    "project",
    "office",
    "desk",
    "laptop",
    "workspace",
    "studio",
    "computer",
    "setup",
    "design",
    "creative",
    "tech",
    "screens",
  ];

  const workPhotos = photos.filter((p) => {
    const matchesCategory = workCategoryId ? p.categoryIds.includes(workCategoryId) : false;
    const matchesTag = p.tags.some((t) => workKeywords.includes(t.toLowerCase()));
    const matchesName = workKeywords.some((kw) => p.filename.toLowerCase().includes(kw));
    return matchesCategory || matchesTag || matchesName;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Work & Productivity
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Work & Projects
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Desk setups, design iterations, workspace photos, and work-related assets.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3.5 py-2 rounded-full border border-border/60 self-start sm:self-auto">
            <Laptop className="h-3.5 w-3.5" />
            <span>{workPhotos.length} {workPhotos.length === 1 ? "work item" : "work items"}</span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={workPhotos}
        emptyTitle="No work photos found"
        emptyDescription="Tag photos with 'work', 'desk', or 'project' to organize professional assets here."
      />
    </div>
  );
}
