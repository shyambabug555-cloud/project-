import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createPhoto } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Handle multipart/form-data (File upload from device/gallery)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customFilename = (formData.get("filename") as string)?.trim();
      const category = (formData.get("category") as string)?.trim() || "travel";
      const location = (formData.get("location") as string)?.trim() || null;
      const rawTags = (formData.get("tags") as string)?.trim() || "";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No photo file provided." },
          { status: 400 },
        );
      }

      const filename = customFilename || file.name || "uploaded-photo.jpg";
      const mimeType = file.type || "image/jpeg";
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Supabase Storage bucket 'photos'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(safeName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: `Storage upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(uploadData.path);

      const publicUrl = publicUrlData.publicUrl;

      // Format file size
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = `${sizeInMb} MB`;

      const tags = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Create photo record in database
      const photo = await createPhoto({
        filename,
        src: publicUrl,
        thumbnailSrc: publicUrl,
        width: 1200,
        height: 800,
        fileSize: formattedSize,
        mimeType,
        tags,
        categoryIds: category ? [category] : [],
        location: location || undefined,
      });

      return NextResponse.json({ success: true, data: photo }, { status: 201 });
    }

    // 2. Handle JSON payload (Direct URL submission)
    const body = await request.json();
    let srcUrl = (body.src as string)?.trim();

    if (!srcUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL or file is required." },
        { status: 400 },
      );
    }

    // If user pasted an Unsplash webpage URL (e.g., https://unsplash.com/photos/ID or https://unsplash.com/photos/slug-ID)
    // Convert to direct image URL if needed
    if (srcUrl.includes("unsplash.com/photos/")) {
      const parts = srcUrl.split("/photos/")[1]?.split("?")[0]?.split("/");
      const photoIdOrSlug = parts?.[0];
      if (photoIdOrSlug) {
        const idMatches = photoIdOrSlug.split("-");
        const photoId = idMatches[idMatches.length - 1];
        srcUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1400&q=80`;
      }
    }

    const filename = (body.filename as string)?.trim() || "untitled-photo.jpg";
    const category = (body.category as string)?.trim() || "travel";
    const location = (body.location as string)?.trim() || null;
    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

    const photo = await createPhoto({
      filename,
      src: srcUrl,
      thumbnailSrc: srcUrl,
      width: body.width || 1200,
      height: body.height || 800,
      fileSize: body.fileSize || "1.5 MB",
      mimeType: body.mimeType || "image/jpeg",
      tags,
      categoryIds: category ? [category] : [],
      location: location || undefined,
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
