import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, MapPin, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatabaseError } from "@/components/database-error";
import {
  getAlbums,
  getCategories,
  getPhotos,
  getStats,
  type Album,
  type Category,
  type Photo,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let photos: Photo[];
  let albums: Album[];
  let categories: Category[];
  let stats: Awaited<ReturnType<typeof getStats>>;
  try {
    [photos, albums, categories, stats] = await Promise.all([
      getPhotos(),
      getAlbums(),
      getCategories(),
      getStats(),
    ]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  const featured = photos.slice(0, 3);
  const recent = photos.slice(0, 8);

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-border/80 bg-card/85 p-4 shadow-[0_24px_60px_rgba(17,17,17,0.04)] backdrop-blur md:p-6 xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr] xl:items-center">
          <div className="space-y-5 py-2 md:py-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Featured memories
            </div>
            {/* <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-5xl">
                Your visual archive, beautifully organized.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                A calm personal gallery for portraits, travel, projects, and everyday moments — designed to feel effortless and premium.
              </p>
            </div> */}
            <div className="flex flex-wrap gap-3">
              <Link href="/gallery">
                <Button className="gap-2 rounded-full bg-foreground text-background">
                  Browse gallery
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/albums">
                <Button variant="outline" className="rounded-full">
                  View albums
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Camera className="h-4 w-4" /> {stats.totalPhotos.toLocaleString()} photos</div>
              <div className="flex items-center gap-2"><Star className="h-4 w-4" /> {stats.totalFavorites.toLocaleString()} favorites</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {stats.totalLocations.toLocaleString()} locations</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {featured[0] ? (
              <div className="group relative overflow-hidden rounded-[30px] border border-border/80 bg-muted/30 sm:col-span-2">
                <div className="relative h-[320px] overflow-hidden md:h-[420px]">
                  <Image
                    src={featured[0].src}
                    alt={featured[0].filename}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 60vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!featured[0].src.includes("images.unsplash.com")}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-4 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/75">Featured</div>
                  <div className="mt-1 text-xl font-medium">{featured[0].filename}</div>
                </div>
              </div>
            ) : (
                <div className="flex min-h-64 items-center justify-center rounded-[30px] border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground sm:col-span-2">
                  Your Supabase photo library is empty. Add photos to get started.
                </div>
            )}
            {featured.slice(1).map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-[26px] border border-border/80 bg-muted/30">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.filename}
                    fill
                    sizes="(max-width: 768px) 100vw, 20vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.src.includes("images.unsplash.com")}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-white">
                  <div className="text-xs uppercase tracking-[0.16em] text-white/80">Story</div>
                  <div className="mt-1 text-sm font-medium">{photo.filename}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Recently added</h2>
          <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        {recent.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((photo) => (
              <Link key={photo.id} href="/gallery" className="group relative overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-sm transition hover:-translate-y-1">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={photo.thumbnailSrc}
                    alt={photo.filename}
                    fill
                    sizes="(max-width:768px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">{photo.createdAt.slice(0, 10)}</div>
                  <div className="mt-1 text-sm font-medium">{photo.filename}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">No photos have been added yet.</p>}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Albums & collections</h2>
          <Link href="/albums" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Open archive
          </Link>
        </div>
        {albums.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {albums.map((album) => {
              const cover = photos.find((photo) => photo.id === album.coverPhotoId);
              return (
                <Link key={album.id} href="/albums" className="group overflow-hidden rounded-[28px] border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-1">
                  {cover ? (
                    <div className="relative h-56 overflow-hidden rounded-[20px]">
                      <Image
                        src={cover.thumbnailSrc}
                        alt={album.name}
                        fill
                        sizes="(max-width:768px) 100vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        unoptimized={!cover.thumbnailSrc.includes("images.unsplash.com")}
                      />
                    </div>
                  ) : <div className="flex h-56 items-center justify-center rounded-[20px] bg-muted text-sm text-muted-foreground">No cover photo</div>}
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-foreground">{album.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{album.photoIds.length} photos</div>
                    </div>
                    <div className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{album.isFeatured ? "Featured" : "Saved"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className="rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">No albums have been created yet.</p>}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Quick categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/gallery?category=${category.slug}`}
              className="group rounded-[26px] border border-border/80 bg-card p-4 shadow-sm transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <span className="text-lg">{category.icon}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </div>
              <div className="mt-6 text-xl font-semibold text-foreground">{category.name}</div>
              <div className="mt-2 text-sm text-muted-foreground">{category.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
