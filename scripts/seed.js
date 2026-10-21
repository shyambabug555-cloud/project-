/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");

// Read environment
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(url, key);

const categories = [
  { id: "people", name: "People", slug: "people", icon: "Users", description: "Portraits and family moments." },
  { id: "groups", name: "Groups", slug: "groups", icon: "UsersRound", description: "Trips, friends, and gatherings." },
  { id: "documents", name: "Documents", slug: "documents", icon: "FileText", description: "Scans, receipts, and notes." },
  { id: "travel", name: "Travel", slug: "travel", icon: "MapPinned", description: "Airports, city walks, and escapes." },
  { id: "events", name: "Events", slug: "events", icon: "PartyPopper", description: "Celebrations and milestones." },
  { id: "screenshots", name: "Screenshots", slug: "screenshots", icon: "MonitorSmartphone", description: "UI captures and references." },
  { id: "nature", name: "Nature", slug: "nature", icon: "Trees", description: "Forests, beaches, and cliffs." },
  { id: "work", name: "Work", slug: "work", icon: "BriefcaseBusiness", description: "Projects and everyday work." },
  { id: "uncategorized", name: "Uncategorized", slug: "uncategorized", icon: "ImageIcon", description: "Everything else." },
];

const persons = [
  { id: "maya", name: "Maya" },
  { id: "joel", name: "Joel" },
  { id: "nora", name: "Nora" },
];

const photos = [
  {
    id: "p-1",
    filename: "golden-hour-portrait.jpg",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1600,
    file_size: "2.3 MB",
    mime_type: "image/jpeg",
    created_at: "2025-04-20T15:30:00.000Z",
    uploaded_at: "2025-04-20T16:00:00.000Z",
    is_favorite: true,
    tags: ["portrait", "sunset", "warm tones"],
    dimensions: "1200 × 1600",
    camera: "Sony A7 III",
    location: "Copenhagen",
  },
  {
    id: "p-2",
    filename: "window-light-portrait.jpg",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    file_size: "2.7 MB",
    mime_type: "image/jpeg",
    created_at: "2025-04-18T12:00:00.000Z",
    uploaded_at: "2025-04-18T12:30:00.000Z",
    is_favorite: false,
    tags: ["portrait", "morning", "soft light"],
    dimensions: "1200 × 1500",
    camera: "Canon R6",
    location: "Lisbon",
  },
  {
    id: "p-3",
    filename: "cliff-path-sunset.jpg",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    width: 1400,
    height: 900,
    file_size: "3.1 MB",
    mime_type: "image/jpeg",
    created_at: "2025-03-13T18:15:00.000Z",
    uploaded_at: "2025-03-14T09:00:00.000Z",
    is_favorite: true,
    tags: ["travel", "coast", "sunset"],
    dimensions: "1400 × 900",
    location: "Big Sur",
  },
  {
    id: "p-4",
    filename: "sea-stone-jetty.jpg",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 800,
    file_size: "2.2 MB",
    mime_type: "image/jpeg",
    created_at: "2025-03-12T10:45:00.000Z",
    uploaded_at: "2025-03-12T11:00:00.000Z",
    is_favorite: false,
    tags: ["beach", "travel", "shore"],
    dimensions: "1200 × 800",
    location: "Malibu",
  },
  {
    id: "p-5",
    filename: "friends-laughing.jpg",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    width: 1400,
    height: 1050,
    file_size: "2.9 MB",
    mime_type: "image/jpeg",
    created_at: "2025-02-28T19:10:00.000Z",
    uploaded_at: "2025-02-28T19:30:00.000Z",
    is_favorite: true,
    tags: ["friends", "smile", "weekend"],
    dimensions: "1400 × 1050",
    location: "Santa Barbara",
  },
  {
    id: "p-6",
    filename: "sunset-dinner-table.jpg",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    file_size: "2.1 MB",
    mime_type: "image/jpeg",
    created_at: "2025-02-10T20:20:00.000Z",
    uploaded_at: "2025-02-11T08:15:00.000Z",
    is_favorite: false,
    tags: ["dinner", "event", "friends"],
    dimensions: "1200 × 900",
    location: "Hillside Villa",
  },
  {
    id: "p-7",
    filename: "studio-wall-shot.jpg",
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    file_size: "2.8 MB",
    mime_type: "image/jpeg",
    created_at: "2025-01-27T09:00:00.000Z",
    uploaded_at: "2025-01-27T09:35:00.000Z",
    is_favorite: false,
    tags: ["studio", "portrait", "shadow"],
    dimensions: "1200 × 1500",
    camera: "Leica Q2",
  },
  {
    id: "p-8",
    filename: "city-railway-lines.jpg",
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    file_size: "3.0 MB",
    mime_type: "image/jpeg",
    created_at: "2024-11-12T08:05:00.000Z",
    uploaded_at: "2024-11-12T08:40:00.000Z",
    is_favorite: true,
    tags: ["city", "travel", "rail"],
    dimensions: "1200 × 900",
    location: "Rome",
  },
  {
    id: "p-9",
    filename: "subway-night-bloom.jpg",
    src: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    file_size: "2.6 MB",
    mime_type: "image/jpeg",
    created_at: "2024-11-04T21:50:00.000Z",
    uploaded_at: "2024-11-05T07:20:00.000Z",
    is_favorite: false,
    tags: ["night", "subway", "city"],
    dimensions: "1200 × 1500",
    location: "New York",
  },
  {
    id: "p-10",
    filename: "morningside-boulevard.jpg",
    src: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 800,
    file_size: "2.4 MB",
    mime_type: "image/jpeg",
    created_at: "2024-10-30T07:45:00.000Z",
    uploaded_at: "2024-10-30T08:20:00.000Z",
    is_favorite: true,
    tags: ["street", "travel", "morning"],
    dimensions: "1200 × 800",
    location: "Brooklyn",
  },
  {
    id: "p-11",
    filename: "laptop-layout-desk.jpg",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    file_size: "2.5 MB",
    mime_type: "image/jpeg",
    created_at: "2024-10-03T12:00:00.000Z",
    uploaded_at: "2024-10-03T12:55:00.000Z",
    is_favorite: false,
    tags: ["workspace", "work", "desk"],
    dimensions: "1200 × 900",
    location: "Remote office",
  },
  {
    id: "p-12",
    filename: "invoice-scan-page.jpg",
    src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1600,
    file_size: "845 KB",
    mime_type: "image/jpeg",
    created_at: "2024-08-21T13:00:00.000Z",
    uploaded_at: "2024-08-21T13:25:00.000Z",
    is_favorite: false,
    tags: ["invoice", "receipt", "document"],
    dimensions: "1200 × 1600",
    location: "Accounting",
  },
  {
    id: "p-13",
    filename: "planning-notes.jpg",
    src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    thumbnail_src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    file_size: "1.3 MB",
    mime_type: "image/jpeg",
    created_at: "2024-07-18T08:30:00.000Z",
    uploaded_at: "2024-07-18T08:55:00.000Z",
    is_favorite: true,
    tags: ["notes", "planning", "document"],
    dimensions: "1200 × 900",
    location: "Strategy board",
  },
];

const albums = [
  {
    id: "coastal-weekend",
    name: "Coastal Weekend",
    description: "Late sun, breezy air, and the best of the shoreline.",
    cover_photo_id: "p-3",
    is_featured: true,
    created_at: "2024-06-15T09:00:00.000Z",
    updated_at: "2024-06-18T12:00:00.000Z",
  },
  {
    id: "studio-moments",
    name: "Studio Moments",
    description: "A few portraits and candid frames from a relaxed shoot.",
    cover_photo_id: "p-1",
    is_featured: false,
    created_at: "2025-02-02T09:30:00.000Z",
    updated_at: "2025-02-12T18:00:00.000Z",
  },
  {
    id: "new-york-notes",
    name: "New York Notes",
    description: "Coffee, subway lights, and city texture.",
    cover_photo_id: "p-9",
    is_featured: true,
    created_at: "2024-09-10T07:00:00.000Z",
    updated_at: "2024-09-17T11:30:00.000Z",
  },
  {
    id: "project-files",
    name: "Project Files",
    description: "Design references, receipts, and important documents.",
    cover_photo_id: "p-12",
    is_featured: false,
    created_at: "2025-04-04T08:00:00.000Z",
    updated_at: "2025-04-06T15:00:00.000Z",
  },
];

const photoCategories = [
  { photo_id: "p-1", category_id: "people" },
  { photo_id: "p-2", category_id: "people" },
  { photo_id: "p-3", category_id: "travel" },
  { photo_id: "p-3", category_id: "nature" },
  { photo_id: "p-4", category_id: "travel" },
  { photo_id: "p-4", category_id: "nature" },
  { photo_id: "p-5", category_id: "groups" },
  { photo_id: "p-5", category_id: "events" },
  { photo_id: "p-6", category_id: "events" },
  { photo_id: "p-7", category_id: "people" },
  { photo_id: "p-8", category_id: "travel" },
  { photo_id: "p-9", category_id: "travel" },
  { photo_id: "p-10", category_id: "travel" },
  { photo_id: "p-11", category_id: "work" },
  { photo_id: "p-11", category_id: "screenshots" },
  { photo_id: "p-12", category_id: "documents" },
  { photo_id: "p-13", category_id: "documents" },
];

const photoAlbums = [
  { photo_id: "p-3", album_id: "coastal-weekend" },
  { photo_id: "p-4", album_id: "coastal-weekend" },
  { photo_id: "p-5", album_id: "coastal-weekend" },
  { photo_id: "p-6", album_id: "coastal-weekend" },
  { photo_id: "p-1", album_id: "studio-moments" },
  { photo_id: "p-2", album_id: "studio-moments" },
  { photo_id: "p-8", album_id: "studio-moments" },
  { photo_id: "p-9", album_id: "new-york-notes" },
  { photo_id: "p-10", album_id: "new-york-notes" },
  { photo_id: "p-11", album_id: "new-york-notes" },
  { photo_id: "p-12", album_id: "project-files" },
  { photo_id: "p-13", album_id: "project-files" },
];

const photoPersons = [
  { photo_id: "p-1", person_id: "maya" },
  { photo_id: "p-2", person_id: "maya" },
  { photo_id: "p-3", person_id: "joel" },
  { photo_id: "p-5", person_id: "maya" },
  { photo_id: "p-7", person_id: "joel" },
  { photo_id: "p-8", person_id: "joel" },
  { photo_id: "p-9", person_id: "joel" },
  { photo_id: "p-10", person_id: "nora" },
  { photo_id: "p-11", person_id: "nora" },
];

async function seed() {
  console.log("Seeding Supabase database...");

  // 1. Categories
  const { error: catErr } = await supabase.from("categories").upsert(categories, { onConflict: "id" });
  if (catErr) console.error("Categories error:", catErr);
  else console.log(`✓ Inserted ${categories.length} categories`);

  // 2. Persons
  const { error: perErr } = await supabase.from("persons").upsert(persons, { onConflict: "id" });
  if (perErr) console.error("Persons error:", perErr);
  else console.log(`✓ Inserted ${persons.length} persons`);

  // 3. Photos
  const { error: phoErr } = await supabase.from("photos").upsert(photos, { onConflict: "id" });
  if (phoErr) console.error("Photos error:", phoErr);
  else console.log(`✓ Inserted ${photos.length} photos`);

  // 4. Albums (needs photos first for cover_photo_id FK)
  const { error: albErr } = await supabase.from("albums").upsert(albums, { onConflict: "id" });
  if (albErr) console.error("Albums error:", albErr);
  else console.log(`✓ Inserted ${albums.length} albums`);

  // 5. Junctions
  const { error: pcErr } = await supabase.from("photo_categories").upsert(photoCategories, { onConflict: "photo_id,category_id" });
  if (pcErr) console.error("PhotoCategories error:", pcErr);
  else console.log(`✓ Inserted ${photoCategories.length} category links`);

  const { error: paErr } = await supabase.from("photo_albums").upsert(photoAlbums, { onConflict: "photo_id,album_id" });
  if (paErr) console.error("PhotoAlbums error:", paErr);
  else console.log(`✓ Inserted ${photoAlbums.length} album links`);

  const { error: ppErr } = await supabase.from("photo_persons").upsert(photoPersons, { onConflict: "photo_id,person_id" });
  if (ppErr) console.error("PhotoPersons error:", ppErr);
  else console.log(`✓ Inserted ${photoPersons.length} person links`);

  console.log("🎉 Seeding complete successfully!");
}

seed().catch(console.error);
