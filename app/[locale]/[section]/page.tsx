/** 文件职责：为尚未进入实现阶段的正式栏目提供诚实、不可索引的框架入口，按语言本地化。 */
import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";
import { notFound } from "next/navigation";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";

const sections = {
  "board-matcher": [
    "Board matcher",
    "Phase 4 will match a cropped screenshot to the closest board variants.",
  ],
} as const;

type Section = keyof typeof sections;
type PageProps = { params: Promise<{ locale: string; section: string }> };

/** 为所有受支持语言与其已枚举栏目生成静态参数（栏目本身为独立动态段）。 */
export function generateStaticParams() {
  return supportedLocales.flatMap((locale) =>
    Object.keys(sections).map((section) => ({ locale, section })),
  );
}

/** 未完成栏目保持 noindex，避免框架页进入搜索结果；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, section } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  if (!(section in sections)) return {};
  return {
    title: t.boardMatcher.title,
    description: sections[section as Section][1],
    alternates: buildFullAlternates(`/${current}/${section}/`),
    robots: "noindex, follow",
  };
}

/** 渲染统一的规划状态，后续任务以专属页面替换对应路由。 */
export default async function PlannedSectionPage({ params }: PageProps) {
  const { locale, section } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  if (!(section in sections)) notFound();
  const [, description] = sections[section as Section];
  return (
    <div className="shell page planned-page">
      <p className="eyebrow">PLANNED PRODUCT AREA</p>
      <h1>{t.boardMatcher.title}</h1>
      <p>{description}</p>
      <div className="planned-card">
        <span>Not published</span>
        <h2>The route is reserved for the Phase 4 board-matching feature.</h2>
        <p>
          This page is intentionally excluded from indexing until it has validated, useful content.
        </p>
        <LocaleLink className="button-link" to="/">
          {t.notFound.home}
        </LocaleLink>
      </div>
    </div>
  );
}
