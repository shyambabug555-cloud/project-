import { FileText, FileSpreadsheet, ShieldCheck } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { UploadDialog } from "@/components/upload-dialog";
import { getCategories, getPhotos, type Category, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  let categories: Category[];
  let photos: Photo[];
  try {
    [categories, photos] = await Promise.all([getCategories(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const docCategory = categories.find((c) => c.slug === "documents");
  const docCategoryId = docCategory?.id;

  const docKeywords = ["document", "doc", "scan", "receipt", "note", "paper", "invoice", "bill", "certificate", "id", "card"];

  const docPhotos = photos.filter((p) => {
    const matchesCategory = docCategoryId ? p.categoryIds.includes(docCategoryId) : false;
    const matchesTag = p.tags.some((tag) => docKeywords.includes(tag.toLowerCase()));
    const matchesName = docKeywords.some((kw) => p.filename.toLowerCase().includes(kw));
    return matchesCategory || matchesTag || matchesName;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Documents & Records
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Documents & Scans
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Important files, receipts, physical documents, notes, and records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UploadDialog />
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-foreground/70" />
            <span>{docPhotos.length} {docPhotos.length === 1 ? "document item" : "document items"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted in Supabase</span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid
        photos={docPhotos}
        emptyTitle="No documents stored yet"
        emptyDescription="Upload your receipts, handwritten notes, work scans, and PDFs to keep them safely organized."
      />
    </div>
  );
}
