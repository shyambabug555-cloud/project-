import { supabase } from "./supabase";

// ─── Types matching the frontend expectations ────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type Photo = {
  id: string;
  filename: string;
  src: string;
  thumbnailSrc: string;
  width: number;
  height: number;
  fileSize?: string;
  mimeType: string;
  createdAt: string;
  uploadedAt: string;
  isFavorite: boolean;
  tags: string[];
  categoryIds: string[];
  albumIds: string[];
  peopleIds: string[];
  metadata?: {
    dimensions?: string;
    camera?: string;
    location?: string;
    lens?: string;
  };
};

export type Album = {
  id: string;
  name: string;
  description: string;
  coverPhotoId: string;
  photoIds: string[];
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
};

export type Person = {
  id: string;
  name: string;
  photoIds: string[];
};

// ─── Row → Frontend shape mappers ────────────────────────────────────

function mapPhoto(
  row: Record<string, unknown>,
  categoryIds: string[] = [],
  albumIds: string[] = [],
  peopleIds: string[] = [],
): Photo {
  return {
    id: row.id as string,
    filename: row.filename as string,
    src: row.src as string,
    thumbnailSrc: row.thumbnail_src as string,
    width: row.width as number,
    height: row.height as number,
    fileSize: (row.file_size as string) ?? undefined,
    mimeType: row.mime_type as string,
    createdAt: row.created_at as string,
    uploadedAt: row.uploaded_at as string,
    isFavorite: row.is_favorite as boolean,
    tags: (row.tags as string[]) ?? [],
    categoryIds,
    albumIds,
    peopleIds,
    metadata: {
      dimensions: (row.dimensions as string) ?? undefined,
      camera: (row.camera as string) ?? undefined,
      location: (row.location as string) ?? undefined,
      lens: (row.lens as string) ?? undefined,
    },
  };
}

// ─── Categories ──────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    description: data.description,
  };
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}): Promise<Category> {
  const slug =
    input.slug?.trim() ||
    input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    `category-${Date.now()}`;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name.trim(),
      slug,
      icon: input.icon?.trim() || "📁",
      description: input.description?.trim() || "",
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    description: data.description,
  };
}

export async function updateCategory(
  id: string,
  input: {
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
  },
): Promise<Category | null> {
  const updatePayload: {
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
  } = {};
  if (input.name !== undefined) updatePayload.name = input.name.trim();
  if (input.slug !== undefined) updatePayload.slug = input.slug.trim();
  if (input.icon !== undefined) updatePayload.icon = input.icon.trim();
  if (input.description !== undefined) updatePayload.description = input.description.trim();

  const { data, error } = await supabase
    .from("categories")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    description: data.description,
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  throwIfError(error);
  return true;
}

// ─── Photos ──────────────────────────────────────────────────────────

export async function getPhotos(): Promise<Photo[]> {
  const { data: rows, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  const photoIds = rows.map((r) => r.id);

  // Batch-fetch all relations
  const [catRes, albRes, perRes] = await Promise.all([
    supabase.from("photo_categories").select("photo_id, category_id").in("photo_id", photoIds),
    supabase.from("photo_albums").select("photo_id, album_id").in("photo_id", photoIds),
    supabase.from("photo_persons").select("photo_id, person_id").in("photo_id", photoIds),
  ]);

  throwIfError(catRes.error);
  throwIfError(albRes.error);
  throwIfError(perRes.error);

  const catMap = groupBy(catRes.data ?? [], "photo_id", "category_id");
  const albMap = groupBy(albRes.data ?? [], "photo_id", "album_id");
  const perMap = groupBy(perRes.data ?? [], "photo_id", "person_id");

  return rows.map((row) =>
    mapPhoto(row, catMap[row.id] ?? [], albMap[row.id] ?? [], perMap[row.id] ?? []),
  );
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const { data: row, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  if (!row) return null;

  const [catRes, albRes, perRes] = await Promise.all([
    supabase.from("photo_categories").select("category_id").eq("photo_id", id),
    supabase.from("photo_albums").select("album_id").eq("photo_id", id),
    supabase.from("photo_persons").select("person_id").eq("photo_id", id),
  ]);

  throwIfError(catRes.error);
  throwIfError(albRes.error);
  throwIfError(perRes.error);

  return mapPhoto(
    row,
    (catRes.data ?? []).map((r) => r.category_id),
    (albRes.data ?? []).map((r) => r.album_id),
    (perRes.data ?? []).map((r) => r.person_id),
  );
}

export async function toggleFavorite(id: string): Promise<Photo | null> {
  // Get current state
  const { data: current, error: currentError } = await supabase
    .from("photos")
    .select("is_favorite")
    .eq("id", id)
    .single();
  if (currentError?.code === "PGRST116") return null;
  if (currentError) throw currentError;
  if (!current) return null;

  const { error } = await supabase
    .from("photos")
    .update({ is_favorite: !current.is_favorite })
    .eq("id", id);

  if (error) throw error;
  return getPhotoById(id);
}

export async function deletePhoto(id: string): Promise<boolean> {
  const { error } = await supabase.from("photos").delete().eq("id", id);
  throwIfError(error);
  return true;
}

export async function createPhoto(input: {
  filename: string;
  src: string;
  thumbnailSrc: string;
  width: number;
  height: number;
  fileSize?: string;
  mimeType: string;
  tags?: string[];
  categoryIds?: string[];
  albumIds?: string[];
  dimensions?: string;
  camera?: string;
  location?: string;
  lens?: string;
}): Promise<Photo | null> {
  const { data: row, error } = await supabase
    .from("photos")
    .insert({
      filename: input.filename,
      src: input.src,
      thumbnail_src: input.thumbnailSrc,
      width: input.width,
      height: input.height,
      file_size: input.fileSize ?? null,
      mime_type: input.mimeType,
      tags: input.tags ?? [],
      dimensions: input.dimensions ?? null,
      camera: input.camera ?? null,
      location: input.location ?? null,
      lens: input.lens ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  if (!row) throw new Error("Supabase did not return the newly created photo.");

  // Insert relations
  if (input.categoryIds?.length) {
    const { error: categoryError } = await supabase
      .from("photo_categories")
      .insert(input.categoryIds.map((cid) => ({ photo_id: row.id, category_id: cid })));
    throwIfError(categoryError);
  }
  if (input.albumIds?.length) {
    const { error: albumError } = await supabase
      .from("photo_albums")
      .insert(input.albumIds.map((aid) => ({ photo_id: row.id, album_id: aid })));
    throwIfError(albumError);
  }

  return getPhotoById(row.id);
}

// ─── Albums ──────────────────────────────────────────────────────────

export async function getAlbums(): Promise<Album[]> {
  const { data: rows, error } = await supabase
    .from("albums")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!rows?.length) return [];

  const albumIds = rows.map((r) => r.id);
  const { data: links, error: linksError } = await supabase
    .from("photo_albums")
    .select("photo_id, album_id")
    .in("album_id", albumIds);

  throwIfError(linksError);

  const albumPhotoMap = groupBy(links ?? [], "album_id", "photo_id");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    coverPhotoId: row.cover_photo_id ?? "",
    photoIds: albumPhotoMap[row.id] ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured,
  }));
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const { data: row, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  if (!row) return null;

  const { data: links, error: linksError } = await supabase
    .from("photo_albums")
    .select("photo_id")
    .eq("album_id", id);

  throwIfError(linksError);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    coverPhotoId: row.cover_photo_id ?? "",
    photoIds: (links ?? []).map((l) => l.photo_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured,
  };
}

export async function createAlbum(input: {
  name: string;
  description?: string;
  coverPhotoId?: string;
  isFeatured?: boolean;
}): Promise<Album | null> {
  const { data: row, error } = await supabase
    .from("albums")
    .insert({
      name: input.name,
      description: input.description ?? "",
      cover_photo_id: input.coverPhotoId ?? null,
      is_featured: input.isFeatured ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  if (!row) throw new Error("Supabase did not return the newly created album.");
  return getAlbumById(row.id);
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const { error } = await supabase.from("albums").delete().eq("id", id);
  throwIfError(error);
  return true;
}

export async function addPhotosToAlbum(albumId: string, photoIds: string[]): Promise<boolean> {
  const { error } = await supabase
    .from("photo_albums")
    .upsert(photoIds.map((pid) => ({ photo_id: pid, album_id: albumId })));

  throwIfError(error);

  const { error: updateError } = await supabase
    .from("albums")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", albumId);
  throwIfError(updateError);
  return true;
}

export async function removePhotoFromAlbum(albumId: string, photoId: string): Promise<boolean> {
  const { error } = await supabase
    .from("photo_albums")
    .delete()
    .eq("album_id", albumId)
    .eq("photo_id", photoId);

  throwIfError(error);
  return true;
}

// ─── Persons ─────────────────────────────────────────────────────────

export async function getPersons(): Promise<Person[]> {
  const { data: rows, error } = await supabase
    .from("persons")
    .select("*")
    .order("name");

  if (error) throw error;
  if (!rows?.length) return [];

  const personIds = rows.map((r) => r.id);
  const { data: links, error: linksError } = await supabase
    .from("photo_persons")
    .select("photo_id, person_id")
    .in("person_id", personIds);

  throwIfError(linksError);

  const personPhotoMap = groupBy(links ?? [], "person_id", "photo_id");

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    photoIds: personPhotoMap[row.id] ?? [],
  }));
}

// ─── Stats ───────────────────────────────────────────────────────────

export async function getStats() {
  const [photoRes, favRes, locRes] = await Promise.all([
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("is_favorite", true),
    supabase.from("photos").select("location").not("location", "is", null),
  ]);

  throwIfError(photoRes.error);
  throwIfError(favRes.error);
  throwIfError(locRes.error);

  const uniqueLocations = new Set((locRes.data ?? []).map((r) => r.location).filter(Boolean));

  return {
    totalPhotos: photoRes.count ?? 0,
    totalFavorites: favRes.count ?? 0,
    totalLocations: uniqueLocations.size,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function throwIfError(error: { message: string } | null): void {
  if (error) throw error;
}

function groupBy(
  rows: Record<string, string>[],
  keyField: string,
  valueField: string,
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const row of rows) {
    const key = row[keyField];
    if (!map[key]) map[key] = [];
    map[key].push(row[valueField]);
  }
  return map;
}
