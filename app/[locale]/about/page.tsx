/** 文件职责：说明站点定位、编辑流程、所有权与内容纠错边界，按语言本地化。 */
import type { Metadata } from "next";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成 About 页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** About 页自指 canonical + 完整 10 语言 hreflang；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.about.title,
    description: t.about.body,
    alternates: buildFullAlternates(`/${current}/about/`),
    robots: "index, follow",
  };
}

/** About 只陈述已采用的站点规则，不冒充游戏官方信息。 */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return (
    <div className="shell page info-page">
      <header className="article-hero">
        <p className="eyebrow">{t.about.eyebrow}</p>
        <h1>{t.about.title}</h1>
        <p>{t.about.body}</p>
      </header>
      <div className="info-grid">
        <section className="content-panel">
          <h2>What we publish</h2>
          <p>
            Level solutions, obstacle rules, booster decisions, reusable strategies and
            version-impact notes. Public content must pass its structured publishing gate.
          </p>
        </section>
        <section className="content-panel">
          <h2>How verification works</h2>
          <p>
            Content agents record board layout, platform, game version, source, verification date
            and the applicable Variant before writing a production article. Incomplete research is
            kept outside the public content set.
          </p>
        </section>
        <section className="content-panel">
          <h2>How corrections work</h2>
          <p>
            When a board or video no longer matches, automated checks must replace or remove the
            affected production article instead of creating a hidden content backlog.
          </p>
        </section>
        <section className="content-panel">
          <h2>Ownership</h2>
          <p>
            The guide site is operated by StratLore. Block Out! and its game assets remain the
            property of their respective owners.
          </p>
        </section>
      </div>
    </div>
  );
}
