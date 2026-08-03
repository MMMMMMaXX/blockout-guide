/** 文件职责：定义全站 HTML 外壳、默认 SEO 元信息和基础字体。 */
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blockout.stratlore.com"),
  title: {
    default: "Block Out! Guides — Find the right board and solution",
    template: "%s | Block Out! Guides",
  },
  description:
    "Mobile-first Block Out! level guides with board variants, videos and verified solution notes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

/** 渲染所有路由共享的文档结构；语言级壳层在 /en 下维护导航与页脚。 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
