"use client";

interface Props {
  product: any;
}

export default function LineAskButton({ product }: Props) {
  const message = `我想詢問：${product.name}`;
  
  const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block w-full rounded-full border border-[#06C755] bg-[#06C755] py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
    >
      LINE 詢問 ☁️
    </a>
  );
}