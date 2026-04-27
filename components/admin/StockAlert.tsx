type StockAlertProps = {
  id: string;
  imageUrl?: string | null;
  name: string;
  stockQuantity: number;
  lowStockAlert: number;
};

export default function StockAlert({ id, imageUrl, name, stockQuantity, lowStockAlert }: StockAlertProps) {
  const isLow = stockQuantity <= lowStockAlert;

  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] py-3 last:border-b-0">
      <div className="h-9 w-9 overflow-hidden rounded-[2px] bg-[#f4f4f2]">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-[#1c1c1c]">{name}</p>
        <p className={`mt-1 text-[10px] ${isLow ? "text-[#C0392B]" : "text-[#999]"}`}>
          {stockQuantity} in stock
        </p>
      </div>
      <a
        href={`/admin/products/${id}`}
        className="inline-flex h-9 items-center rounded-[2px] border border-[#e0e0e0] px-3 text-[11px] uppercase tracking-[1px] text-[#555] transition-colors duration-200 ease-in-out hover:bg-[#fafaf8]"
      >
        +Stock
      </a>
    </div>
  );
}
