import Image from "next/image";
import Link from "next/link";

import { DatabaseError } from "@/components/database-error";
import { getAlbums, getPhotos, type Album, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  let albums: Album[];
  let photos: Photo[];
  try {
    [albums, photos] = await Promise.all([getAlbums(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Collections</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">Albums</h1>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {albums.map((album) => {
          const cover = photos.find((photo) => photo.id === album.coverPhotoId);

          return (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="group overflow-hidden rounded-[28px] border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {cover ? (
                <div className="relative h-56 sm:h-64 overflow-hidden rounded-[22px] bg-muted">
                  <Image
                    src={cover.thumbnailSrc}
                    alt={album.name}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!cover.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
              ) : (
                <div className="flex h-56 sm:h-64 items-center justify-center rounded-[22px] bg-muted text-sm text-muted-foreground">
                  No cover photo
                </div>
              )}
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-semibold text-foreground truncate">{album.name}</div>
                  <div className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {album.description}
                  </div>
                </div>
                {album.isFeatured && (
                  <span className="shrink-0 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-background font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-muted-foreground border-t border-border/60 pt-3">
                <span>{album.photoIds.length} {album.photoIds.length === 1 ? "image" : "images"}</span>
                <span>{new Date(album.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          );
        })}
      </div>
      {!albums.length && (
        <p className="rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">
          No albums have been created yet.
        </p>
      )}
    </div>
  );
}
