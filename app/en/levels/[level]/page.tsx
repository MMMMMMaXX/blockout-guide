/** 文件职责：实现关卡详情模板，并按内容状态控制索引资格。 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LevelDetailView } from "@/components/level-detail-view";
import { FloatingLevelBar } from "@/components/floating-level-bar";
import type { LevelSearchItem } from "@/components/level-search-overlay";
import { getPublishedLevelByNumber, getPublishedLevels } from "@/lib/content/level-repository";
import { buildAlternates } from "@/lib/seo/metadata";
import { buildLevelJsonLd } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ level: string }> };

/** 仅为已存在的内容实体生成已知参数，不预建 1–1000 空壳页面。 */
export function generateStaticParams() {
  return getPublishedLevels("en").map((level) => ({ level: String(level.levelNumber) }));
}

/** 草稿详情显式 noindex；发布后才提供稳定 canonical。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level: rawLevel } = await params;
  const level = getPublishedLevelByNumber("en", Number(rawLevel));
  if (!level) return {};
  const translations = getPublishedLevels("zh-cn")
    .filter((candidate) => candidate.levelNumber === level.levelNumber)
    .map((candidate) => ({
      locale: candidate.locale,
      path: `/zh-cn/levels/${candidate.levelNumber}/`,
    }));
  return {
    title: level.title,
    description: level.summary,
    alternates: buildAlternates(`/en/levels/${level.levelNumber}/`, translations),
    robots: "index, follow",
  };
}

/** 页面消费 Repository 结果，不直接耦合 content 文件路径。 */
export default async function LevelDetailPage({ params }: PageProps) {
  const { level: rawLevel } = await params;
  const level = getPublishedLevelByNumber("en", Number(rawLevel));
  if (!level) notFound();
  const publishedLevels = [...getPublishedLevels("en")].sort(
    (first, second) => first.levelNumber - second.levelNumber,
  );
  const previousLevel =
    [...publishedLevels].reverse().find((item) => item.levelNumber < level.levelNumber) ?? null;
  const nextLevel = publishedLevels.find((item) => item.levelNumber > level.levelNumber) ?? null;

  const searchLevels: LevelSearchItem[] = publishedLevels.map((item) => ({
    levelNumber: item.levelNumber,
    title: item.title,
    difficulty: item.difficulty ?? null,
    boardImage: item.variants[0]?.boardImage ?? null,
  }));

  return (
    <div className="shell page detail-page">
      <JsonLd data={buildLevelJsonLd(level)} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/en/">Home</Link>
        <span>/</span>
        <Link href="/en/levels/">Levels</Link>
        <span>/</span>
        <span>{level.levelNumber}</span>
      </nav>
      <LevelDetailView level={level} />
      <FloatingLevelBar previousLevel={previousLevel} nextLevel={nextLevel} levels={searchLevels} />
    </div>
  );
}
