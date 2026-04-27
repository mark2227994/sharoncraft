type ChecklistItem = {
  label: string;
  complete: boolean;
};

type PublishPanelProps = {
  checklist: ChecklistItem[];
};

export default function PublishPanel({ checklist }: PublishPanelProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
        <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Checklist</p>
        <div className="mt-4 space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px] text-[#555]">
              <span className={item.complete ? "text-[#166534]" : "text-[#999]"}>
                {item.complete ? "✓" : "□"}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[2px] border border-[#f0f0f0] bg-white p-4">
        <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Photo Tips</p>
        <div className="mt-4 space-y-2 text-[11px] text-[#555]">
          <p>📱 Natural window light only</p>
          <p>🎨 Warm cream background #F5F0EB</p>
          <p>👁️ Show jewelry being worn</p>
          <p>🔍 Include a close-up detail shot</p>
          <p>📐 Square format 1080x1080px min</p>
        </div>
      </section>
    </div>
  );
}
