"use client";

import { useEffect, useState } from "react";

const banners = [
  {
    title: "Argent Nest 🥛🤍",
    subtitle: "療癒系女孩選物店",
    desc: "把讓人心情變好的小東西，都慢慢放進這裡。",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    button: "開始逛逛",
    href: "#hot",
  },
  {
    title: "NEW ARRIVAL ☁️",
    subtitle: "最近新上架",
    desc: "卡通萌物、女孩小物、韓系穿搭，每次逛都有一點小驚喜。",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    button: "看新品",
    href: "#hot",
  },
  {
    title: "Little Healing World",
    subtitle: "豬豬的療癒小世界",
    desc: "累的時候，就挑一個讓自己開心的小可愛回家。",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
    button: "探索分類",
    href: "#categories",
  },
];

export default function HomeBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const banner = banners[index];

  return (
    <section className="px-5 py-8 md:px-10 md:py-12">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#efe7de] shadow-[0_12px_40px_rgba(70,50,35,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8f5f0] via-[#f8f5f0]/85 to-transparent z-10" />

        <img
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="relative z-20 px-8 py-16 md:px-16 md:py-24">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#a08060]">
            {banner.subtitle}
          </p>

          <h2 className="mb-6 max-w-xl text-5xl font-black leading-[1.1] tracking-tight text-[#2e2e2e] md:text-6xl">
            {banner.title}
          </h2>

          <p className="mb-8 max-w-md text-[15px] leading-8 text-[#6b5c50]">
            {banner.desc}
          </p>

          <a
            href={banner.href}
            className="inline-block rounded-full bg-[#2e2e2e] px-8 py-4 text-sm font-medium text-white transition hover:scale-105"
          >
            {banner.button}
          </a>

          <div className="mt-8 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  index === i ? "w-8 bg-[#2e2e2e]" : "w-2 bg-[#c9b8a8]"
                }`}
                aria-label={`切換 Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}