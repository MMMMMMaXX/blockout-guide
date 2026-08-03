/** 文件职责：为尚未进入实现阶段的正式栏目提供诚实、不可索引的框架入口。 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const sections = {
  "board-matcher": [
    "Board matcher",
    "Phase 4 will match a cropped screenshot to the closest board variants.",
  ],
} as const;

type Section = keyof typeof sections;
type PageProps = { params: Promise<{ section: string }> };

/** 显式枚举产品方案中的栏目，不让任意字符串变成内容页。 */
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

/** 未完成栏目保持 noindex，避免框架页进入搜索结果。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  if (!(section in sections)) return {};
  const [title, description] = sections[section as Section];
  return {
    title,
    description,
    alternates: { canonical: `/en/${section}/` },
    robots: "noindex, follow",
  };
}

/** 渲染统一的规划状态，后续任务以专属页面替换对应路由。 */
export default async function PlannedSectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  const [title, description] = sections[section as Section];
  return (
    <div className="shell page planned-page">
      <p className="eyebrow">PLANNED PRODUCT AREA</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="planned-card">
        <span>Not published</span>
        <h2>The route is reserved for the Phase 4 board-matching feature.</h2>
        <p>
          This page is intentionally excluded from indexing until it has validated, useful content.
        </p>
        <Link className="button-link" href="/en/">
          Back to the framework home
        </Link>
      </div>
    </div>
  );
}
