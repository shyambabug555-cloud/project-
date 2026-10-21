import { NextResponse } from "next/server";
import { createPhoto, getPhotos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const favoriteOnly = searchParams.get("favorite") === "true";
    const album = searchParams.get("album");
    const q = searchParams.get("q")?.toLowerCase();

    let photos = await getPhotos();

    if (category && category !== "all") {
      photos = photos.filter((p) => p.categoryIds.includes(category));
    }
    if (favoriteOnly) {
      photos = photos.filter((p) => p.isFavorite);
    }
    if (album) {
      photos = photos.filter((p) => p.albumIds.includes(album));
    }
    if (q) {
      photos = photos.filter(
        (p) =>
          p.filename.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.metadata?.location?.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({ success: true, count: photos.length, data: photos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.filename || !body.src) {
      return NextResponse.json(
        { success: false, error: "filename and src are required" },
        { status: 400 },
      );
    }

    let src = body.src.trim();
    if (src.includes("unsplash.com/photos/")) {
      const parts = src.split("/photos/")[1]?.split("?")[0]?.split("/");
      const photoIdOrSlug = parts?.[0];
      if (photoIdOrSlug) {
        const idMatches = photoIdOrSlug.split("-");
        const photoId = idMatches[idMatches.length - 1];
        src = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1400&q=80`;
      }
    }

    const photo = await createPhoto({
      filename: body.filename,
      src,
      thumbnailSrc: body.thumbnailSrc || src,
      width: body.width || 1200,
      height: body.height || 800,
      fileSize: body.fileSize || "1.5 MB",
      mimeType: body.mimeType || "image/jpeg",
      tags: body.tags || [],
      categoryIds: body.categoryIds || [],
      albumIds: body.albumIds || [],
      dimensions: body.dimensions || `${body.width || 1200} × ${body.height || 800}`,
      camera: body.camera || null,
      location: body.location || null,
      lens: body.lens || null,
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
