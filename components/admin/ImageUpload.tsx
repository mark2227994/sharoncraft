"use client";

type ImageUploadProps = {
  helpText?: string;
};

export default function ImageUpload({ helpText = "Upload will be wired to Supabase Storage in the next section." }: ImageUploadProps) {
  return (
    <div className="rounded-[2px] border border-dashed border-[#e0e0e0] bg-[#fafafa] p-5">
      <div className="flex min-h-32 flex-col items-center justify-center text-center">
        <p className="text-[10px] uppercase tracking-[2px] text-[#999]">Drag and drop</p>
        <p className="mt-2 text-[12px] text-[#1c1c1c]">Upload product images</p>
        <p className="mt-2 max-w-sm text-[11px] text-[#555]">{helpText}</p>
      </div>
    </div>
  );
}
