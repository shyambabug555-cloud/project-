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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {albums.map((album) => {
          const cover = photos.find((photo) => photo.id === album.coverPhotoId);

          return (
            <Link
              key={album.id}
              href="/gallery"
              className="group overflow-hidden rounded-[28px] border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-1"
            >
              {cover ? (
                <div className="relative h-64 overflow-hidden rounded-[22px]">
                  <Image
                    src={cover.thumbnailSrc}
                    alt={album.name}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!cover.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
              ) : <div className="flex h-64 items-center justify-center rounded-[22px] bg-muted text-sm text-muted-foreground">No cover photo</div>}
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold text-foreground">{album.name}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{album.description}</div>
                </div>
                {album.isFeatured && (
                  <span className="rounded-full bg-foreground px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-background">
                    Featured
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{album.photoIds.length} images</span>
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
