"use client";

export default function LineAskButton({
  product,
}: {
  product: any;
}) {
  const soldOut = product?.is_sold_out === true;

  const lineMessage = `我想詢問：${product?.name || ""}`;

  const lineUrl = `https://line.me/R/oaMessage/@929santn/?${encodeURIComponent(
    lineMessage
  )}`;

  if (soldOut) {
    return (
      <button
        disabled
        className="mt-2 w-full rounded-full bg-gray-300 py-2 text-xs text-white"
      >
        已售完
      </button>
    );
  }

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block w-full rounded-full bg-[#06C755] py-2 text-center text-xs font-semibold text-white"
    >
      LINE 詢問
    </a>
  );
}