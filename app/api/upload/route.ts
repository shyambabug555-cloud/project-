import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createPhoto, type Photo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ────────────────────────────────────────────────────────────────
    // 1. Handle multipart/form-data (Single or Multiple File Uploads)
    // ────────────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      // Support both single "file" and multi "files"
      const allFiles = [
        ...formData.getAll("files"),
        ...formData.getAll("file"),
      ].filter((item): item is File => item instanceof File && item.size > 0);

      const category = (formData.get("category") as string)?.trim() || "travel";
      const location = (formData.get("location") as string)?.trim() || null;
      const rawTags = (formData.get("tags") as string)?.trim() || "";
      const customFilename = (formData.get("filename") as string)?.trim();

      if (!allFiles.length) {
        return NextResponse.json(
          { success: false, error: "No photo files provided." },
          { status: 400 },
        );
      }

      const tags = rawTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Single file mode
      if (allFiles.length === 1) {
        const file = allFiles[0];
        const filename = customFilename || file.name || "uploaded-photo.jpg";

        // Check duplicate filename in database
        const { data: existing } = await supabase
          .from("photos")
          .select("id, filename")
          .ilike("filename", filename)
          .limit(1);

        if (existing && existing.length > 0) {
          return NextResponse.json(
            {
              success: false,
              isDuplicate: true,
              error: `Duplicate photo detected: "${filename}" is already in your album. Duplicate uploads are prevented.`,
            },
            { status: 409 },
          );
        }

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

        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(uploadData.path);
        const publicUrl = publicUrlData.publicUrl;

        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        const formattedSize = `${sizeInMb} MB`;

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

      // Multiple files batch mode
      const uploadedPhotos: Photo[] = [];
      const duplicates: string[] = [];
      const errors: string[] = [];

      for (const file of allFiles) {
        const filename = file.name || "uploaded-photo.jpg";

        // Check duplicate
        const { data: existing } = await supabase
          .from("photos")
          .select("id, filename")
          .ilike("filename", filename)
          .limit(1);

        if (existing && existing.length > 0) {
          duplicates.push(filename);
          continue;
        }

        try {
          const mimeType = file.type || "image/jpeg";
          const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("photos")
            .upload(safeName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (uploadError) {
            errors.push(`${filename}: ${uploadError.message}`);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("photos")
            .getPublicUrl(uploadData.path);
          const publicUrl = publicUrlData.publicUrl;

          const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
          const formattedSize = `${sizeInMb} MB`;

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

          if (photo) uploadedPhotos.push(photo);
        } catch (fileErr) {
          const msg = fileErr instanceof Error ? fileErr.message : "Unknown error";
          errors.push(`${filename}: ${msg}`);
        }
      }

      return NextResponse.json(
        {
          success: true,
          count: uploadedPhotos.length,
          data: uploadedPhotos,
          duplicates,
          errors,
          message: `Uploaded ${uploadedPhotos.length} photo(s). ${duplicates.length ? `${duplicates.length} duplicate(s) prevented.` : ""}`,
        },
        { status: 201 },
      );
    }

    // ────────────────────────────────────────────────────────────────
    // 2. Handle JSON payload (Single or Multiple Image URLs)
    // ────────────────────────────────────────────────────────────────
    const body = await request.json();

    // Check if multiple URLs were provided
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : typeof body.src === "string"
        ? body.src
            .split(/[\n,]+/)
            .map((u: string) => u.trim())
            .filter(Boolean)
        : [];

    if (!urls.length) {
      return NextResponse.json(
        { success: false, error: "Image URL or file is required." },
        { status: 400 },
      );
    }

    const category = (body.category as string)?.trim() || "travel";
    const location = (body.location as string)?.trim() || null;
    const baseFilename = (body.filename as string)?.trim();
    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

    // Helper to format Unsplash links
    const normalizeUrl = (raw: string) => {
      let srcUrl = raw.trim();
      if (srcUrl.includes("unsplash.com/photos/")) {
        const parts = srcUrl.split("/photos/")[1]?.split("?")[0]?.split("/");
        const photoIdOrSlug = parts?.[0];
        if (photoIdOrSlug) {
          const idMatches = photoIdOrSlug.split("-");
          const photoId = idMatches[idMatches.length - 1];
          srcUrl = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1400&q=80`;
        }
      }
      return srcUrl;
    };

    if (urls.length === 1) {
      const srcUrl = normalizeUrl(urls[0]);
      const filename = baseFilename || "untitled-photo.jpg";

      // Duplicate check: check src and filename
      const { data: existing } = await supabase
        .from("photos")
        .select("id, filename, src")
        .or(`src.eq.${srcUrl},filename.ilike.${filename}`)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            error: `Duplicate photo detected: An image with this URL or filename ("${filename}") already exists in your album.`,
          },
          { status: 409 },
        );
      }

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
    }

    // Multiple URLs batch
    const uploadedPhotos: Photo[] = [];
    const duplicates: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const srcUrl = normalizeUrl(urls[i]);
      const filename = baseFilename
        ? `${baseFilename}-${i + 1}.jpg`
        : `image-upload-${Date.now()}-${i + 1}.jpg`;

      // Check duplicate
      const { data: existing } = await supabase
        .from("photos")
        .select("id, filename, src")
        .or(`src.eq.${srcUrl},filename.ilike.${filename}`)
        .limit(1);

      if (existing && existing.length > 0) {
        duplicates.push(srcUrl);
        continue;
      }

      try {
        const photo = await createPhoto({
          filename,
          src: srcUrl,
          thumbnailSrc: srcUrl,
          width: 1200,
          height: 800,
          fileSize: "1.5 MB",
          mimeType: "image/jpeg",
          tags,
          categoryIds: category ? [category] : [],
          location: location || undefined,
        });

        if (photo) uploadedPhotos.push(photo);
      } catch (err) {
        console.error("Batch URL upload failed for item:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: uploadedPhotos.length,
        data: uploadedPhotos,
        duplicates,
        message: `Uploaded ${uploadedPhotos.length} photo(s). ${duplicates.length ? `${duplicates.length} duplicate(s) prevented.` : ""}`,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
