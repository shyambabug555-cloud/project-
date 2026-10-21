import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  MapPin,
  Sparkles,
  Star,
  Users,
  MapPinned,
  Trees,
  FileText,
  Briefcase,
  PartyPopper,
  Image as ImageIcon,
  Clock,
  FolderHeart,
} from "lucide-react";

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

const categoryRouteMap: Record<string, string> = {
  people: "/people",
  documents: "/documents",
  travel: "/travel",
  events: "/events",
  work: "/work",
  nature: "/nature",
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  people: Users,
  groups: Users,
  documents: FileText,
  travel: MapPinned,
  events: PartyPopper,
  nature: Trees,
  work: Briefcase,
};

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
    <div className="space-y-8 sm:space-y-10">
      {/* Featured Memories Hero */}
      <section className="rounded-[32px] border border-border/80 bg-card/85 p-4 sm:p-6 shadow-[0_24px_60px_rgba(17,17,17,0.04)] backdrop-blur xl:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr] xl:items-center">
          <div className="space-y-5 py-2 md:py-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Visual Archive Dashboard
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.06em] text-foreground">
                Your visual archive, beautifully organized.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg">
                A calm personal gallery for portraits, journeys, documents, and everyday memories.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/gallery">
                <Button className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium">
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
            <div className="flex flex-wrap gap-4 pt-3 text-xs sm:text-sm text-muted-foreground border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-foreground/70" />
                <span>{stats.totalPhotos.toLocaleString()} photos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500/30" />
                <span>{stats.totalFavorites.toLocaleString()} favorites</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{stats.totalLocations.toLocaleString()} locations</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {featured[0] ? (
              <div className="group relative overflow-hidden rounded-[26px] sm:rounded-[30px] border border-border/80 bg-muted/30 sm:col-span-2">
                <div className="relative h-[260px] sm:h-[340px] md:h-[400px] overflow-hidden">
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/75">Featured Memory</div>
                  <div className="mt-1 text-base sm:text-lg font-medium truncate">{featured[0].filename}</div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-[30px] border border-dashed border-border/80 bg-muted/20 text-sm text-muted-foreground sm:col-span-2">
                Your photo library is ready. Upload photos to get started.
              </div>
            )}
            {featured.slice(1).map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-border/80 bg-muted/30">
                <div className="relative h-44 sm:h-52 overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.filename}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.src.includes("images.unsplash.com")}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 text-white">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/80">Highlight</div>
                  <div className="mt-0.5 text-xs sm:text-sm font-medium truncate">{photo.filename}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Recently added
            </h2>
          </div>
          <Link
            href="/recently-added"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent.length ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {recent.map((photo) => (
              <Link
                key={photo.id}
                href="/recently-added"
                className="group relative overflow-hidden rounded-[20px] sm:rounded-[26px] border border-border/80 bg-card shadow-sm transition hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    src={photo.thumbnailSrc}
                    alt={photo.filename}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized={!photo.thumbnailSrc.includes("images.unsplash.com")}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-2.5 sm:p-3 text-white">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/70">
                    {photo.createdAt?.slice(0, 10)}
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm font-medium truncate">{photo.filename}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">
            No photos have been added yet.
          </p>
        )}
      </section>

      {/* Albums & Collections Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Albums & collections
            </h2>
          </div>
          <Link
            href="/albums"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
          >
            <span>Open archive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {albums.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {albums.map((album) => {
              const cover = photos.find((photo) => photo.id === album.coverPhotoId);
              return (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group overflow-hidden rounded-[26px] border border-border/80 bg-card p-3 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30"
                >
                  {cover ? (
                    <div className="relative h-48 sm:h-52 overflow-hidden rounded-[20px] bg-muted">
                      <Image
                        src={cover.thumbnailSrc}
                        alt={album.name}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        unoptimized={!cover.thumbnailSrc.includes("images.unsplash.com")}
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 sm:h-52 items-center justify-center rounded-[20px] bg-muted text-sm text-muted-foreground">
                      No cover photo
                    </div>
                  )}
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-foreground truncate">{album.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{album.photoIds.length} photos</div>
                    </div>
                    <div className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground shrink-0 font-medium">
                      {album.isFeatured ? "Featured" : "Album"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">
            No albums have been created yet.
          </p>
        )}
      </section>

      {/* Quick Categories Navigation */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Categories & Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((category) => {
            const destination = categoryRouteMap[category.slug] || `/gallery?category=${category.slug}`;
            const IconComponent = categoryIconMap[category.slug] || ImageIcon;

            return (
              <Link
                key={category.id}
                href={destination}
                className="group rounded-[22px] sm:rounded-[26px] border border-border/80 bg-card p-3.5 sm:p-4 shadow-sm transition hover:-translate-y-1 hover:border-foreground/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-muted text-foreground transition group-hover:bg-foreground group-hover:text-background">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
                </div>
                <div className="mt-4 sm:mt-5">
                  <div className="text-base sm:text-lg font-semibold text-foreground">{category.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{category.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
