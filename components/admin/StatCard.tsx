type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  trendTone?: "success" | "danger" | "neutral";
};

const trendToneClass = {
  success: "text-[#166534]",
  danger: "text-[#C0392B]",
  neutral: "text-[#999]",
};

export default function StatCard({ label, value, trend, trendTone = "neutral" }: StatCardProps) {
  return (
    <article className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
      <p className="text-[9px] uppercase tracking-[2px] text-[#999]">{label}</p>
      <p className="mt-3 text-[22px] font-light text-[#1c1c1c]">{value}</p>
      <p className={`mt-2 text-[10px] ${trendToneClass[trendTone]}`}>{trend || "Live from Supabase"}</p>
    </article>
  );
}
