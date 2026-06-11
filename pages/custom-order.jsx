"use client";

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SeoHead from "../components/SeoHead";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254112222572";
const PHONE_PATTERN = /^(\+?254|0)(7\d{8}|1\d{8})$/;

const CATEGORY_OPTIONS = [
  {
    value: "Jewellery",
    examples: ["Beaded necklaces & chokers", "Custom earrings & hoops", "Personalised bracelets", "Matching sets"],
    price: 650,
    icon: "gem",
    gradient: "linear-gradient(135deg, #2a1810, #4a2c1a)",
    popular: true,
  },
  {
    value: "Accessories",
    examples: ["Beaded sandals", "Custom kiondos", "Personalised key holders", "Beaded belts"],
    price: 800,
    icon: "bag",
    gradient: "linear-gradient(135deg, #1a1a2e, #2d2d44)",
  },
  {
    value: "African Wear",
    examples: ["Custom Maasai shuka wraps", "Embroidered tops", "Occasion wear"],
    price: 1500,
    icon: "wear",
    gradient: "linear-gradient(135deg, #1a2e1a, #2d442d)",
  },
  {
    value: "Home & Living",
    examples: ["Custom woven baskets", "Beaded table decor", "Personalised wall pieces"],
    price: 1200,
    icon: "home",
    gradient: "linear-gradient(135deg, #2e1a1a, #442d2d)",
  },
  {
    value: "Art & Craft",
    examples: ["Custom soapstone carvings", "Personalised paintings", "Corporate art pieces"],
    price: 2000,
    icon: "paint",
    gradient: "linear-gradient(135deg, #1a1a1a, #333)",
  },
  {
    value: "Gift Set",
    examples: ["Curated occasion gifts", "Corporate gift hampers", "Wedding favors at scale"],
    price: 1500,
    icon: "gift",
    gradient: "linear-gradient(135deg, #2e2a1a, #44402d)",
  },
];

const FORM_CATEGORIES = [
  "Jewellery",
  "Accessories",
  "African Wear",
  "Home & Living",
  "Gift Set",
  "Corporate Order",
  "Something Else",
];

const OCCASIONS = [
  "Personal wear",
  "Birthday gift",
  "Wedding gift",
  "Anniversary",
  "Corporate gift",
  "Just because",
  "Other",
];

const HOW_FOUND = ["Instagram", "TikTok", "Google", "WhatsApp Status", "Friend", "Other"];

const SMART_PROMPTS = {
  "Jewellery": "What type? (necklace, bracelet, earrings, set) · What colors? · What length/size? · Any beading style preference?",
  "Accessories": "What item? (sandals, kiondo, belt, key holder) · Colors? · Size? · Design references?",
  "African Wear": "What garment? (shuka wrap, top, dress) · Colors/patterns? · Size? · Occasion?",
  "Home & Living": "What item? (basket, table decor, wall piece) · Dimensions? · Colors? · Where will it go?",
  "Gift Set": "Occasion? · How many recipients? · Budget per gift? · Preferences?",
  "Corporate Order": "What items? · How many units? · Branding needs? · Deadline?",
  "Something Else": "Describe your idea freely. Include any references, measurements, or preferences.",
};

const FAQ_GROUPS = [
  {
    title: "Pricing",
    items: [
      {
        q: "How much deposit do I pay?",
        a: "50% of the agreed price is required to begin production. The remaining 50% is paid on delivery.",
      },
      {
        q: "What payments do you accept?",
        a: "M-Pesa is the primary method. We also accept cash on delivery in Nairobi and bank transfer. All amounts are in Kenyan Shillings.",
      },
      {
        q: "Can I combine custom orders with ready-made pieces?",
        a: "Yes. You can order custom and in-stock pieces together. They will be dispatched when everything is ready.",
      },
    ],
  },
  {
    title: "Timeline",
    items: [
      {
        q: "How long does a custom order take?",
        a: "Most pieces are ready in 5-7 business days. Larger or more complex pieces may take up to 10 days. Sharon confirms your exact timeline in the quote.",
      },
      {
        q: "Can I get a piece by a specific date?",
        a: "Yes. You can specify a target date in the request. Sharon will let you know if the timeline is feasible before accepting the deposit.",
      },
    ],
  },
  {
    title: "Quality",
    items: [
      {
        q: "Can I see the piece before delivery?",
        a: "Yes. Sharon sends photos of your completed piece on WhatsApp before dispatch. You confirm you are happy before it leaves the studio.",
      },
      {
        q: "What if I am not happy with the result?",
        a: "We will adjust or remake the piece until you are satisfied. Your happiness is not negotiable for us.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Do you deliver outside Nairobi?",
        a: "Yes. We ship Kenya-wide. Delivery times and fees outside Nairobi will be included in your quote.",
      },
      {
        q: "Do you accept bulk corporate orders?",
        a: "Yes. Sharon handles custom corporate gifting and bulk orders. Timelines and discount structures will be provided upon review.",
      },
    ],
  },
];

const initialForm = {
  name: "",
  whatsapp: "",
  email: "",
  category: "",
  description: "",
  occasion: "",
  budget: 2000,
  neededBy: "",
  howFound: "",
};

function normalizePhone(value = "") {
  return String(value).replace(/[\s()-]/g, "");
}

function formatKES(value) {
  return `KES ${Math.round(Number(value) || 0).toLocaleString("en-KE")}`;
}

function minNeededDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

function scrollToId(id) {
  document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getImageFromProduct(product) {
  if (!product) return "";
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  if (typeof product.images === "string") {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return product.images;
    }
  }
  return product.image_url || product.image || "";
}

function Icon({ name }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": "true" };
  if (name === "gem") {
    return (
      <svg {...common}>
        <path d="M6 8.5 9 4h6l3 4.5L12 20 6 8.5Z" />
        <path d="M6 8.5h12M9 4l3 16M15 4l-3 16" />
      </svg>
    );
  }
  if (name === "bag") {
    return (
      <svg {...common}>
        <path d="M6 9h12v10H6z" />
        <path d="M9 9c0-2.5 1.2-4 3-4s3 1.5 3 4" />
      </svg>
    );
  }
  if (name === "wear") {
    return (
      <svg {...common}>
        <path d="M8 6 5 9l2 3v7h10v-7l2-3-3-3-2 2h-4L8 6Z" />
      </svg>
    );
  }
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M7 10.5V19h10v-8.5" />
      </svg>
    );
  }
  if (name === "paint") {
    return (
      <svg {...common}>
        <path d="M7 17c-1.8 0-3-1.4-3-3.2C4 9 7.8 5.5 12.3 5.5c4.8 0 7.7 3.1 7.7 7.2 0 2-1.2 3.3-3 3.3h-1.1c-.8 0-1.3-.6-1.1-1.4.1-.5.2-.9.2-1.4 0-2-1.6-3.5-3.7-3.5-2.5 0-4.3 1.7-4.3 4.1 0 1 .4 2.1 1 3.2H7Z" />
        <circle cx="9" cy="10.5" r=".8" />
        <circle cx="12.2" cy="9" r=".8" />
        <circle cx="15.2" cy="11" r=".8" />
      </svg>
    );
  }
  if (name === "gift") {
    return (
      <svg {...common}>
        <path d="M4 10h16v10H4zM4 10h16M12 10v10M7.5 6.5C7.5 5.1 8.5 4 9.8 4 11.6 4 12 7 12 7s.4-3 2.2-3c1.3 0 2.3 1.1 2.3 2.5S15.4 9 14 9h-4C8.6 9 7.5 7.9 7.5 6.5Z" />
      </svg>
    );
  }
  if (name === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16V5" />
        <path d="m8 9 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return [count, elementRef];
}

function Confetti() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const colors = ["#8b5e3c", "#fafaf8", "#d4af37", "#a0522d", "#cd853f"];
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -20 - 10,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        .confetti-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .confetti-particle {
          position: absolute;
          opacity: 0.8;
          border-radius: 50%;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="co-step-indicator">
      <div className="indicator-line">
        <div className="indicator-progress" style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
      </div>
      {[
        { step: 1, label: "Your Vision" },
        { step: 2, label: "Details" },
        { step: 3, label: "Your Info" },
      ].map((s) => (
        <div key={s.step} className={`indicator-step ${currentStep >= s.step ? "active" : ""} ${currentStep === s.step ? "current" : ""}`}>
          <span className="step-num">{s.step}</span>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingField({ label, required, error, helper, children }) {
  return (
    <label className={`co-field ${error ? "field-error" : ""}`}>
      {children}
      <span className="co-floating-label">
        {label}
        {required ? <em> *</em> : null}
      </span>
      {helper && !error ? <span className="co-helper">{helper}</span> : null}
      {error ? <span className="co-error">{error}</span> : null}
    </label>
  );
}

export default function CustomOrderPage({ heroImage, examples, categoryImages }) {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(null);
  const [openFaq, setOpenFaq] = useState("0-0");
  const [currentStep, setCurrentStep] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [formIsVisible, setFormIsVisible] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const fileInputRef = useRef(null);

  const deposit = useMemo(() => Math.round(Number(form.budget || 0) / 2), [form.budget]);
  const descriptionCount = form.description.length;
  const [piecesCount, piecesRef] = useCounter(200);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const hero = document.querySelector(".co-hero");
      if (hero) {
        setShowStickyBar(window.scrollY > hero.clientHeight - 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal, .reveal-left, .reveal-right"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [success]);

  useEffect(() => {
    const formSec = document.querySelector("#custom-form");
    if (!formSec) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFormIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(formSec);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!attemptedSubmit) return;
    setErrors(validateStep(currentStep));
  }, [form, attemptedSubmit]);

  useEffect(() => () => images.forEach((item) => URL.revokeObjectURL(item.preview)), [images]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function selectCategory(value, shouldScroll = false) {
    setForm((prev) => ({ ...prev, category: value }));
    if (shouldScroll) {
      window.setTimeout(() => scrollToId("custom-form"), 80);
    }
  }

  function validateStep(step) {
    const nextErrors = {};
    if (step === 1) {
      if (!form.category) nextErrors.category = "Choose what you would like Sharon to make.";
      if (form.description.trim().length < 20) {
        nextErrors.description = "Please describe your piece in at least 20 characters.";
      }
    } else if (step === 3) {
      if (form.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
      if (!PHONE_PATTERN.test(normalizePhone(form.whatsapp))) {
        nextErrors.whatsapp = "Use a Kenyan WhatsApp number: 0712345678, 254712345678, or +254712345678.";
      }
    }
    return nextErrors;
  }

  function handleNext() {
    setAttemptedSubmit(true);
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setAttemptedSubmit(false);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      const firstError = document.querySelector(".field-error");
      if (firstError) {
        firstError.classList.add("shake");
        window.setTimeout(() => firstError.classList.remove("shake"), 500);
      }
    }
  }

  function handleBack() {
    setAttemptedSubmit(false);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  function addFiles(fileList) {
    const nextFiles = Array.from(fileList || [])
      .filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024)
      .slice(0, Math.max(0, 5 - images.length))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...nextFiles].slice(0, 5));
  }

  function removeImage(index) {
    setImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  }

  async function uploadImages() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !images.length) return [];

    try {
      const supabase = createClient(url, key);
      const uploaded = [];
      for (const item of images) {
        const safeName = item.file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const path = `custom-orders/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("custom-order-images").upload(path, item.file, {
          cacheControl: "3600",
          contentType: item.file.type,
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from("custom-order-images").getPublicUrl(path);
        if (data?.publicUrl) uploaded.push(data.publicUrl);
      }
      return uploaded;
    } catch (_error) {
      return [];
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    setAttemptedSubmit(true);
    setSubmitError("");

    const step1Errors = validateStep(1);
    const step3Errors = validateStep(3);
    const allErrors = { ...step1Errors, ...step3Errors };
    setErrors(allErrors);

    if (Object.keys(allErrors).length) {
      if (step1Errors.category || step1Errors.description) {
        setCurrentStep(1);
      } else {
        setCurrentStep(3);
      }
      return;
    }

    setSubmitting(true);
    setSubmitState("loading");
    try {
      const imageUrls = await uploadImages();
      const payload = {
        name: form.name.trim(),
        phone: normalizePhone(form.whatsapp),
        email: form.email.trim(),
        category: form.category,
        description: form.description.trim(),
        occasion: form.occasion,
        budget: Number(form.budget),
        neededBy: form.neededBy || null,
        imageUrls,
        imageNames: images.map((item) => item.file.name),
        howFound: form.howFound,
      };

      const response = await fetch("/api/orders/custom-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || "Something went wrong. Try again.");

      const adminMsg = [
        "🎨 New custom order!",
        "",
        `Name: ${payload.name}`,
        `WhatsApp: ${payload.phone}`,
        `Category: ${payload.category}`,
        `Budget: ${formatKES(payload.budget)}`,
        `Needed by: ${payload.neededBy || "Flexible"}`,
        "",
        "Description:",
        `"${payload.description}"`,
        "",
        "Check admin for full details.",
      ].join("\n");
      window.open(buildWhatsAppUrl(adminMsg), "_blank", "noopener,noreferrer");

      setSubmitState("success");
      setSuccess({
        name: payload.name,
        reference: body.orderReference || `SC-CO-${String(Date.now()).slice(-6)}`,
      });
      setImages((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.preview));
        return [];
      });
      setForm(initialForm);
      setCurrentStep(1);
      window.setTimeout(() => scrollToId("custom-form"), 120);
    } catch (error) {
      setSubmitState("error");
      setSubmitError(error.message || "Something went wrong. Try again.");
      window.setTimeout(() => setSubmitState("idle"), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Custom Orders — Handmade Just for You | SharonCraft"
        description="Order a custom handmade Kenyan jewelry or accessory piece from SharonCraft. Describe your vision and our artisans craft it in 5-7 days. Starting KES 650."
        path="/custom-order"
      />
      <Nav />

      <main className="custom-order-page">
        <section className="co-hero">
          <div className="co-hero__base" aria-hidden="true" />
          <div className="co-hero__glow" aria-hidden="true" />
          {heroImage?.src ? (
            <div className="co-hero__image-wrap" aria-hidden="true">
              <div
                className="parallax-container"
                style={{ transform: `translateY(${scrollY * 0.25}px)` }}
              >
                <Image src={heroImage.src} alt={heroImage.alt || ""} fill priority sizes="100vw" className="co-hero__image" />
              </div>
              <span className="co-hero__blend" />
            </div>
          ) : null}
          <div className="co-hero__texture" aria-hidden="true" />

          <span className="co-hero__top-label">NAIROBI · EST. 2024</span>
          <div className="co-hero__content">
            <div className="co-eyebrow">
              <span />
              CUSTOM ORDERS
            </div>
            <h1>
              <span className="word reveal-word" style={{ animationDelay: "0.1s" }}>Your</span>{" "}
              <span className="word reveal-word" style={{ animationDelay: "0.2s" }}>vision.</span>{" "}
              <em className="word reveal-word" style={{ animationDelay: "0.3s" }}>Our craft.</em>
            </h1>
            <p>Tell us what you have in mind. Sharon will bring it to life — handcrafted in Nairobi just for you.</p>
            <div className="co-hero__actions">
              <button type="button" onClick={() => scrollToId("custom-form")}>
                START ORDER <Icon name="arrow" />
              </button>
              <button type="button" className="co-hero__link" onClick={() => scrollToId("custom-examples")}>
                SEE EXAMPLES
              </button>
            </div>
            <div ref={piecesRef} className="co-hero__social-proof">
              <strong>{piecesCount}+</strong>
              <span>Custom Pieces Delivered</span>
            </div>
          </div>
          <div className="co-response">
            <span />
            Sharon responds in under 2 hours
          </div>
          <div className="co-scroll" aria-hidden="true">
            <span />
            <small>SCROLL</small>
          </div>
        </section>

        <section className="co-process">
          <p className="co-label reveal">THE PROCESS</p>
          <h2 className="reveal" style={{ transitionDelay: "80ms" }}>
            From idea to your hands
          </h2>
          <div className="co-steps">
            <span className="co-steps__line" aria-hidden="true" />
            {[
              ["Tell us your vision", "Describe style, colors, size, occasion. Photos or references are welcome.", ""],
              ["Sharon reviews it", "Sharon personally reads your request and may ask a few questions.", "Within 2 hours"],
              ["You approve and deposit", "Once you love the plan you pay 50% via M-Pesa. Production begins.", "Same day"],
              ["Delivered to you", "Your piece is crafted and delivered with a progress photo before dispatch.", "5-7 business days"],
            ].map(([title, text, badge], index) => (
              <article className="co-step reveal" key={title} style={{ transitionDelay: `${index * 100}ms` }}>
                <span className="co-step__number">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {badge ? <small>{badge}</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="co-categories">
          <div className="co-shell">
            <p className="co-label reveal">WHAT WE CAN MAKE FOR YOU</p>
            <div className="co-category-grid">
              {CATEGORY_OPTIONS.map((item, index) => {
                const bgImage = categoryImages?.[item.value];
                return (
                  <button
                    type="button"
                    key={item.value}
                    className={`co-category-card reveal ${form.category === item.value ? "selected" : ""} ${item.popular ? "co-category-card--popular" : ""}`}
                    style={{
                      transitionDelay: `${index * 70}ms`,
                      background: bgImage ? "none" : item.gradient,
                    }}
                    onClick={() => selectCategory(item.value, true)}
                  >
                    {bgImage ? (
                      <div className="co-category-bg">
                        <Image src={bgImage} alt={item.value} fill sizes="33vw" className="co-category-img" />
                        <div className="co-category-overlay" />
                      </div>
                    ) : (
                      <span className="co-category-card__line" />
                    )}
                    {item.popular && <span className="popular-badge">MOST POPULAR</span>}
                    <div className="co-category-content">
                      <Icon name={item.icon} />
                      <strong>{item.value}</strong>
                      <span className="cat-desc">{item.examples.join(" · ")}</span>
                      <small>
                        <em>Starting from:</em>
                        {formatKES(item.price)}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="co-examples" id="custom-examples">
          <div className="co-examples__header">
            <p className="co-label reveal">CUSTOM PIECES WE HAVE MADE</p>
            <h2 className="reveal" style={{ transitionDelay: "80ms" }}>
              Every piece starts as an idea.
            </h2>
          </div>
          <div className="co-example-grid">
            {(examples?.length ? examples : CATEGORY_OPTIONS).slice(0, 6).map((item, index) => {
              const src = getImageFromProduct(item);
              const title = item.name || item.value || "Custom piece";
              return (
                <article className={`co-example co-example--${index + 1}`} key={`${title}-${index}`}>
                  {src ? <Image src={src} alt={title} fill sizes="50vw" className="co-example__image" /> : <span className="co-example__fallback" />}
                  <span className="co-example__overlay" />
                  <div>
                    <small>{item.category || "Custom piece"}</small>
                    <strong>{title}</strong>
                    <em>Custom piece</em>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="co-examples__cta reveal">
            <p>Want something like this?</p>
            <button type="button" onClick={() => scrollToId("custom-form")}>
              START YOUR CUSTOM ORDER ↓
            </button>
          </div>
        </section>

        <section className="co-testimonials">
          <div className="co-shell">
            <p className="co-label reveal">TESTIMONIALS</p>
            <h2 className="reveal">Loved by our clients</h2>
            <div className="co-testimonials-grid">
              {[
                { quote: "Sharon made my wedding jewelry set exactly how I imagined it. The attention to detail was incredible.", author: "Grace W.", location: "Nairobi" },
                { quote: "Ordered custom kiondos for 50 corporate guests. Delivered on time, beautiful quality.", author: "James M.", location: "Mombasa" },
                { quote: "The earrings she made for my birthday are my most complimented accessory. Worth every shilling.", author: "Aisha K.", location: "Kisumu" },
              ].map((t, idx) => (
                <div key={idx} className="co-testimonial-card reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                  <span className="quote-mark">“</span>
                  <p>{t.quote}</p>
                  <div className="author-info">
                    <strong>{t.author}</strong>
                    <span>{t.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="co-form-section" id="custom-form">
          {success ? (
            <div className="co-success">
              <Confetti />
              <svg viewBox="0 0 80 80" aria-hidden="true">
                <circle cx="40" cy="40" r="30" />
                <path d="M26 41.5 36 51l20-23" />
              </svg>
              <h2>Request sent! 🙏</h2>
              <p>Thank you {success.name}. Sharon will read your request and reply to your WhatsApp within 2 hours.</p>
              <div className="timeline-success">
                <h3>What happens next?</h3>
                <div className="success-timeline-steps">
                  <div className="success-step">
                    <strong>1. Quote Sent</strong>
                    <span>Sharon sends pricing and design mockup via WhatsApp.</span>
                  </div>
                  <div className="success-step">
                    <strong>2. 50% Deposit</strong>
                    <span>M-Pesa deposit confirms order and production starts.</span>
                  </div>
                  <div className="success-step">
                    <strong>3. Crafted & Sent</strong>
                    <span>Handmade in 5-7 days and shipped after photo approval.</span>
                  </div>
                </div>
              </div>
              <small>{success.reference}</small>
              <div className="success-actions">
                <a href={buildWhatsAppUrl(`Hi Sharon 👋 I just submitted custom request ${success.reference}!`)} target="_blank" rel="noreferrer" className="whatsapp-share-btn">
                  SHARE ON WHATSAPP
                </a>
                <Link href="/shop" className="secondary-success-btn">CONTINUE SHOPPING →</Link>
              </div>
            </div>
          ) : (
            <div className="co-form-layout">
              <div className="co-form-wrapper reveal-left">
                <p className="co-label">YOUR REQUEST</p>
                <StepIndicator currentStep={currentStep} />

                <form className="co-form" onSubmit={submitForm}>
                  <div className="co-form-viewport">
                    <div className="co-form-slider" style={{ transform: `translateX(-${(currentStep - 1) * 33.333}%)` }}>
                      {/* Step 1: Vision */}
                      <div className="co-form-step">
                        <h3 className="step-title">1. Your Vision</h3>
                        
                        <div className="co-chip-block">
                          <span>WHAT WOULD YOU LIKE?</span>
                          <div>
                            {FORM_CATEGORIES.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`co-chip ${form.category === item ? "selected" : ""}`}
                                onClick={() => selectCategory(item)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                          {errors.category ? <span className="co-error field-error">{errors.category}</span> : null}
                        </div>

                        {form.category && SMART_PROMPTS[form.category] && (
                          <div className="smart-prompt-box">
                            <strong>Sharon's Suggestion:</strong>
                            <p>{SMART_PROMPTS[form.category]}</p>
                            <button
                              type="button"
                              className="use-template-btn"
                              onClick={() => {
                                const template = `Category: ${form.category}\n` +
                                  SMART_PROMPTS[form.category]
                                    .split(" · ")
                                    .map((q) => `${q}: `)
                                    .join("\n");
                                updateField("description", template);
                              }}
                            >
                              Pre-fill structural template
                            </button>
                          </div>
                        )}

                        <FloatingField label="Describe your piece" required error={errors.description}>
                          <textarea
                            value={form.description}
                            onChange={(event) => updateField("description", event.target.value)}
                            placeholder=" "
                            rows={6}
                          />
                          <span className="co-counter">{descriptionCount} chars</span>
                        </FloatingField>

                        <div className="step-nav-buttons">
                          <button type="button" className="co-nav-btn next-btn" onClick={handleNext}>
                            NEXT STEP →
                          </button>
                        </div>
                      </div>

                      {/* Step 2: Details */}
                      <div className="co-form-step">
                        <h3 className="step-title">2. Design & Budget</h3>

                        <div className="co-chip-block">
                          <span>WHAT IS IT FOR?</span>
                          <div>
                            {OCCASIONS.map((item) => (
                              <button
                                type="button"
                                key={item}
                                className={`co-chip ${form.occasion === item ? "selected" : ""}`}
                                onClick={() => updateField("occasion", form.occasion === item ? "" : item)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="co-budget">
                          <span>YOUR BUDGET</span>
                          <input
                            type="range"
                            min="500"
                            max="50000"
                            step="500"
                            value={form.budget}
                            onChange={(event) => updateField("budget", event.target.value)}
                            style={{ "--progress": `${((Number(form.budget) - 500) / 49500) * 100}%` }}
                          />
                          <div>
                            <small>KES 500</small>
                            <strong>{formatKES(form.budget)}</strong>
                            <small>KES 50,000+</small>
                          </div>
                          <em>Estimated deposit (50%): {formatKES(deposit)}</em>
                        </div>

                        <div className="co-date">
                          <span>NEEDED BY (OPTIONAL)</span>
                          <input
                            type="date"
                            min={minNeededDate()}
                            value={form.neededBy}
                            onChange={(event) => updateField("neededBy", event.target.value)}
                          />
                          <small>Minimum 7 days from today. Typical turnaround is 5-7 days.</small>
                        </div>

                        <div className="co-upload">
                          <span>INSPIRATION IMAGES (OPTIONAL)</span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              addFiles(event.dataTransfer.files);
                            }}
                          >
                            <Icon name="upload" />
                            <strong>Drop inspiration images here</strong>
                            <em>or click to browse</em>
                            <small>JPG, PNG, WebP up to 5MB each</small>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            hidden
                            onChange={(event) => addFiles(event.target.files)}
                          />
                          {images.length ? (
                            <div className="co-thumbs">
                              {images.map((item, index) => (
                                <span key={item.preview}>
                                  <img src={item.preview} alt="" />
                                  <button type="button" onClick={() => removeImage(index)}>
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="step-nav-buttons">
                          <button type="button" className="co-nav-btn back-btn" onClick={handleBack}>
                            ← BACK
                          </button>
                          <button type="button" className="co-nav-btn next-btn" onClick={handleNext}>
                            NEXT STEP →
                          </button>
                        </div>
                      </div>

                      {/* Step 3: Your Info */}
                      <div className="co-form-step">
                        <h3 className="step-title">3. Your Info</h3>

                        <FloatingField label="Your full name" required error={errors.name}>
                          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder=" " />
                        </FloatingField>

                        <div className="co-two">
                          <FloatingField label="WhatsApp number" required error={errors.whatsapp} helper="We send your quote here within 2 hours">
                            <input
                              type="tel"
                              value={form.whatsapp}
                              onChange={(event) => updateField("whatsapp", event.target.value)}
                              placeholder=" "
                            />
                          </FloatingField>
                          <FloatingField label="Email (optional)" helper="For order confirmations">
                            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder=" " />
                          </FloatingField>
                        </div>

                        <div className="co-chip-block">
                          <span>HOW DID YOU HEAR ABOUT US?</span>
                          <div>
                            {HOW_FOUND.map((item) => (
                              <button
                                type="button"
                                key={item}
                                className={`co-chip ${form.howFound === item ? "selected" : ""}`}
                                onClick={() => updateField("howFound", form.howFound === item ? "" : item)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="step-nav-buttons">
                          <button type="button" className="co-nav-btn back-btn" onClick={handleBack}>
                            ← BACK
                          </button>
                          <button type="submit" className={`co-submit co-submit--${submitState}`} disabled={submitting}>
                            {submitState === "loading" ? "SENDING..." : submitState === "success" ? "REQUEST SENT ✓" : submitState === "error" ? "SOMETHING WENT WRONG" : "SEND REQUEST →"}
                          </button>
                        </div>
                        {submitError ? <p className="co-submit-error">{submitError}</p> : null}
                        <p className="co-privacy">Your details are private. We never share them.</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <aside className="co-side reveal-right">
                <div className="co-side__response">
                  <span />
                  <div>
                    <small>Sharon responds in</small>
                    <strong>Under 2 hours</strong>
                    <p>Every request is read and replied to personally.</p>
                  </div>
                </div>

                <div className="co-summary">
                  <p>ORDER SUMMARY</p>
                  <dl>
                    <div>
                      <dt>Category</dt>
                      <dd>{form.category || "—"}</dd>
                    </div>
                    <div>
                      <dt>Occasion</dt>
                      <dd>{form.occasion || "—"}</dd>
                    </div>
                    <div>
                      <dt>Budget</dt>
                      <dd>{formatKES(form.budget)}</dd>
                    </div>
                    <div>
                      <dt>Needed by</dt>
                      <dd>{form.neededBy || "Flexible"}</dd>
                    </div>
                  </dl>
                  <div>
                    <small>Estimated deposit</small>
                    <strong>{formatKES(deposit)}</strong>
                    <em>50% upfront · 50% on delivery</em>
                  </div>
                </div>

                <div className="co-included">
                  <p>INCLUDED WITH EVERY ORDER</p>
                  {[
                    "Consultation with Sharon",
                    "Design sketch or reference",
                    "WhatsApp progress updates",
                    "Pre-dispatch photo approval",
                    "Handcrafted by Nairobi artisan",
                    "Delivered to your location",
                  ].map((item) => (
                    <span key={item}>
                      <Icon name="check" />
                      {item}
                    </span>
                  ))}
                </div>

                <div className="co-direct">
                  <h3>Prefer to chat directly?</h3>
                  <p>Message Sharon now for the fastest response.</p>
                  <a href={buildWhatsAppUrl("Hi Sharon 👋 I'm interested in a custom order!")} target="_blank" rel="noreferrer">
                    CHAT WITH SHARON →
                  </a>
                </div>
              </aside>
            </div>
          )}
        </section>

        <section className="co-after">
          <p className="co-label reveal">AFTER YOU SUBMIT</p>
          <h2 className="reveal" style={{ transitionDelay: "80ms" }}>
            Here is exactly what happens.
          </h2>
          <div>
            {[
              ["01", "Sharon reviews your request", "Your request is personally read. Sharon may message you for clarifications before sending a quote.", ""],
              ["02", "You receive a quote", "A detailed quote including price, timeline and deposit amount is sent to your WhatsApp within 2 hours.", ""],
              ["03", "Production begins", "Once you confirm and pay your deposit your piece is crafted and delivered with a photo check.", "5-7 BUSINESS DAYS"],
            ].map(([num, title, text, badge], index) => (
              <article className="reveal" style={{ transitionDelay: `${index * 120}ms` }} key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {badge ? <small>{badge}</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="co-faq">
          <p className="co-label reveal">COMMON QUESTIONS</p>
          <div className="co-faq-layout">
            {FAQ_GROUPS.map((group, groupIdx) => (
              <div key={group.title} className="co-faq-group reveal" style={{ transitionDelay: `${groupIdx * 100}ms` }}>
                <h3 className="co-faq-group-title">{group.title}</h3>
                <div className="co-faq-list">
                  {group.items.map((item, itemIdx) => {
                    const uniqueId = `${groupIdx}-${itemIdx}`;
                    return (
                      <article key={item.q} className="co-faq-article">
                        <button type="button" onClick={() => setOpenFaq(openFaq === uniqueId ? "" : uniqueId)} className="co-faq-q-btn">
                          <span>{item.q}</span>
                          <em>{openFaq === uniqueId ? "−" : "+"}</em>
                        </button>
                        <div className={`faq-content-wrap ${openFaq === uniqueId ? "open" : ""}`}>
                          <div className="faq-content-inner">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="co-faq-cta reveal">
            <p>Still have questions?</p>
            <a href={buildWhatsAppUrl("Hi Sharon 👋 I have a question about custom orders.")} target="_blank" rel="noreferrer">
              ASK SHARON ON WHATSAPP
            </a>
          </div>
        </section>

        <section className="co-final reveal">
          <h2>Ready to start?</h2>
          <p>Fill in the form above. Sharon will respond in under 2 hours.</p>
          <div>
            <button type="button" onClick={() => scrollToId("custom-form")}>
              START MY CUSTOM ORDER ↑
            </button>
            <a href={buildWhatsAppUrl("Hi Sharon 👋 I'm interested in a custom order!")} target="_blank" rel="noreferrer">
              CHAT ON WHATSAPP
            </a>
          </div>
          <ul>
            <li>50% deposit to start</li>
            <li>Photos before dispatch</li>
            <li>Free Nairobi delivery</li>
            <li>Made in 5-7 days</li>
          </ul>
        </section>

        {showStickyBar && !success && (
          <div className="co-mobile-sticky-bar">
            <div className="bar-info">
              <span className="sticky-cat">{form.category || "Select craft type"}</span>
              <span className="sticky-budget">{formatKES(form.budget)}</span>
            </div>
            <button
              type="button"
              className="sticky-action-btn"
              onClick={() => {
                if (currentStep < 3) {
                  handleNext();
                } else {
                  document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }
              }}
            >
              {currentStep < 3 ? "NEXT STEP" : "SUBMIT REQUEST"}
            </button>
          </div>
        )}

        {!formIsVisible && !success && (
          <a
            href={buildWhatsAppUrl("Hi Sharon 👋 I'm interested in a custom order!")}
            className="co-floating-whatsapp"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.412 1.451 5.428 0 9.845-4.394 9.848-9.796.002-2.617-1.01-5.077-2.85-6.921-1.84-1.844-4.29-2.858-6.908-2.859-5.432 0-9.85 4.393-9.853 9.797-.001 2.022.528 4.001 1.532 5.761l-.982 3.585 3.676-.963zm10.702-4.717c-.299-.149-1.764-.868-2.037-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.646.074-.3-.149-1.264-.462-2.41-1.477-.89-.789-1.492-1.764-1.666-2.062-.173-.299-.018-.46.131-.609.135-.134.298-.347.447-.52.149-.173.198-.298.298-.497.1-.2.05-.374-.025-.523-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.764-.719 2.012-1.412.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            <span>Quick Order</span>
          </a>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .custom-order-page {
          --cream: #fafaf8;
          --card-bg: #f5f0eb;
          --dark: #1c1c1c;
          --black: #080808;
          --brown: #8b5e3c;
          --dark-brown: #3d1f0d;
          --border: rgba(0, 0, 0, 0.08);
          --muted: #bbb;
          --text: #666;
          background: var(--cream);
          color: var(--dark);
          overflow: hidden;
        }

        .custom-order-page :global(*) {
          box-sizing: border-box;
        }

        .custom-order-page :global(.reveal),
        .custom-order-page :global(.reveal-left),
        .custom-order-page :global(.reveal-right) {
          opacity: 0;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        .custom-order-page :global(.reveal) {
          transform: translateY(22px);
        }

        .custom-order-page :global(.reveal-left) {
          transform: translateX(-24px);
        }

        .custom-order-page :global(.reveal-right) {
          transform: translateX(24px);
        }

        .custom-order-page :global(.visible) {
          opacity: 1;
          transform: translate(0, 0) !important;
        }

        .co-shell {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        .co-label {
          margin: 0;
          font-size: 9px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* Hero styling */
        .co-hero {
          position: relative;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: var(--black);
        }

        .co-hero__base,
        .co-hero__glow,
        .co-hero__texture {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .co-hero__base {
          background: radial-gradient(ellipse 80% 80% at 30% 60%, #1a0e08 0%, #080808 65%);
        }

        .co-hero__glow {
          background: radial-gradient(ellipse 50% 70% at 15% 80%, rgba(139, 94, 60, 0.14) 0%, transparent 65%);
        }

        .co-hero__image-wrap {
          position: absolute;
          inset: 0 0 0 auto;
          width: 48%;
          opacity: 0.35;
          overflow: hidden;
        }

        .parallax-container {
          position: relative;
          width: 100%;
          height: 120%;
          top: -10%;
          will-change: transform;
        }

        .co-hero__image {
          object-fit: cover;
          object-position: center top;
          filter: contrast(1.05) saturate(0.85);
        }

        .co-hero__blend {
          position: absolute;
          inset: 0 auto 0 0;
          width: 240px;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
          pointer-events: none;
        }

        .co-hero__texture {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 80px,
            rgba(255, 255, 255, 0.015) 80px,
            rgba(255, 255, 255, 0.015) 81px
          );
        }

        .co-hero__top-label {
          position: absolute;
          top: 6%;
          left: 6%;
          z-index: 2;
          font-size: 9px;
          letter-spacing: 5px;
          color: rgba(255, 255, 255, 0.25);
          animation: heroIn 0.5s 0.2s both;
        }

        .co-hero__content {
          position: absolute;
          bottom: 10%;
          left: 6%;
          z-index: 2;
          max-width: 560px;
        }

        .co-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 9px;
          letter-spacing: 6px;
          color: var(--brown);
          animation: heroIn 0.5s 0.3s both;
        }

        .co-eyebrow span {
          width: 24px;
          height: 1px;
          background: var(--brown);
        }

        .co-hero h1 {
          margin: 0 0 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          font-size: clamp(38px, 5.5vw, 60px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -1px;
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Playfair Display', Georgia, serif;
        }

        .reveal-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          animation: wordFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes wordFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .co-hero h1 em {
          color: rgba(255, 255, 255, 0.45);
          font-style: italic;
        }

        .co-hero__content p {
          max-width: 400px;
          margin: 0 0 36px;
          font-size: 14px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.35);
          line-height: 1.8;
          animation: heroIn 0.6s 0.55s both;
        }

        .co-hero__actions {
          display: flex;
          align-items: center;
          gap: 20px;
          animation: heroIn 0.6s 0.7s both;
        }

        .co-hero__social-proof {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 24px;
          color: rgba(255, 255, 255, 0.4);
          animation: heroIn 0.6s 0.95s both;
        }

        .co-hero__social-proof strong {
          font-size: 28px;
          font-weight: 300;
          color: var(--brown);
          font-family: 'Playfair Display', Georgia, serif;
        }

        .co-hero__social-proof span {
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .co-hero button,
        .co-examples__cta button,
        .co-final button,
        .co-final a {
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .co-hero__actions > button:first-child {
          height: 52px;
          padding: 0 36px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: #fff;
          color: var(--dark);
          font-size: 11px;
          letter-spacing: 4px;
          font-weight: 500;
        }

        .co-hero__actions > button:first-child:hover {
          background: var(--brown);
          color: #fff;
        }

        .co-hero__actions :global(svg) {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
        }

        .co-hero__link {
          padding: 0 0 2px;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          background: transparent;
          color: rgba(255, 255, 255, 0.35);
          font-size: 11px;
          letter-spacing: 2px;
        }

        .co-hero__link:hover {
          color: rgba(255, 255, 255, 0.7);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .co-response {
          position: absolute;
          bottom: 4%;
          left: 6%;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          animation: heroIn 0.5s 1.2s both;
        }

        .co-response span,
        .co-side__response > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2e7d32;
          animation: pulse 2s infinite;
        }

        .co-scroll {
          position: absolute;
          right: 48px;
          bottom: 32px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: heroIn 0.5s 1.4s both;
        }

        .co-scroll span {
          width: 1px;
          height: 48px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }

        .co-scroll span::after {
          content: "";
          display: block;
          width: 100%;
          height: 40%;
          background: var(--brown);
          animation: scan 2s ease 1.5s infinite;
        }

        .co-scroll small {
          writing-mode: vertical-rl;
          font-size: 8px;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.2);
        }

        /* Process Steps */
        .co-process,
        .co-categories,
        .co-form-section,
        .co-testimonials,
        .co-faq,
        .co-final {
          border-bottom: 0.5px solid var(--border);
        }

        .co-process {
          padding: 80px 48px;
          background: #fff;
          text-align: center;
        }

        .co-process h2,
        .co-examples__header h2,
        .co-testimonials h2,
        .co-after h2,
        .co-final h2 {
          margin: 16px 0 56px;
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -0.3px;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .co-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          width: min(1140px, 100%);
          margin: 0 auto;
        }

        .co-steps__line {
          position: absolute;
          top: 28px;
          left: 12%;
          right: 12%;
          height: 0.5px;
          background: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.08) 15%, rgba(0, 0, 0, 0.08) 85%, transparent 100%);
          pointer-events: none;
        }

        .co-step {
          position: relative;
          padding: 0 28px;
          text-align: center;
        }

        .co-step__number {
          width: 56px;
          height: 56px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          background: #fff;
          font-size: 16px;
          font-weight: 300;
          transition: all 0.3s ease;
        }

        .co-step:hover .co-step__number {
          background: var(--dark);
          border-color: var(--dark);
          color: #fff;
        }

        .co-step h3 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .co-step p {
          max-width: 190px;
          margin: 0 auto;
          font-size: 12px;
          line-height: 1.75;
          color: var(--text);
        }

        .co-step small {
          display: inline-flex;
          margin-top: 10px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.04);
          font-size: 9px;
          letter-spacing: 1px;
          color: #888;
        }

        /* Categories Section */
        .co-categories {
          padding: 80px 0;
          background: var(--cream);
        }

        .co-categories .co-label {
          margin-bottom: 40px;
        }

        .co-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .co-category-card {
          position: relative;
          padding: 36px 28px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 4px;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .co-category-card:hover {
          transform: translateY(-4px);
          border-color: var(--brown);
          box-shadow: 0 12px 30px rgba(139, 94, 60, 0.08);
        }

        .co-category-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .co-category-img {
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .co-category-card:hover .co-category-img {
          transform: scale(1.06);
        }

        .co-category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(8, 8, 8, 0.85) 0%, rgba(8, 8, 8, 0.6) 100%);
          transition: background 0.3s ease;
        }

        .co-category-card:hover .co-category-overlay {
          background: linear-gradient(135deg, rgba(8, 8, 8, 0.75) 0%, rgba(8, 8, 8, 0.5) 100%);
        }

        .popular-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 3;
          background: var(--brown);
          color: #fff;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 2px;
          padding: 4px 8px;
          border-radius: 2px;
        }

        .co-category-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .co-category-card:not(:has(.co-category-bg)) {
          background: var(--card-bg);
          border: 1.5px solid transparent;
        }

        .co-category-card:not(:has(.co-category-bg)):hover {
          border-color: var(--brown);
        }

        .co-category-card__line {
          display: block;
          width: 40px;
          height: 2px;
          margin-bottom: 22px;
          background: var(--brown);
          transition: width 0.3s ease;
        }

        .co-category-card:hover .co-category-card__line {
          width: 80px;
        }

        .co-category-card :global(svg) {
          width: 32px;
          height: 32px;
          margin-bottom: 20px;
          fill: none;
          stroke: var(--brown);
          stroke-width: 1.2;
          transition: stroke 0.3s ease;
        }

        .co-category-card:has(.co-category-bg) :global(svg) {
          stroke: #fff;
        }

        .co-category-card strong {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--dark);
          font-family: 'Playfair Display', Georgia, serif;
        }

        .co-category-card:has(.co-category-bg) strong {
          color: #fff;
        }

        .cat-desc {
          min-height: 48px;
          font-size: 12px;
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .co-category-card:has(.co-category-bg) .cat-desc {
          color: rgba(255, 255, 255, 0.7);
        }

        .co-category-card small {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1.5px solid rgba(0, 0, 0, 0.06);
          color: var(--brown);
          font-size: 13px;
          font-weight: 500;
        }

        .co-category-card:has(.co-category-bg) small {
          border-top-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .co-category-card small em {
          color: var(--muted);
          font-size: 10px;
          font-style: normal;
          font-weight: 300;
        }

        /* Examples Gallery */
        .co-examples {
          padding: 80px 0 56px;
          background: var(--black);
          overflow: hidden;
        }

        .co-examples__header {
          padding: 0 80px;
        }

        .co-examples__header h2 {
          margin-bottom: 40px;
          color: rgba(255, 255, 255, 0.75);
        }

        .co-example-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          grid-template-rows: 300px 260px;
          gap: 3px;
        }

        .co-example {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #130c08, #2a160b);
        }

        .co-example--1 {
          grid-row: 1 / 3;
        }

        .co-example--6 {
          grid-column: 2 / 4;
        }

        .co-example__image {
          object-fit: cover;
          filter: contrast(1.05);
          transition: transform 0.65s ease;
        }

        .co-example:hover .co-example__image {
          transform: scale(1.05);
        }

        .co-example__fallback,
        .co-example__overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .co-example__fallback {
          background: radial-gradient(ellipse at 25% 80%, rgba(139, 94, 60, 0.45), transparent 58%),
            linear-gradient(135deg, #100b09, #2a150b);
        }

        .co-example__overlay {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, transparent 60%);
        }

        .co-example div {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          padding: 24px;
          pointer-events: none;
        }

        .co-example small,
        .co-example em {
          display: block;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .co-example small {
          color: rgba(255, 255, 255, 0.45);
        }

        .co-example strong {
          display: block;
          margin-top: 4px;
          font-size: 16px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Playfair Display', Georgia, serif;
        }

        .co-example em {
          margin-top: 4px;
          color: var(--brown);
          font-style: normal;
        }

        .co-examples__cta {
          padding: 40px 80px 0;
          text-align: center;
        }

        .co-examples__cta p {
          margin: 0 0 20px;
          color: rgba(255, 255, 255, 0.35);
          font-size: 14px;
        }

        .co-examples__cta button {
          height: 52px;
          padding: 0 44px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          letter-spacing: 4px;
        }

        .co-examples__cta button:hover {
          background: var(--brown);
          border-color: var(--brown);
          color: #fff;
        }

        /* Testimonials Strip */
        .co-testimonials {
          padding: 80px 0;
          background: #fff;
          text-align: center;
        }

        .co-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: min(1140px, 100%);
          margin: 0 auto;
          text-align: left;
        }

        .co-testimonial-card {
          padding: 36px;
          background: var(--cream);
          border-radius: 4px;
          border: 0.5px solid var(--border);
          position: relative;
        }

        .quote-mark {
          position: absolute;
          top: 12px;
          left: 24px;
          font-size: 72px;
          color: rgba(139, 94, 60, 0.1);
          font-family: 'Playfair Display', Georgia, serif;
          line-height: 1;
        }

        .co-testimonial-card p {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text);
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-info strong {
          font-size: 13px;
          font-weight: 600;
          color: var(--dark);
        }

        .author-info span {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Form Wizard */
        .co-form-section {
          padding: 80px 48px;
          background: var(--cream);
        }

        .co-form-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 80px;
          align-items: start;
          width: min(1140px, 100%);
          margin: 0 auto;
        }

        .co-form-wrapper {
          min-width: 0;
          background: #fff;
          padding: 40px;
          border-radius: 4px;
          border: 0.5px solid var(--border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }

        .co-form-wrapper > .co-label {
          margin-bottom: 24px;
        }

        /* Step Indicators */
        .co-step-indicator {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 0 8px;
        }

        .indicator-line {
          position: absolute;
          top: 18px;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(0, 0, 0, 0.08);
          z-index: 1;
        }

        .indicator-progress {
          height: 100%;
          background: var(--brown);
          transition: width 0.4s ease;
        }

        .indicator-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }

        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .indicator-step.active .step-num {
          border-color: var(--brown);
          background: var(--brown);
          color: #fff;
        }

        .indicator-step.current .step-num {
          box-shadow: 0 0 0 4px rgba(139, 94, 60, 0.15);
        }

        .step-label {
          margin-top: 8px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .indicator-step.active .step-label {
          color: var(--dark);
        }

        /* Form viewports & step transitions */
        .co-form-viewport {
          width: 100%;
          overflow: hidden;
        }

        .co-form-slider {
          display: flex;
          width: 300%;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .co-form-step {
          width: 33.333%;
          flex-shrink: 0;
          padding: 2px;
        }

        .step-title {
          font-size: 20px;
          font-weight: 400;
          margin-bottom: 24px;
          color: var(--dark);
          font-family: 'Playfair Display', Georgia, serif;
        }

        .step-nav-buttons {
          display: flex;
          gap: 16px;
          margin-top: 36px;
        }

        .co-nav-btn {
          height: 52px;
          border-radius: 2px;
          font-size: 11px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }

        .next-btn {
          flex: 1;
          background: var(--dark);
          color: #fff;
          border: 0;
        }

        .next-btn:hover {
          background: var(--brown);
        }

        .back-btn {
          width: 120px;
          background: transparent;
          color: var(--text);
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .back-btn:hover {
          border-color: var(--dark);
          color: var(--dark);
        }

        /* Chips styling */
        .co-chip-block,
        .co-budget,
        .co-date,
        .co-upload {
          margin-bottom: 28px;
        }

        .co-chip-block > span,
        .co-budget > span,
        .co-date > span,
        .co-upload > span {
          display: block;
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .co-chip-block div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .co-chip {
          padding: 10px 18px;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 2px;
          background: #fff;
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .co-chip:hover {
          border-color: rgba(0, 0, 0, 0.25);
          color: var(--dark);
        }

        .co-chip.selected {
          border-color: var(--brown);
          background: var(--brown);
          color: #fff;
          animation: pulseMini 0.3s ease;
        }

        @keyframes pulseMini {
          0% { transform: scale(1); }
          50% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }

        /* Smart prompts Suggestion */
        .smart-prompt-box {
          background: rgba(139, 94, 60, 0.04);
          border-left: 2px solid var(--brown);
          padding: 18px;
          margin-bottom: 28px;
          border-radius: 0 4px 4px 0;
        }

        .smart-prompt-box strong {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--brown);
          margin-bottom: 6px;
        }

        .smart-prompt-box p {
          font-size: 12px;
          line-height: 1.6;
          color: #5a4b41;
          margin: 0 0 12px;
        }

        .use-template-btn {
          background: transparent;
          border: 0;
          padding: 0;
          color: var(--brown);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          border-bottom: 1px dashed var(--brown);
          transition: color 0.2s;
        }

        .use-template-btn:hover {
          color: var(--dark-brown);
        }

        /* Floating Input Fields */
        .custom-order-page :global(.co-field) {
          position: relative;
          display: block;
          margin-bottom: 28px;
          transition: all 0.3s ease;
        }

        .custom-order-page :global(.co-floating-label) {
          position: absolute;
          top: 22px;
          left: 0;
          transform: translateY(-50%);
          color: #ccc;
          font-size: 14px;
          pointer-events: none;
          transition: all 0.2s ease;
        }

        .custom-order-page :global(.co-floating-label em) {
          color: var(--brown);
          font-style: normal;
        }

        .custom-order-page :global(.co-field input),
        .custom-order-page :global(.co-field textarea) {
          width: 100%;
          border: 0;
          border-bottom: 1.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 0;
          background: transparent;
          color: var(--dark);
          outline: none;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .custom-order-page :global(.co-field input) {
          height: 48px;
          padding: 14px 0 8px;
        }

        .custom-order-page :global(.co-field textarea) {
          min-height: 120px;
          padding: 18px 0 8px;
          line-height: 1.7;
          resize: vertical;
        }

        .custom-order-page :global(.co-field input:focus),
        .custom-order-page :global(.co-field textarea:focus) {
          border-bottom-color: var(--brown);
        }

        .custom-order-page :global(.co-field input:focus ~ .co-floating-label),
        .custom-order-page :global(.co-field input:not(:placeholder-shown) ~ .co-floating-label),
        .custom-order-page :global(.co-field textarea:focus ~ .co-floating-label),
        .custom-order-page :global(.co-field textarea:not(:placeholder-shown) ~ .co-floating-label) {
          top: -8px;
          transform: translateY(0);
          color: var(--brown);
          font-size: 11px;
          letter-spacing: 1px;
        }

        .custom-order-page :global(.co-helper),
        .custom-order-page :global(.co-error),
        .co-date small,
        .co-upload small {
          display: block;
          margin-top: 6px;
          font-size: 11px;
        }

        .custom-order-page :global(.co-helper),
        .co-date small,
        .co-upload small {
          color: var(--muted);
        }

        .custom-order-page :global(.co-error),
        .co-submit-error {
          color: #c0392b;
          font-weight: 500;
        }

        .custom-order-page :global(.co-counter) {
          position: absolute;
          right: 0;
          bottom: -16px;
          color: #ccc;
          font-size: 10px;
        }

        .co-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .co-budget input[type="range"] {
          width: 100%;
          height: 3px;
          appearance: none;
          border-radius: 0;
          background: linear-gradient(to right, var(--brown) 0%, var(--brown) var(--progress), #e0e0e0 var(--progress), #e0e0e0 100%);
          outline: 0;
        }

        .co-budget input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: var(--dark);
          box-shadow: 0 0 0 1px var(--dark);
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .co-budget input[type="range"]:active::-webkit-slider-thumb {
          transform: scale(1.3);
        }

        .co-budget div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 12px;
        }

        .co-budget small {
          font-size: 10px;
          color: var(--muted);
        }

        .co-budget strong {
          font-size: 18px;
          font-weight: 400;
          letter-spacing: -0.3px;
        }

        .co-budget em {
          display: block;
          margin-top: 6px;
          color: var(--text);
          font-size: 11px;
          font-style: normal;
          text-align: center;
        }

        .co-date input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 2px;
          background: var(--cream);
          color: var(--dark);
          color-scheme: light;
          outline: 0;
        }

        .co-date input:focus {
          border-color: var(--brown);
        }

        .co-upload > button {
          width: 100%;
          padding: 24px 20px;
          border: 1.5px dashed rgba(0, 0, 0, 0.15);
          border-radius: 2px;
          background: #fff;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .co-upload > button:hover {
          border-color: var(--brown);
          background: rgba(139, 94, 60, 0.03);
        }

        .co-upload :global(svg) {
          width: 24px;
          height: 24px;
          margin: 0 auto 8px;
          fill: none;
          stroke: #ccc;
          stroke-width: 1.5;
        }

        .co-upload strong,
        .co-upload em {
          display: block;
        }

        .co-upload strong {
          color: #888;
          font-size: 13px;
          font-weight: 400;
        }

        .co-upload em {
          color: var(--muted);
          font-size: 12px;
          font-style: normal;
        }

        .co-thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .co-thumbs span {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .co-thumbs img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 2px;
        }

        .co-thumbs button {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 18px;
          height: 18px;
          border: 0;
          border-radius: 50%;
          background: #c0392b;
          color: #fff;
          font-size: 12px;
          cursor: pointer;
        }

        .co-submit {
          flex: 1;
          height: 52px;
          border: 2px solid var(--dark);
          border-radius: 2px;
          background: var(--dark);
          color: #fff;
          font-size: 12px;
          letter-spacing: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .co-submit:hover:not(:disabled) {
          background: transparent;
          color: var(--dark);
        }

        .co-submit--loading {
          pointer-events: none;
          background: rgba(0, 0, 0, 0.5);
        }

        .co-submit--success {
          border-color: #2e7d32;
          background: #2e7d32;
        }

        .co-submit--error {
          border-color: #c0392b;
          background: #c0392b;
        }

        .co-privacy {
          margin: 14px 0 0;
          color: #ccc;
          font-size: 11px;
          text-align: center;
        }

        /* Sidebar summary */
        .co-side {
          position: sticky;
          top: 80px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .co-side__response,
        .co-summary,
        .co-included,
        .co-direct {
          padding: 24px;
          border-radius: 2px;
        }

        .co-side__response {
          display: flex;
          gap: 14px;
          background: var(--dark);
          color: rgba(255, 255, 255, 0.85);
        }

        .co-side__response small {
          display: block;
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
        }

        .co-side__response strong {
          display: block;
          margin: 2px 0 10px;
          font-size: 22px;
          font-weight: 300;
        }

        .co-side__response p {
          margin: 0;
          color: rgba(255, 255, 255, 0.25);
          font-size: 11px;
          line-height: 1.65;
        }

        .co-summary,
        .co-direct {
          border: 0.5px solid var(--border);
          background: #fff;
        }

        .co-summary p,
        .co-included p {
          margin: 0 0 18px;
          font-size: 9px;
          letter-spacing: 3px;
          color: var(--muted);
          text-transform: uppercase;
        }

        .co-summary dl {
          margin: 0;
        }

        .co-summary dl div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
          font-size: 12px;
        }

        .co-summary dt {
          color: var(--muted);
        }

        .co-summary dd {
          margin: 0;
          color: var(--dark);
          text-align: right;
          font-weight: 500;
        }

        .co-summary > div {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 0.5px solid var(--border);
        }

        .co-summary > div small,
        .co-summary > div em {
          display: block;
          color: var(--muted);
          font-size: 10px;
          font-style: normal;
        }

        .co-summary > div strong {
          display: block;
          margin: 3px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .co-included {
          background: var(--card-bg);
        }

        .co-included span {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 10px;
          color: var(--text);
          font-size: 12px;
          line-height: 1.6;
        }

        .co-included :global(svg) {
          width: 12px;
          height: 12px;
          margin-top: 3px;
          flex-shrink: 0;
          fill: none;
          stroke: var(--brown);
          stroke-width: 2;
        }

        .co-direct {
          background: var(--cream);
        }

        .co-direct h3 {
          margin: 0 0 4px;
          font-size: 13px;
          font-weight: 400;
        }

        .co-direct p {
          margin: 0 0 16px;
          color: #888;
          font-size: 12px;
          line-height: 1.6;
        }

        .co-direct a {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          border: 0.5px solid var(--dark);
          border-radius: 2px;
          color: var(--dark);
          font-size: 10px;
          letter-spacing: 3px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .co-direct a:hover {
          background: var(--dark);
          color: #fff;
        }

        /* Success screen enhancements */
        .co-success {
          max-width: 600px;
          margin: 0 auto;
          padding: 80px 40px;
          text-align: center;
          background: #fff;
          border-radius: 4px;
          border: 0.5px solid var(--border);
          position: relative;
        }

        .co-success svg {
          width: 80px;
          height: 80px;
          fill: none;
          stroke: #2e7d32;
          stroke-width: 2;
          margin: 0 auto;
        }

        .co-success circle {
          stroke-dasharray: 200;
          animation: drawCircle 0.8s ease both;
        }

        .co-success path {
          stroke-dasharray: 100;
          animation: drawCheck 0.8s ease 0.45s both;
        }

        .co-success h2 {
          margin: 24px 0 12px;
          font-size: 32px;
          font-weight: 300;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .co-success p {
          color: var(--text);
          line-height: 1.7;
          font-size: 14px;
        }

        .timeline-success {
          margin: 40px 0;
          text-align: left;
          background: var(--cream);
          padding: 24px;
          border-radius: 4px;
        }

        .timeline-success h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--brown);
        }

        .success-timeline-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .success-step {
          display: flex;
          flex-direction: column;
        }

        .success-step strong {
          font-size: 13px;
          color: var(--dark);
        }

        .success-step span {
          font-size: 12px;
          color: var(--text);
          margin-top: 4px;
          line-height: 1.5;
        }

        .co-success small {
          display: block;
          margin-bottom: 32px;
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 3px;
        }

        .success-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .whatsapp-share-btn,
        .secondary-success-btn {
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 28px;
          border-radius: 2px;
          font-size: 11px;
          letter-spacing: 2px;
          transition: all 0.25s ease;
          font-weight: 500;
        }

        .whatsapp-share-btn {
          background: #25d366;
          color: #fff;
          border: 0;
        }

        .whatsapp-share-btn:hover {
          background: #20ba5a;
        }

        .secondary-success-btn {
          background: transparent;
          color: var(--dark);
          border: 1px solid var(--dark);
        }

        .secondary-success-btn:hover {
          background: var(--dark);
          color: #fff;
        }

        /* After Submit process grid */
        .co-after {
          padding: 80px 48px;
          background: var(--black);
          text-align: center;
        }

        .co-after h2 {
          color: rgba(255, 255, 255, 0.75);
        }

        .co-after > div {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          width: min(1140px, 100%);
          margin: 0 auto;
          text-align: left;
        }

        .co-after article {
          padding: 40px 32px;
          background: #0f0f0d;
        }

        .co-after article > span {
          display: block;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.04);
          font-size: 64px;
          font-weight: 300;
          letter-spacing: -4px;
          line-height: 1;
        }

        .co-after h3 {
          margin: 0 0 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          font-weight: 400;
        }

        .co-after article p {
          margin: 0;
          color: rgba(255, 255, 255, 0.25);
          font-size: 12px;
          line-height: 1.85;
        }

        .co-after article small {
          display: inline-block;
          margin-top: 16px;
          padding: 4px 12px;
          border: 0.5px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.2);
          font-size: 9px;
          letter-spacing: 2px;
        }

        /* Grouped FAQs Section */
        .co-faq {
          padding: 80px 48px;
          background: var(--cream);
        }

        .co-faq > .co-label {
          width: min(760px, 100%);
          margin: 0 auto 40px;
        }

        .co-faq-layout {
          width: min(760px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .co-faq-group-title {
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 20px;
          color: var(--brown);
          font-family: 'Playfair Display', Georgia, serif;
          border-bottom: 1.5px solid rgba(139, 94, 60, 0.15);
          padding-bottom: 8px;
        }

        .co-faq-list {
          display: flex;
          flex-direction: column;
        }

        .co-faq-article {
          border-bottom: 0.5px solid var(--border);
        }

        .co-faq-q-btn {
          width: 100%;
          padding: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .co-faq-q-btn span {
          font-size: 14px;
          font-weight: 500;
          color: var(--dark);
        }

        .co-faq-q-btn em {
          color: var(--brown);
          font-size: 20px;
          font-style: normal;
          font-weight: 300;
        }

        .faq-content-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease-out;
        }

        .faq-content-wrap.open {
          grid-template-rows: 1fr;
        }

        .faq-content-inner {
          overflow: hidden;
        }

        .faq-content-inner p {
          margin: 0;
          padding-bottom: 20px;
          color: var(--text);
          font-size: 13px;
          line-height: 1.8;
        }

        .co-faq-cta {
          margin-top: 56px;
          text-align: center;
        }

        .co-faq-cta p {
          font-size: 13px;
          color: var(--text);
          margin-bottom: 16px;
        }

        .co-faq-cta a {
          display: inline-flex;
          height: 48px;
          align-items: center;
          padding: 0 28px;
          border: 1px solid var(--dark);
          color: var(--dark);
          font-size: 10px;
          letter-spacing: 2px;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .co-faq-cta a:hover {
          background: var(--dark);
          color: #fff;
        }

        /* Final CTA */
        .co-final {
          padding: 80px 48px;
          background: var(--cream);
          text-align: center;
        }

        .co-final h2 {
          margin-bottom: 12px;
          color: var(--dark);
          font-size: 36px;
        }

        .co-final p {
          max-width: 380px;
          margin: 0 auto 36px;
          color: #888;
          font-size: 14px;
          line-height: 1.7;
        }

        .co-final div {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .co-final button,
        .co-final a {
          height: 56px;
          padding: 0 32px;
          display: inline-flex;
          align-items: center;
          border: 0.5px solid var(--dark);
          font-size: 11px;
          letter-spacing: 4px;
          font-weight: 500;
        }

        .co-final button {
          background: var(--dark);
          color: #fff;
        }

        .co-final button:hover {
          background: var(--brown);
          border-color: var(--brown);
        }

        .co-final a {
          background: transparent;
          color: var(--dark);
        }

        .co-final a:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .co-final ul {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          margin: 40px 0 0;
          padding: 0;
          list-style: none;
        }

        .co-final li {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .co-final li::before {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--brown);
        }

        /* Floating Widgets */
        .co-floating-whatsapp {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #25d366;
          color: #fff;
          padding: 12px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
          z-index: 100;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .co-floating-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 211, 102, 0.4);
        }

        .co-mobile-sticky-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: #fff;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
          z-index: 99;
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.04);
        }

        .bar-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .sticky-cat {
          font-size: 12px;
          font-weight: 500;
          color: var(--dark);
        }

        .sticky-budget {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        .sticky-action-btn {
          height: 44px;
          background: var(--dark);
          color: #fff;
          border: 0;
          padding: 0 20px;
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 500;
          cursor: pointer;
        }

        .sticky-action-btn:hover {
          background: var(--brown);
        }

        /* Error Shake */
        .shake {
          animation: shakeKey 0.4s ease;
        }

        @keyframes shakeKey {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* Keyframes */
        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes scan {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(350%);
          }
        }

        @keyframes drawCircle {
          from {
            stroke-dashoffset: 200;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCheck {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Responsive Layouts */
        @media (max-width: 900px) {
          .co-hero {
            height: 85vh;
            min-height: 500px;
          }

          .co-hero__image-wrap {
            width: 100%;
            opacity: 0.2;
          }

          .co-hero__top-label,
          .co-scroll {
            display: none;
          }

          .co-hero__content {
            left: 24px;
            right: 24px;
            bottom: 88px;
          }

          .co-hero h1 {
            font-size: 36px;
          }

          .co-hero__content p {
            font-size: 12px;
          }

          .co-hero__actions,
          .co-final div {
            flex-direction: column;
            align-items: stretch;
          }

          .co-hero__actions > button:first-child,
          .co-final button,
          .co-final a {
            justify-content: center;
            width: 100%;
          }

          .co-response {
            left: 24px;
          }

          .co-process,
          .co-categories,
          .co-form-section,
          .co-testimonials,
          .co-after,
          .co-faq,
          .co-final {
            padding: 56px 24px;
          }

          .co-shell {
            width: 100%;
          }

          .co-steps,
          .co-category-grid,
          .co-form-layout,
          .co-testimonials-grid,
          .co-after > div {
            grid-template-columns: 1fr;
          }

          .co-steps {
            gap: 24px;
          }

          .co-steps__line {
            display: none;
          }

          .co-category-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .co-examples__header,
          .co-examples__cta {
            padding-left: 24px;
            padding-right: 24px;
          }

          .co-example-grid {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, 220px);
          }

          .co-example--1,
          .co-example--6 {
            grid-row: auto;
            grid-column: auto;
          }

          /* Removed column-reverse - Form first on mobile */
          .co-form-layout {
            display: flex;
            flex-direction: column;
            gap: 40px;
          }

          .co-side {
            position: static;
          }

          .co-two {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .co-after > div {
            gap: 2px;
          }

          .co-form-wrapper {
            padding: 24px;
          }
        }

        @media (max-width: 520px) {
          .co-category-grid {
            grid-template-columns: 1fr;
          }

          .co-process h2,
          .co-examples__header h2,
          .co-testimonials h2,
          .co-after h2,
          .co-final h2 {
            font-size: 26px;
          }

          .co-success {
            padding: 56px 20px;
          }

          .co-floating-whatsapp {
            bottom: 88px;
            right: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .custom-order-page :global(.reveal),
          .custom-order-page :global(.reveal-left),
          .custom-order-page :global(.reveal-right),
          .co-hero__top-label,
          .co-eyebrow,
          .co-hero h1,
          .co-hero__content p,
          .co-hero__actions,
          .co-response,
          .co-scroll {
            opacity: 1;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let heroImage = null;
  let examples = [];
  const categoryImages = {};

  try {
    const { readSiteImageSlotMap } = await import("../lib/site-images");
    const siteImageSlots = await readSiteImageSlotMap();
    const customOrdersHero = siteImageSlots?.custom_orders_hero?.resolved_url || null;
    if (customOrdersHero) {
      heroImage = {
        src: customOrdersHero,
        alt: "SharonCraft custom order inspiration",
      };
    }
  } catch (_error) {
    heroImage = null;
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: customExamples, error: customError } = await supabase
        .from("products")
        .select("id,name,category,images,is_visible,is_featured")
        .eq("is_custom_example", true)
        .eq("is_visible", true)
        .limit(6);

      if (!customError && customExamples?.length) {
        examples = customExamples;
      } else {
        const { data: fallback } = await supabase
          .from("products")
          .select("id,name,category,images,is_visible,is_featured")
          .eq("is_visible", true)
          .eq("is_featured", true)
          .limit(6);
        examples = Array.isArray(fallback) ? fallback : [];
      }

      // Fetch one image per category for category cards
      const cats = ["Jewellery", "Accessories", "African Wear", "Home & Living", "Art & Craft", "Gift Set"];
      for (const cat of cats) {
        const { data: catProduct } = await supabase
          .from("products")
          .select("images")
          .eq("category", cat)
          .eq("is_visible", true)
          .limit(1);
        if (catProduct && catProduct.length > 0) {
          const img = getImageFromProduct(catProduct[0]);
          if (img) categoryImages[cat] = img;
        }
      }
    } catch (_error) {
      examples = [];
    }
  }

  return {
    props: {
      heroImage,
      examples,
      categoryImages,
    },
  };
}
