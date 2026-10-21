import Link from "next/link";
import { FolderCog, Grid, Sparkles, FolderOpen } from "lucide-react";
import { DatabaseError } from "@/components/database-error";
import { CategoryManagerDialog } from "@/components/category-manager-dialog";
import { CategoryIcon } from "@/components/category-icon";
import { getCategories, getCategoryPhotoCounts, type Category } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let counts: Record<string, number> = {};

  try {
    const [cats, photoCounts] = await Promise.all([
      getCategories(),
      getCategoryPhotoCounts(),
    ]);
    categories = cats;
    counts = photoCounts;
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1.5">
              <FolderCog className="h-3.5 w-3.5 text-primary" />
              Archive Categories
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Categories & Collections
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Create, rename, update, or delete categories to organize your photo library
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CategoryManagerDialog
              initialCategories={categories}
              triggerButton={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-foreground/90 transition shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>+ Create / Manage Categories</span>
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const photoCount = counts[cat.id] ?? counts[cat.slug] ?? 0;

          return (
            <div
              key={cat.id}
              className="group relative flex flex-col justify-between rounded-[24px] border border-border/80 bg-card p-5 shadow-sm hover:shadow-md hover:border-foreground/30 transition-all hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-foreground overflow-hidden shadow-inner group-hover:scale-110 transition duration-300">
                    <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                  </span>

                  <span className="rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {photoCount} {photoCount === 1 ? "photo" : "photos"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {cat.name}
                    </h2>
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                    slug: {cat.slug}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                    {cat.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between gap-2">
                <Link
                  href={`/gallery?category=${cat.slug}`}
                  className="flex items-center gap-1.5 rounded-full bg-muted/40 hover:bg-muted text-foreground px-3.5 py-1.5 text-xs font-medium transition"
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Browse</span>
                </Link>

                <CategoryManagerDialog
                  initialCategories={categories}
                  triggerButton={
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline transition"
                    >
                      Edit / Delete
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-card/50 p-12 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No Categories Found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            You can create custom categories to organize your travel, family, and event photos.
          </p>
          <div className="mt-4">
            <CategoryManagerDialog initialCategories={categories} />
          </div>
        </div>
      )}
    </div>
  );
}
