import Link from "next/link";

type OrderItem = {
  name?: string;
  quantity?: number;
};

type OrderRowProps = {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
};

const statusClass: Record<string, string> = {
  pending: "bg-[#fef3cd] text-[#856404]",
  processing: "bg-[#cfe2ff] text-[#084298]",
  shipped: "bg-[#e8d5ff] text-[#5b21b6]",
  delivered: "bg-[#d1f0da] text-[#166534]",
  cancelled: "bg-[#fde8e8] text-[#C0392B]",
};

function buildWhatsappMessage(customerName: string, items: OrderItem[], totalAmount: number) {
  const itemLines = items.length
    ? items.map((item) => `- ${item.name || "Item"} x${item.quantity || 1}`).join("\n")
    : "- Your SharonCraft piece";

  return [
    `Hi ${customerName} 👋 Thank you for your SharonCraft order!`,
    "",
    "Your order:",
    itemLines,
    "",
    `Total: KES ${Number(totalAmount || 0).toLocaleString("en-KE")}`,
    "",
    "Kindly confirm your delivery address and preferred payment method (M-Pesa / Cash on Delivery).",
    "",
    "We will process your order within 24 hours. 🙏",
    "",
    "— SharonCraft",
  ].join("\n");
}

export default function OrderRow({
  id,
  customerName,
  customerPhone,
  items,
  totalAmount,
  orderStatus,
}: OrderRowProps) {
  const safePhone = String(customerPhone || "").replace(/\D/g, "");
  const whatsappHref = safePhone
    ? `https://wa.me/${safePhone}?text=${encodeURIComponent(buildWhatsappMessage(customerName, items, totalAmount))}`
    : "#";

  return (
    <tr className="border-b border-[#f0f0f0] text-[11px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]">
      <td className="px-4 py-[10px] text-[#1c1c1c]">#SC-{String(id).slice(0, 8).toUpperCase()}</td>
      <td className="px-4 py-[10px] text-[#1c1c1c]">{customerName}</td>
      <td className="px-4 py-[10px]">
        {items.length ? items.map((item) => `${item.name || "Item"} x${item.quantity || 1}`).join(", ") : "No items"}
      </td>
      <td className="px-4 py-[10px] text-[#1c1c1c]">KES {Number(totalAmount || 0).toLocaleString("en-KE")}</td>
      <td className="px-4 py-[10px]">
        <span className={`inline-flex rounded-[2px] px-2 py-1 text-[10px] ${statusClass[orderStatus] || "bg-[#fafafa] text-[#999]"}`}>
          {orderStatus}
        </span>
      </td>
      <td className="px-4 py-[10px]">
        <Link
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-[2px] bg-[#25D366] px-[10px] text-[10px] uppercase tracking-[1px] text-white transition-opacity duration-200 ease-in-out hover:opacity-90"
        >
          WhatsApp
        </Link>
      </td>
    </tr>
  );
}
