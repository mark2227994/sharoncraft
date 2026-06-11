import { NextRequest, NextResponse } from "next/server";
import { createManagedOrder, getManagedOrders, getOrderWhatsappMessage } from "@/lib/server/admin-order-tools";

export async function GET() {
  try {
    const orders = await getManagedOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch orders." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await createManagedOrder(body);
    const whatsapp = await getOrderWhatsappMessage(order);

    return NextResponse.json({
      order,
      whatsapp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create order." },
      { status: 500 },
    );
  }
}
