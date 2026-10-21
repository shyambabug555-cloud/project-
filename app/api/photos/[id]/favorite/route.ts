import { NextResponse } from "next/server";
import { toggleFavorite } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updated = await toggleFavorite(id);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isFavorite: updated.isFavorite,
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
