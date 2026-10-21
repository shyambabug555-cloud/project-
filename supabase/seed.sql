-- ============================================================
-- Seed Data — Run AFTER migration.sql in Supabase SQL Editor
-- ============================================================

-- Categories
insert into public.categories (id, name, slug, icon, description) values
  ('people',        'People',        'people',        'Users',              'Portraits and family moments.'),
  ('groups',        'Groups',        'groups',        'UsersRound',         'Trips, friends, and gatherings.'),
  ('documents',     'Documents',     'documents',     'FileText',           'Scans, receipts, and notes.'),
  ('travel',        'Travel',        'travel',        'MapPinned',          'Airports, city walks, and escapes.'),
  ('events',        'Events',        'events',        'PartyPopper',        'Celebrations and milestones.'),
  ('screenshots',   'Screenshots',   'screenshots',   'MonitorSmartphone',  'UI captures and references.'),
  ('nature',        'Nature',        'nature',        'Trees',              'Forests, beaches, and cliffs.'),
  ('work',          'Work',          'work',          'BriefcaseBusiness',  'Projects and everyday work.'),
  ('uncategorized', 'Uncategorized', 'uncategorized', 'ImageIcon',          'Everything else.')
on conflict (id) do nothing;

-- Persons
insert into public.persons (id, name) values
  ('maya', 'Maya'),
  ('joel', 'Joel'),
  ('nora', 'Nora')
on conflict (id) do nothing;

-- Photos
insert into public.photos (id, filename, src, thumbnail_src, width, height, file_size, mime_type, is_favorite, tags, dimensions, camera, location, lens, created_at, uploaded_at) values
  ('p-1',  'golden-hour-portrait.jpg',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    1200, 1600, '2.3 MB', 'image/jpeg', true,
    '{"portrait","sunset","warm tones"}', '1200 × 1600', 'Sony A7 III', 'Copenhagen', null,
    '2025-04-20T15:30:00Z', '2025-04-20T16:00:00Z'),

  ('p-2',  'window-light-portrait.jpg',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    1200, 1500, '2.7 MB', 'image/jpeg', false,
    '{"portrait","morning","soft light"}', '1200 × 1500', 'Canon R6', 'Lisbon', null,
    '2025-04-18T12:00:00Z', '2025-04-18T12:30:00Z'),

  ('p-3',  'cliff-path-sunset.jpg',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    1400, 900, '3.1 MB', 'image/jpeg', true,
    '{"travel","coast","sunset"}', '1400 × 900', null, 'Big Sur', null,
    '2025-03-13T18:15:00Z', '2025-03-14T09:00:00Z'),

  ('p-4',  'sea-stone-jetty.jpg',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    1200, 800, '2.2 MB', 'image/jpeg', false,
    '{"beach","travel","shore"}', '1200 × 800', null, 'Malibu', null,
    '2025-03-12T10:45:00Z', '2025-03-12T11:00:00Z'),

  ('p-5',  'friends-laughing.jpg',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    1400, 1050, '2.9 MB', 'image/jpeg', true,
    '{"friends","smile","weekend"}', '1400 × 1050', null, 'Santa Barbara', null,
    '2025-02-28T19:10:00Z', '2025-02-28T19:30:00Z'),

  ('p-6',  'sunset-dinner-table.jpg',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    1200, 900, '2.1 MB', 'image/jpeg', false,
    '{"dinner","event","friends"}', '1200 × 900', null, 'Hillside Villa', null,
    '2025-02-10T20:20:00Z', '2025-02-11T08:15:00Z'),

  ('p-7',  'studio-wall-shot.jpg',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    1200, 1500, '2.8 MB', 'image/jpeg', false,
    '{"studio","portrait","shadow"}', '1200 × 1500', 'Leica Q2', null, null,
    '2025-01-27T09:00:00Z', '2025-01-27T09:35:00Z'),

  ('p-8',  'city-railway-lines.jpg',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
    1200, 900, '3.0 MB', 'image/jpeg', true,
    '{"city","travel","rail"}', '1200 × 900', null, 'Rome', null,
    '2024-11-12T08:05:00Z', '2024-11-12T08:40:00Z'),

  ('p-9',  'subway-night-bloom.jpg',
    'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?auto=format&fit=crop&w=800&q=80',
    1200, 1500, '2.6 MB', 'image/jpeg', false,
    '{"night","subway","city"}', '1200 × 1500', null, 'New York', null,
    '2024-11-04T21:50:00Z', '2024-11-05T07:20:00Z'),

  ('p-10', 'morningside-boulevard.jpg',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80',
    1200, 800, '2.4 MB', 'image/jpeg', true,
    '{"street","travel","morning"}', '1200 × 800', null, 'Brooklyn', null,
    '2024-10-30T07:45:00Z', '2024-10-30T08:20:00Z'),

  ('p-11', 'laptop-layout-desk.jpg',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    1200, 900, '2.5 MB', 'image/jpeg', false,
    '{"workspace","work","desk"}', '1200 × 900', null, 'Remote office', null,
    '2024-10-03T12:00:00Z', '2024-10-03T12:55:00Z'),

  ('p-12', 'invoice-scan-page.jpg',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    1200, 1600, '845 KB', 'image/jpeg', false,
    '{"invoice","receipt","document"}', '1200 × 1600', null, 'Accounting', null,
    '2024-08-21T13:00:00Z', '2024-08-21T13:25:00Z'),

  ('p-13', 'planning-notes.jpg',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    1200, 900, '1.3 MB', 'image/jpeg', true,
    '{"notes","planning","document"}', '1200 × 900', null, 'Strategy board', null,
    '2024-07-18T08:30:00Z', '2024-07-18T08:55:00Z')
on conflict (id) do nothing;

-- Albums (must come after photos for cover_photo_id FK)
insert into public.albums (id, name, description, cover_photo_id, is_featured, created_at, updated_at) values
  ('coastal-weekend', 'Coastal Weekend',  'Late sun, breezy air, and the best of the shoreline.',       'p-3',  true,  '2024-06-15T09:00:00Z', '2024-06-18T12:00:00Z'),
  ('studio-moments',  'Studio Moments',   'A few portraits and candid frames from a relaxed shoot.',     'p-1',  false, '2025-02-02T09:30:00Z', '2025-02-12T18:00:00Z'),
  ('new-york-notes',  'New York Notes',   'Coffee, subway lights, and city texture.',                    'p-9',  true,  '2024-09-10T07:00:00Z', '2024-09-17T11:30:00Z'),
  ('project-files',   'Project Files',    'Design references, receipts, and important documents.',       'p-12', false, '2025-04-04T08:00:00Z', '2025-04-06T15:00:00Z')
on conflict (id) do nothing;

-- Photo ↔ Category links
insert into public.photo_categories (photo_id, category_id) values
  ('p-1',  'people'),
  ('p-2',  'people'),
  ('p-3',  'travel'), ('p-3', 'nature'),
  ('p-4',  'travel'), ('p-4', 'nature'),
  ('p-5',  'groups'), ('p-5', 'events'),
  ('p-6',  'events'),
  ('p-7',  'people'),
  ('p-8',  'travel'),
  ('p-9',  'travel'),
  ('p-10', 'travel'),
  ('p-11', 'work'),   ('p-11', 'screenshots'),
  ('p-12', 'documents'),
  ('p-13', 'documents')
on conflict (photo_id, category_id) do nothing;

-- Photo ↔ Album links
insert into public.photo_albums (photo_id, album_id) values
  ('p-3', 'coastal-weekend'), ('p-4', 'coastal-weekend'), ('p-5', 'coastal-weekend'), ('p-6', 'coastal-weekend'),
  ('p-1', 'studio-moments'),  ('p-2', 'studio-moments'),  ('p-8', 'studio-moments'),
  ('p-9', 'new-york-notes'),  ('p-10','new-york-notes'),  ('p-11','new-york-notes'),
  ('p-12','project-files'),   ('p-13','project-files')
on conflict (photo_id, album_id) do nothing;

-- Photo ↔ Person links
insert into public.photo_persons (photo_id, person_id) values
  ('p-1',  'maya'),
  ('p-2',  'maya'),
  ('p-3',  'joel'),
  ('p-5',  'maya'),
  ('p-7',  'joel'),
  ('p-8',  'joel'),
  ('p-9',  'joel'),
  ('p-10', 'nora'),
  ('p-11', 'nora')
on conflict (photo_id, person_id) do nothing;
