import { NextRequest, NextResponse } from "next/server";
import { getOrderWhatsappMessage, updateManagedOrder } from "@/lib/server/admin-order-tools";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const order = await updateManagedOrder(id, body);
    const whatsapp = body?.send_whatsapp ? await getOrderWhatsappMessage(order) : null;

    return NextResponse.json({
      order,
      whatsapp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order." },
      { status: 500 },
    );
  }
}
