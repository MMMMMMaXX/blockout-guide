/** 文件职责：提供只索引 published 内容的本地搜索入口，并保持搜索结果按语言本地化。 */
import type { Metadata } from "next";
import { SearchExplorer } from "@/components/search-explorer";
import { searchTypes, type SearchType } from "@/lib/search/search-index";
import { getPublishedSearchIndex } from "@/lib/search/search-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

/** 为所有受支持语言生成搜索页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 搜索页自指 canonical + 完整 10 语言 hreflang；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.search.title,
    description: t.search.placeholder,
    alternates: buildFullAlternates(`/${current}/search/`),
    robots: "noindex, follow",
  };
}

/** 未知类型回退 all，异常页码回退 1，避免 URL 参数进入客户端状态时失控。 */
export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const parameters = await searchParams;
  const type = searchTypes.includes(parameters.type as SearchType)
    ? (parameters.type as SearchType)
    : "all";
  const requestedPage = Number.parseInt(parameters.page ?? "1", 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.search.eyebrow}</p>
        <h1>{t.search.title}</h1>
        <p>{t.search.placeholder}</p>
      </header>
      <SearchExplorer
        entries={getPublishedSearchIndex(current)}
        initialQuery={parameters.q ?? ""}
        initialType={type}
        initialPage={page}
      />
    </div>
  );
}
