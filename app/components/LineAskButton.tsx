"use client";

interface Props {
  product: any;
}

export default function LineAskButton({ product }: Props) {
  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product.id}`
      : "";

  const message = [
    `我想詢問：${product.name}`,
    `價格：NT$ ${Number(product.price || 0).toLocaleString()}`,
    product.category ? `分類：${product.category}` : "",
    productUrl ? `商品連結：${productUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-full items-center justify-center rounded-full border border-[#d8c5b0] bg-white px-4 py-3 text-sm font-medium text-[#6b5c50] transition hover:bg-[#f8f5f0]"
    >
      LINE 詢問 ☁️
    </a>
  );
}