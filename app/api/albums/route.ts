import { NextResponse } from "next/server";
import { createAlbum, getAlbums } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const albums = await getAlbums();
    return NextResponse.json({ success: true, count: albums.length, data: albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 },
      );
    }

    const album = await createAlbum({
      name: body.name,
      description: body.description || "",
      coverPhotoId: body.coverPhotoId,
      isFeatured: Boolean(body.isFeatured),
    });

    return NextResponse.json({ success: true, data: album }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
