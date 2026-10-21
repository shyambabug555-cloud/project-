import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    const category = await createCategory({
      name,
      slug: (body.slug as string)?.trim() || undefined,
      icon: (body.icon as string)?.trim() || undefined,
      description: (body.description as string)?.trim() || undefined,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

