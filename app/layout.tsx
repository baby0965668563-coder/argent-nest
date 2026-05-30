import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Argent Nest 🥛🤍｜療癒系女孩選物店",
  description:
    "Argent Nest 是療癒系女孩選物店，主打韓系選品、卡通萌物、女孩日常小物、飾品包包、花束甜點與微辣韓系穿搭。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="bg-[#faf7f2] text-[#4b4038]">
        <Header />
        {children}
      </body>
    </html>
  );
}