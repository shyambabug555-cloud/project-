import Image from "next/image";
import Link from "next/link";
import { Users, User, Filter } from "lucide-react";

import { DatabaseError } from "@/components/database-error";
import { GalleryGrid } from "@/components/gallery-grid";
import { getPersons, getPhotos, type Person, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string }>;
}) {
  const { person: selectedPersonId } = await searchParams;

  let persons: Person[];
  let photos: Photo[];
  try {
    [persons, photos] = await Promise.all([getPersons(), getPhotos()]);
  } catch (error) {
    return <DatabaseError error={error} />;
  }

  // Find all photos associated with people (via photo_persons or people category or portrait tags)
  const allPeoplePhotos = photos.filter(
    (p) =>
      p.peopleIds.length > 0 ||
      p.tags.some((t) => ["portrait", "person", "friends", "people", "smile"].includes(t.toLowerCase())),
  );

  const selectedPerson = selectedPersonId
    ? persons.find((p) => p.id === selectedPersonId)
    : null;

  const displayedPhotos = selectedPerson
    ? photos.filter((p) => p.peopleIds.includes(selectedPerson.id))
    : allPeoplePhotos.length > 0
    ? allPeoplePhotos
    : photos;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-border/80 bg-card/80 p-5 sm:p-6 shadow-[0_20px_40px_rgba(15,15,15,0.04)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              People & Faces
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {selectedPerson ? `${selectedPerson.name}'s Photos` : "People & Portraits"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Face-grouped memories, family, friends, and portraits in your archive.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3.5 py-2 rounded-full border border-border/60 self-start sm:self-auto">
            <span>{persons.length} recognized {persons.length === 1 ? "person" : "people"}</span>
            <span>•</span>
            <span>{displayedPhotos.length} {displayedPhotos.length === 1 ? "photo" : "photos"}</span>
          </div>
        </div>
      </div>

      {/* Person Selection Bar / Cards */}
      {persons.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Person</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* All People Card */}
            <Link
              href="/people"
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                !selectedPersonId
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border/80 bg-card hover:bg-accent text-foreground"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-semibold text-xs ${
                  !selectedPersonId ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate">Everyone</div>
                <div className={`text-[11px] ${!selectedPersonId ? "text-background/80" : "text-muted-foreground"}`}>
                  {allPeoplePhotos.length} photos
                </div>
              </div>
            </Link>

            {/* Individual Person Cards */}
            {persons.map((person) => {
              const personPhotos = photos.filter((p) => p.peopleIds.includes(person.id));
              const avatarPhoto = personPhotos[0];
              const isSelected = selectedPersonId === person.id;

              return (
                <Link
                  key={person.id}
                  href={isSelected ? "/people" : `/people?person=${person.id}`}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                    isSelected
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/80 bg-card hover:bg-accent text-foreground"
                  }`}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {avatarPhoto ? (
                      <Image
                        src={avatarPhoto.thumbnailSrc}
                        alt={person.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                        unoptimized={!avatarPhoto.thumbnailSrc.includes("images.unsplash.com")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-xs uppercase">
                        {person.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">{person.name}</div>
                    <div className={`text-[11px] ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>
                      {personPhotos.length} {personPhotos.length === 1 ? "photo" : "photos"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center bg-card/40">
          <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-sm font-medium text-foreground">No face groups created yet</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Tag people when uploading photos or assign portraits to automatically group faces.
          </p>
        </div>
      )}

      {/* Gallery */}
      <GalleryGrid
        photos={displayedPhotos}
        emptyTitle={selectedPerson ? `No photos found for ${selectedPerson.name}` : "No portrait photos found"}
        emptyDescription="Upload photos or portraits tagged with people to organize them here."
      />
    </div>
  );
}
