"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WishlistPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const savedUser = localStorage.getItem("argent_user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user?.line_user_id) {
        router.push("/login");
        return;
      }

      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_line_id", user.line_user_id);

      if (wishlistError) {
        console.error(wishlistError);
        setProducts([]);
        return;
      }

      const productIds = (wishlistData || []).map((item) => item.product_id);

      if (productIds.length === 0) {
        setProducts([]);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true);

      if (productError) {
        console.error(productError);
        setProducts([]);
        return;
      }

      setProducts(productData || []);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("argent_user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  function getImage(product: any) {
    return (
      product?.image ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : "")
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-[#6b5c50]">收藏載入中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="text-5xl">🤍</div>

          <h1 className="mt-4 text-3xl font-bold text-[#4b4038]">
            我的收藏
          </h1>

          <p className="mt-3 text-sm text-[#8c7b70]">
            這裡放著妳喜歡的小可愛 ☁️
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#4b4038]">
              目前還沒有收藏商品 ☁️
            </p>

            <p className="mt-3 text-sm leading-7 text-[#8c7b70]">
              看到喜歡的商品可以點愛心收藏起來。
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 rounded-full bg-[#2e2e2e] px-6 py-3 text-sm text-white"
            >
              回首頁逛逛
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.map((product) => {
              const image = getImage(product);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="overflow-hidden rounded-[2rem] bg-white text-left shadow-sm transition hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-[#f4eee8]">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#b49a88]">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#b58b6b]">
                      {product.category}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#4b4038]">
                      {product.name}
                    </p>

                    <p className="mt-2 font-bold text-[#8b6f5c]">
                      NT$ {Number(product.price || 0).toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/member")}
          className="mt-8 w-full rounded-full border border-[#d8c5b0] bg-white py-4 text-sm text-[#6b5c50]"
        >
          返回會員中心
        </button>
      </div>
    </main>
  );
}