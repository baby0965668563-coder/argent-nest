"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LikeButton({
  productId,
  initialLikes = 0,
}: {
  productId: number;
  initialLikes?: number;
}) {
  const router = useRouter();

  const [liked, setLiked] =
    useState(false);

  const [likes, setLikes] =
    useState(initialLikes);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    checkLiked();
  }, [productId]);

  async function checkLiked() {
    try {
      const savedUser =
        localStorage.getItem(
          "argent_user"
        );

      if (!savedUser) {
        setLiked(false);
        return;
      }

      const user =
        JSON.parse(savedUser);

      const {
        data,
      } = await supabase
        .from("wishlist")
        .select("id")
        .eq(
          "user_line_id",
          user.line_user_id
        )
        .eq(
          "product_id",
          productId
        )
        .maybeSingle();

      setLiked(!!data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLike(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();

    e.stopPropagation();

    if (loading) return;

    const savedUser =
      localStorage.getItem(
        "argent_user"
      );

    if (!savedUser) {
      const goLogin =
        confirm(
          "請先登入會員後再收藏 ☁️"
        );

      if (goLogin) {
        router.push("/login");
      }

      return;
    }

    try {
      setLoading(true);

      const user =
        JSON.parse(savedUser);

      // 已收藏 → 取消收藏
      if (liked) {
        const { error } =
          await supabase
            .from("wishlist")
            .delete()
            .eq(
              "user_line_id",
              user.line_user_id
            )
            .eq(
              "product_id",
              productId
            );

        if (!error) {
          setLiked(false);

          setLikes((prev) =>
            Math.max(0, prev - 1)
          );

          await supabase
            .from("products")
            .update({
              likes:
                Math.max(
                  0,
                  likes - 1
                ),
            })
            .eq(
              "id",
              productId
            );
        }

        setLoading(false);

        return;
      }

      // 新增收藏
      const { error } =
        await supabase
          .from("wishlist")
          .insert([
            {
              user_line_id:
                user.line_user_id,

              product_id:
                productId,
            },
          ]);

      if (!error) {
        const nextLikes =
          likes + 1;

        setLikes(nextLikes);

        setLiked(true);

        await supabase
          .from("products")
          .update({
            likes: nextLikes,
          })
          .eq(
            "id",
            productId
          );
      }
    } catch (err) {
      console.error(err);

      alert("收藏失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className={`mt-2 flex w-full items-center justify-center gap-1 rounded-full border py-2 text-xs transition ${
        liked
          ? "border-[#d8c5b0] bg-[#f8f5f0] text-[#8b6f5c]"
          : "border-[#eaded4] bg-white text-[#6b5c50]"
      }`}
    >
      <span>
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {likes} 人收藏
      </span>
    </button>
  );
}