import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Argent Nest 🥛🤍｜療癒系女孩選物店",
  description:
    "Argent Nest 是療癒系女孩選物店，主打韓系選品、卡通萌物、女孩日常小物、飾品包包、花束甜點與微辣韓系穿搭。",
  keywords: [
    "Argent Nest",
    "療癒系選物店",
    "韓系穿搭",
    "三麗鷗",
    "吉伊卡哇",
    "迪士尼",
    "女孩小物",
    "飾品",
    "包包",
    "花束",
    "甜點",
  ],
  openGraph: {
    title: "Argent Nest 🥛🤍｜療癒系女孩選物店",
    description:
      "把讓人心情變好的小東西，慢慢放進這裡。韓系選品、卡通萌物、女孩日常小物、花束甜點。",
    siteName: "Argent Nest",
    type: "website",
    locale: "zh_TW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Argent Nest 🥛🤍｜療癒系女孩選物店",
    description:
      "韓系選品、卡通萌物、女孩日常小物、花束甜點與微辣韓系穿搭。",
  },
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
        <main>{children}</main>
      </body>
    </html>
  );
}