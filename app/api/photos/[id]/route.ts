import { NextResponse } from "next/server";
import { deletePhoto, getPhotoById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const photo = await getPhotoById(id);

    if (!photo) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: photo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const success = await deletePhoto(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete photo" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Photo deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
