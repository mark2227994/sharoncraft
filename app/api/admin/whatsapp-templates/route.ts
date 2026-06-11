import { NextRequest, NextResponse } from "next/server";
import { saveWhatsappTemplates, getWhatsappTemplates } from "@/lib/server/admin-order-tools";

export async function GET() {
  try {
    const templates = await getWhatsappTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch templates." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const templates = Array.isArray(body?.templates) ? body.templates : [];
    const saved = await saveWhatsappTemplates(templates);
    return NextResponse.json({ templates: saved });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save templates." },
      { status: 500 },
    );
  }
}
