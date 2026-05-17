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
  const [hovered, setHovered] = useState(false);

  const firstImage = images?.[0] || "";
  const secondImage = images?.[1] || firstImage;
  const currentImage = hovered ? secondImage : firstImage;

  if (!currentImage) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-[#b49a88]">
        No Image
      </div>
    );
  }

  return (
    <img
      src={currentImage}
      alt={alt}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
        soldOut ? "opacity-60 grayscale" : ""
      }`}
    />
  );
}