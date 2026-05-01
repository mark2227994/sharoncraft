import { useEffect, useMemo, useState } from "react";

const WAVE_EMOJI = "\u{1F44B}";

const fallbackSiteContent = {
  contactWhatsApp: "0112222572",
};

function formatPhoneForWhatsApp(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "254112222572";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function IconWhatsApp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M20 11.3c0 4.9-3.9 8.7-8.8 8.7-1.6 0-3.1-.4-4.4-1.1L3 20l1.2-3.6A8.5 8.5 0 013 11.3C3 6.5 6.9 2.7 11.8 2.7 16.1 2.7 20 6.4 20 11.3z" />
      <path d="M8.7 8.3c.2-.4.4-.4.7-.4h.6c.2 0 .5 0 .7.5.2.4.7 1.7.8 1.8.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.4.4c-.2.2-.3.3-.1.6.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.5 2.9 1.7.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.1.5.2.5.4 0 .2 0 1-.4 1.8-.4.8-2.1 1.7-2.9 1.7-.8 0-1.5.1-5-1.4-4-1.8-6.5-6.2-6.7-6.5-.2-.3-1.6-2.1-1.6-4s1-2.8 1.3-3.1z" />
    </svg>
  );
}

export default function WhatsAppFab() {
  const [siteContent, setSiteContent] = useState(fallbackSiteContent);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/site-images");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data && typeof data === "object") {
          setSiteContent((current) => ({ ...current, ...data }));
        }
      } catch {
        // Keep fallback content if site settings cannot be fetched.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const phoneNumber = useMemo(
    () => formatPhoneForWhatsApp(siteContent.contactWhatsApp || fallbackSiteContent.contactWhatsApp),
    [siteContent.contactWhatsApp],
  );

  const href = useMemo(
    () =>
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        `Hi Sharon ${WAVE_EMOJI} I saw your jewelry on sharoncraft.co.ke and would love to know more!`,
      )}`,
    [phoneNumber],
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-fab group fixed bottom-20 right-6 z-[999] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1c1c] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:scale-[1.08] hover:bg-[#8B5E3C] md:bottom-6"
      aria-label="Chat with us"
    >
      <IconWhatsApp className="h-[14px] w-[14px]" />
      <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[#1c1c1c] px-[10px] py-[5px] text-[10px] tracking-[1px] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
