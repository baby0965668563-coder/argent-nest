"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/app/components/AddToCartButton";
import LikeButton from "@/app/components/LikeButton";

type OptionGroup = {
  name: string;
  values: string[];
};

function parseOptions(optionsText: string): OptionGroup[] {
  if (!optionsText) return [];

  return optionsText
    .split("\n")
    .map((line) => {
      const parts = line.includes("|")
        ? line.split("|")
        : line.split("｜");

      if (parts.length < 2) return null;

      return {
        name: parts[0].trim(),
        values: parts
          .slice(1)
          .join("｜")
          .split(/[、,，]/)
          .map((v) => v.trim())
          .filter(Boolean),
      };
    })
    .filter((item): item is OptionGroup => item !== null);
}

export default function ProductPage() {
  const params = useParams();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setProduct(data);

    if (data?.images) {
      const imgs =
        typeof data.images === "string" ? data.images.split(",") : data.images;

      if (imgs?.length > 0) {
        setSelectedImage(imgs[0].trim());
      }
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <p className="text-gray-500">商品載入中...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <p className="text-gray-500">找不到商品</p>
      </main>
    );
  }

  const images =
    typeof product.images === "string"
      ? product.images
          .split(",")
          .map((img: string) => img.trim())
          .filter(Boolean)
      : product.images || [];

  const optionGroups = parseOptions(product.options || "");

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-gray-400">
                無商品圖片
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img: string) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border ${
                    selectedImage === img
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {product.category || "Argent Nest Select"}
              </p>

              <h1 className="text-2xl font-semibold leading-relaxed">
                {product.name}
              </h1>
            </div>

            <LikeButton productId={product.id} />
          </div>

          <p className="text-2xl font-semibold mt-5">
            NT$ {product.price}
          </p>

          {optionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              {optionGroups.map((group) => (
                <div key={group.name}>
                  <p className="font-semibold mb-3">{group.name}</p>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const selected = selectedOptions[group.name] === value;

                      return (
                        <button
                          key={value}
                          onClick={() =>
                            setSelectedOptions({
                              ...selectedOptions,
                              [group.name]: value,
                            })
                          }
                          className={`px-4 py-2 rounded-full border text-sm transition ${
                            selected
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="font-semibold mb-3">商品描述</h2>
              <p className="text-gray-600 leading-7 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton
              product={product}
              selectedOptions={selectedOptions}
            />
          </div>
        </section>
      </div>
    </main>
  );
}