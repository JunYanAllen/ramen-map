import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "今天吃什麼？ - 隨機美食與附近餐廳搜尋",
  description: "不知道今天要吃什麼嗎？使用我們的隨機美食選擇器，幫您決定晚餐！自動搜尋附近的美食餐廳，提供評價、菜單與導航資訊。",
  keywords: ["美食", "餐廳", "晚餐", "午餐", "隨機選擇", "附近美食", "拉麵", "火鍋", "燒肉", "台北美食"],
  openGraph: {
    title: "今天吃什麼？ - 隨機美食與附近餐廳搜尋",
    description: "不知道今天要吃什麼嗎？使用我們的隨機美食選擇器，幫您決定晚餐！自動搜尋附近的美食餐廳，提供評價、菜單與導航資訊。",
    type: "website",
    locale: "zh_TW",
    siteName: "今天吃什麼？",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
