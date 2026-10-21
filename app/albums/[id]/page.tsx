import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderHeart, Image as ImageIcon } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getAlbumById, getPhotos, type Album, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let album: Album | null;
  let allPhotos: Photo[];
  try {
    [album, allPhotos] = await Promise.all([getAlbumById(id), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  if (!album) {
    notFound();
  }

  const albumPhotos = allPhotos.filter((p) => album.photoIds.includes(p.id));
  const cover = allPhotos.find((p) => p.id === album.coverPhotoId) || albumPhotos[0];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/albums"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all albums
        </Link>
      </div>

      {/* Album Banner */}
      <div className="relative overflow-hidden rounded-[30px] border border-border/80 bg-card/80 shadow-[0_20px_50px_rgba(15,15,15,0.04)] backdrop-blur">
        {cover && (
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
            <Image
              src={cover.src}
              alt={album.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized={!cover.src.includes("images.unsplash.com")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}

        <div className="relative p-5 sm:p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <FolderHeart className="h-3.5 w-3.5 text-primary" />
              Album Collection
            </div>
            {album.isFeatured && (
              <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-background">
                Featured Album
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.05em] text-foreground">
              {album.name}
            </h1>
            {album.description && (
              <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                {album.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-muted-foreground border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>{albumPhotos.length} {albumPhotos.length === 1 ? "photo" : "photos"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(album.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Album Photos Grid */}
      <GalleryGrid
        photos={albumPhotos}
        emptyTitle="This album is empty"
        emptyDescription="Add photos to this album by uploading or selecting photos from your gallery."
      />
    </div>
  );
}
