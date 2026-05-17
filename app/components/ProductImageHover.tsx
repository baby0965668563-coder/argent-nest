"use client";

import { useState } from "react";

export default function ProductImageHover({
  images,
  alt,
  soldOut = false,
}: {
  images: string[];
  alt: string;
  soldOut?: boolean;
}) {
  const [index, setIndex] = useState(0);

  const cleanImages = images.filter(Boolean);
  const currentImage = cleanImages[index] || cleanImages[0] || "";

  function nextImage() {
    if (cleanImages.length <= 1) return;
    setIndex((prev) => (prev + 1) % cleanImages.length);
  }

  function showSecondImage() {
    if (cleanImages.length > 1) {
      setIndex(1);
    }
  }

  function showFirstImage() {
    setIndex(0);
  }

  if (!currentImage) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-[#b49a88]">
        No Image
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={showSecondImage}
      onMouseLeave={showFirstImage}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        nextImage();
      }}
    >
      <img
        src={currentImage}
        alt={alt}
        className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
          soldOut ? "opacity-60 grayscale" : ""
        }`}
      />

      {cleanImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {cleanImages.slice(0, 5).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}