/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key);

async function runTests() {
  console.log("==================================================");
  console.log("🔍 STARTING FULL BACKEND & SUPABASE DATABASE AUDIT");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. Check direct database tables
  console.log("\n--- 1. DIRECT SUPABASE DATABASE TABLES TEST ---");
  const tables = ["categories", "photos", "albums", "persons", "photo_categories", "photo_albums", "photo_persons"];
  for (const t of tables) {
    const { error, count } = await supabase.from(t).select("*", { count: "exact" });
    assert(`Table '${t}' exists & accessible`, !error, error ? error.message : `(${count} rows)`);
  }

  // 2. Check Next.js API Endpoints
  console.log("\n--- 2. NEXT.JS BACKEND REST API ENDPOINTS TEST ---");
  const baseUrl = "http://localhost:3000";

  // 2.1 GET /api/categories
  try {
    const res = await fetch(`${baseUrl}/api/categories`);
    const json = await res.json();
    assert("GET /api/categories returns 200", res.status === 200);
    assert("Categories returned with count > 0", json.success && json.count > 0, `(${json.count} categories)`);
  } catch (err) {
    assert("GET /api/categories", false, err.message);
  }

  // 2.2 GET /api/albums
  try {
    const res = await fetch(`${baseUrl}/api/albums`);
    const json = await res.json();
    assert("GET /api/albums returns 200", res.status === 200);
    assert("Albums returned with count > 0", json.success && json.count > 0, `(${json.count} albums)`);
  } catch (err) {
    assert("GET /api/albums", false, err.message);
  }

  // 2.3 GET /api/photos
  try {
    const res = await fetch(`${baseUrl}/api/photos`);
    const json = await res.json();
    assert("GET /api/photos returns 200", res.status === 200);
    assert("Photos returned with count > 0", json.success && json.count > 0, `(${json.count} photos)`);
  } catch (err) {
    assert("GET /api/photos", false, err.message);
  }

  // 3. Complete CRUD cycle test via API
  console.log("\n--- 3. FULL CRUD TEST (INSERT -> READ -> TOGGLE FAVORITE -> DELETE) ---");
  let testPhotoId = null;

  // 3.1 CREATE (POST /api/photos)
  try {
    const testPayload = {
      filename: "test-automated-photo.jpg",
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      thumbnailSrc: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      width: 1200,
      height: 800,
      fileSize: "1.8 MB",
      categoryIds: ["travel"],
      tags: ["test", "verification"],
      location: "Yosemite National Park",
    };

    const res = await fetch(`${baseUrl}/api/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });
    const json = await res.json();

    assert("POST /api/photos (Create in Supabase)", res.status === 201 && json.success, `ID: ${json.data?.id}`);
    testPhotoId = json.data?.id;
  } catch (err) {
    assert("POST /api/photos", false, err.message);
  }

  // 3.2 READ (GET /api/photos/[id])
  if (testPhotoId) {
    try {
      const res = await fetch(`${baseUrl}/api/photos/${testPhotoId}`);
      const json = await res.json();
      assert("GET /api/photos/[id] (Verify Created in Supabase)", res.status === 200 && json.data?.filename === "test-automated-photo.jpg");
    } catch (err) {
      assert("GET /api/photos/[id]", false, err.message);
    }

    // 3.3 TOGGLE FAVORITE (POST /api/photos/[id]/favorite)
    try {
      const res = await fetch(`${baseUrl}/api/photos/${testPhotoId}/favorite`, { method: "POST" });
      const json = await res.json();
      assert("POST /api/photos/[id]/favorite (Toggle favorite state)", res.status === 200 && json.isFavorite === true);
    } catch (err) {
      assert("POST /api/photos/[id]/favorite", false, err.message);
    }

    // 3.4 DELETE (DELETE /api/photos/[id])
    try {
      const res = await fetch(`${baseUrl}/api/photos/${testPhotoId}`, { method: "DELETE" });
      const json = await res.json();
      assert("DELETE /api/photos/[id] (Clean up from Supabase)", res.status === 200 && json.success);
    } catch (err) {
      assert("DELETE /api/photos/[id]", false, err.message);
    }

    // Verify deletion
    try {
      const res = await fetch(`${baseUrl}/api/photos/${testPhotoId}`);
      assert("Verify photo deleted (404 Not Found)", res.status === 404);
    } catch (err) {
      assert("Verify photo deleted", false, err.message);
    }
  }

  // 4. Test Frontend Server Pages
  console.log("\n--- 4. FRONTEND APPLICATION PAGES TEST ---");
  const pages = ["/", "/gallery", "/albums", "/favorites", "/search", "/gallery?category=travel"];
  for (const p of pages) {
    try {
      const res = await fetch(`${baseUrl}${p}`);
      assert(`Page '${p}' renders successfully`, res.status === 200, `(Status ${res.status})`);
    } catch (err) {
      assert(`Page '${p}'`, false, err.message);
    }
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
