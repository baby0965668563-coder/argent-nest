"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LikeButton({
  productId,
  initialLikes = 0,
}: {
  productId: number;
  initialLikes?: number;
}) {
  const storageKey = `argent_like_${productId}`;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  async function handleLike(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (liked || loading) return;

    setLoading(true);

    const nextLikes = likes + 1;

    const { error } = await supabase
      .from("products")
      .update({ likes: nextLikes })
      .eq("id", productId);

    if (!error) {
      setLikes(nextLikes);
      setLiked(true);
      localStorage.setItem(storageKey, "true");
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || loading}
      className={`mt-2 flex w-full items-center justify-center gap-1 rounded-full border py-2 text-xs transition ${
        liked
          ? "border-[#d8c5b0] bg-[#f8f5f0] text-[#8b6f5c]"
          : "border-[#eaded4] bg-white text-[#6b5c50]"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{likes} 人收藏</span>
    </button>
  );
}