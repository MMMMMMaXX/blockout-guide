/** 文件职责：只在开发环境暴露设计系统演示，生产环境返回 404。 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemShowcase } from "@/components/design-system-showcase";

export const metadata: Metadata = {
  title: "Design system",
  robots: "noindex, nofollow",
};

/** 生产构建保留路由合同但拒绝输出演示正文，避免内部样例公开。 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DesignSystemShowcase />;
}
