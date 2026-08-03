/** 文件职责：提供只索引 published 内容的本地搜索入口，并保持搜索结果 noindex。 */
import type { Metadata } from "next";
import { SearchExplorer } from "@/components/search-explorer";
import { searchTypes, type SearchType } from "@/lib/search/search-index";
import { getPublishedSearchIndex } from "@/lib/search/search-repository";

export const metadata: Metadata = {
  title: "Search Block Out Guides",
  description: "Search verified Block Out levels, obstacles, boosters, guides and updates.",
  alternates: { canonical: "/en/search/" },
  robots: "noindex, follow",
};

type PageProps = {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

/** 未知类型回退 all，异常页码回退 1，避免 URL 参数进入客户端状态时失控。 */
export default async function SearchPage({ searchParams }: PageProps) {
  const parameters = await searchParams;
  const type = searchTypes.includes(parameters.type as SearchType)
    ? (parameters.type as SearchType)
    : "all";
  const requestedPage = Number.parseInt(parameters.page ?? "1", 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">LOCAL SEARCH</p>
        <h1>Search Block Out Guides</h1>
        <p>
          One index across verified levels, mechanics, Booster decisions, strategies and updates.
        </p>
      </header>
      <SearchExplorer
        entries={getPublishedSearchIndex("en")}
        initialQuery={parameters.q ?? ""}
        initialType={type}
        initialPage={page}
      />
    </div>
  );
}
