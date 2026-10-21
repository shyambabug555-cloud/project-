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

export const categories: Category[] = [
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

export const persons: Person[] = [
  { id: "maya", name: "Maya", photoIds: ["p-1", "p-2", "p-5"] },
  { id: "joel", name: "Joel", photoIds: ["p-3", "p-7", "p-9"] },
  { id: "nora", name: "Nora", photoIds: ["p-10", "p-11", "p-12"] },
];

export const albums: Album[] = [
  {
    id: "coastal-weekend",
    name: "Coastal Weekend",
    description: "Late sun, breezy air, and the best of the shoreline.",
    coverPhotoId: "p-3",
    photoIds: ["p-3", "p-4", "p-5", "p-6"],
    createdAt: "2024-06-15T09:00:00.000Z",
    updatedAt: "2024-06-18T12:00:00.000Z",
    isFeatured: true,
  },
  {
    id: "studio-moments",
    name: "Studio Moments",
    description: "A few portraits and candid frames from a relaxed shoot.",
    coverPhotoId: "p-1",
    photoIds: ["p-1", "p-2", "p-8"],
    createdAt: "2025-02-02T09:30:00.000Z",
    updatedAt: "2025-02-12T18:00:00.000Z",
    isFeatured: false,
  },
  {
    id: "new-york-notes",
    name: "New York Notes",
    description: "Coffee, subway lights, and city texture.",
    coverPhotoId: "p-9",
    photoIds: ["p-9", "p-10", "p-11"],
    createdAt: "2024-09-10T07:00:00.000Z",
    updatedAt: "2024-09-17T11:30:00.000Z",
    isFeatured: true,
  },
  {
    id: "project-files",
    name: "Project Files",
    description: "Design references, receipts, and important documents.",
    coverPhotoId: "p-12",
    photoIds: ["p-12", "p-13"],
    createdAt: "2025-04-04T08:00:00.000Z",
    updatedAt: "2025-04-06T15:00:00.000Z",
    isFeatured: false,
  },
];

export const photos: Photo[] = [
  {
    id: "p-1",
    filename: "golden-hour-portrait.jpg",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1600,
    fileSize: "2.3 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-04-20T15:30:00.000Z",
    uploadedAt: "2025-04-20T16:00:00.000Z",
    isFavorite: true,
    tags: ["portrait", "sunset", "warm tones"],
    categoryIds: ["people"],
    albumIds: ["studio-moments"],
    peopleIds: ["maya"],
    metadata: { dimensions: "1200 × 1600", camera: "Sony A7 III", location: "Copenhagen" },
  },
  {
    id: "p-2",
    filename: "window-light-portrait.jpg",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    fileSize: "2.7 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-04-18T12:00:00.000Z",
    uploadedAt: "2025-04-18T12:30:00.000Z",
    isFavorite: false,
    tags: ["portrait", "morning", "soft light"],
    categoryIds: ["people"],
    albumIds: ["studio-moments"],
    peopleIds: ["maya"],
    metadata: { dimensions: "1200 × 1500", camera: "Canon R6", location: "Lisbon" },
  },
  {
    id: "p-3",
    filename: "cliff-path-sunset.jpg",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    width: 1400,
    height: 900,
    fileSize: "3.1 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-03-13T18:15:00.000Z",
    uploadedAt: "2025-03-14T09:00:00.000Z",
    isFavorite: true,
    tags: ["travel", "coast", "sunset"],
    categoryIds: ["travel", "nature"],
    albumIds: ["coastal-weekend"],
    peopleIds: ["joel"],
    metadata: { dimensions: "1400 × 900", location: "Big Sur" },
  },
  {
    id: "p-4",
    filename: "sea-stone-jetty.jpg",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 800,
    fileSize: "2.2 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-03-12T10:45:00.000Z",
    uploadedAt: "2025-03-12T11:00:00.000Z",
    isFavorite: false,
    tags: ["beach", "travel", "shore"],
    categoryIds: ["travel", "nature"],
    albumIds: ["coastal-weekend"],
    peopleIds: [],
    metadata: { dimensions: "1200 × 800", location: "Malibu" },
  },
  {
    id: "p-5",
    filename: "friends-laughing.jpg",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    width: 1400,
    height: 1050,
    fileSize: "2.9 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-02-28T19:10:00.000Z",
    uploadedAt: "2025-02-28T19:30:00.000Z",
    isFavorite: true,
    tags: ["friends", "smile", "weekend"],
    categoryIds: ["groups", "events"],
    albumIds: ["coastal-weekend"],
    peopleIds: ["maya"],
    metadata: { dimensions: "1400 × 1050", location: "Santa Barbara" },
  },
  {
    id: "p-6",
    filename: "sunset-dinner-table.jpg",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    fileSize: "2.1 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-02-10T20:20:00.000Z",
    uploadedAt: "2025-02-11T08:15:00.000Z",
    isFavorite: false,
    tags: ["dinner", "event", "friends"],
    categoryIds: ["events"],
    albumIds: ["coastal-weekend"],
    peopleIds: [],
    metadata: { dimensions: "1200 × 900", location: "Hillside Villa" },
  },
  {
    id: "p-7",
    filename: "studio-wall-shot.jpg",
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    fileSize: "2.8 MB",
    mimeType: "image/jpeg",
    createdAt: "2025-01-27T09:00:00.000Z",
    uploadedAt: "2025-01-27T09:35:00.000Z",
    isFavorite: false,
    tags: ["studio", "portrait", "shadow"],
    categoryIds: ["people"],
    albumIds: ["studio-moments"],
    peopleIds: ["joel"],
    metadata: { dimensions: "1200 × 1500", camera: "Leica Q2" },
  },
  {
    id: "p-8",
    filename: "city-railway-lines.jpg",
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    fileSize: "3.0 MB",
    mimeType: "image/jpeg",
    createdAt: "2024-11-12T08:05:00.000Z",
    uploadedAt: "2024-11-12T08:40:00.000Z",
    isFavorite: true,
    tags: ["city", "travel", "rail"],
    categoryIds: ["travel"],
    albumIds: ["new-york-notes"],
    peopleIds: ["joel"],
    metadata: { dimensions: "1200 × 900", location: "Rome" },
  },
  {
    id: "p-9",
    filename: "subway-night-bloom.jpg",
    src: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1500,
    fileSize: "2.6 MB",
    mimeType: "image/jpeg",
    createdAt: "2024-11-04T21:50:00.000Z",
    uploadedAt: "2024-11-05T07:20:00.000Z",
    isFavorite: false,
    tags: ["night", "subway", "city"],
    categoryIds: ["travel"],
    albumIds: ["new-york-notes"],
    peopleIds: ["joel"],
    metadata: { dimensions: "1200 × 1500", location: "New York" },
  },
  {
    id: "p-10",
    filename: "morningside-boulevard.jpg",
    src: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 800,
    fileSize: "2.4 MB",
    mimeType: "image/jpeg",
    createdAt: "2024-10-30T07:45:00.000Z",
    uploadedAt: "2024-10-30T08:20:00.000Z",
    isFavorite: true,
    tags: ["street", "travel", "morning"],
    categoryIds: ["travel"],
    albumIds: ["new-york-notes"],
    peopleIds: ["nora"],
    metadata: { dimensions: "1200 × 800", location: "Brooklyn" },
  },
  {
    id: "p-11",
    filename: "laptop-layout-desk.jpg",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    fileSize: "2.5 MB",
    mimeType: "image/jpeg",
    createdAt: "2024-10-03T12:00:00.000Z",
    uploadedAt: "2024-10-03T12:55:00.000Z",
    isFavorite: false,
    tags: ["workspace", "work", "desk"],
    categoryIds: ["work", "screenshots"],
    albumIds: [],
    peopleIds: ["nora"],
    metadata: { dimensions: "1200 × 900", location: "Remote office" },
  },
  {
    id: "p-12",
    filename: "invoice-scan-page.jpg",
    src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 1600,
    fileSize: "845 KB",
    mimeType: "image/jpeg",
    createdAt: "2024-08-21T13:00:00.000Z",
    uploadedAt: "2024-08-21T13:25:00.000Z",
    isFavorite: false,
    tags: ["invoice", "receipt", "document"],
    categoryIds: ["documents"],
    albumIds: ["project-files"],
    peopleIds: [],
    metadata: { dimensions: "1200 × 1600", location: "Accounting" },
  },
  {
    id: "p-13",
    filename: "planning-notes.jpg",
    src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    thumbnailSrc: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    width: 1200,
    height: 900,
    fileSize: "1.3 MB",
    mimeType: "image/jpeg",
    createdAt: "2024-07-18T08:30:00.000Z",
    uploadedAt: "2024-07-18T08:55:00.000Z",
    isFavorite: true,
    tags: ["notes", "planning", "document"],
    categoryIds: ["documents"],
    albumIds: ["project-files"],
    peopleIds: [],
    metadata: { dimensions: "1200 × 900", location: "Strategy board" },
  },
];

export function getCategoryById(categoryId: string) {
  return categories.find((category) => category.id === categoryId);
}

export function getAlbumById(albumId: string) {
  return albums.find((album) => album.id === albumId);
}

export function getPhotoById(photoId: string) {
  return photos.find((photo) => photo.id === photoId);
}
