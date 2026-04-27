type ProductCardProps = {
  imageUrl?: string | null;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
};

export default function ProductCard({
  imageUrl,
  name,
  category,
  price,
  salePrice,
  stockQuantity,
}: ProductCardProps) {
  return (
    <article className="rounded-[2px] border border-[#f0f0f0] bg-white">
      <div className="aspect-[1/1.1] overflow-hidden bg-[#f4f4f2]">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[2px] text-[#999]">{category}</p>
        <h3 className="mt-2 text-[12px] text-[#1c1c1c]">{name}</h3>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#1c1c1c]">
          <span>KES {price.toLocaleString("en-KE")}</span>
          {salePrice ? <span className="text-[#999] line-through">KES {salePrice.toLocaleString("en-KE")}</span> : null}
        </div>
        <p className="mt-2 text-[10px] text-[#999]">{stockQuantity} in stock</p>
      </div>
    </article>
  );
}
