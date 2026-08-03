/** 文件职责：聚合所有已发布高难关卡，并提供可复用的失败模式入口，按语言本地化。 */
import type { Metadata } from "next";
import { LevelsExplorer } from "@/components/levels-explorer";
import { getPublishedHardLevels } from "@/lib/content/level-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

const failurePatterns = [
  ["Board mismatch", "Confirm the opening layout and platform before copying moves."],
  ["Blocked center", "Prioritize space-making moves before clearing convenient edge pieces."],
  ["Move pressure", "Compare the opening sequence before spending boosters on a weak attempt."],
  ["Version drift", "Re-check the verified date when the game changes a level layout."],
] as const;

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成高难关卡聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 高难关卡聚合页自指 canonical + 完整 10 语言 hreflang；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.hardLevels.title,
    description: t.hardLevels.subtitle,
    alternates: buildFullAlternates(`/${current}/hard-levels/`),
    robots: "index, follow",
  };
}

/** 失败模式卡片提供诊断方向，不虚构尚不存在的攻略链接。 */
export default async function HardLevelsPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const levels = getPublishedHardLevels(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.hardLevels.eyebrow}</p>
        <h1>{t.hardLevels.title}</h1>
        <p>{t.hardLevels.subtitle}</p>
      </header>
      <section className="failure-patterns" aria-labelledby="failure-pattern-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAILURE PATTERNS</p>
            <h2 id="failure-pattern-heading">Diagnose the attempt before retrying</h2>
          </div>
        </div>
        <div className="feature-grid">
          {failurePatterns.map(([title, copy], index) => (
            <article className="feature-card" key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="hard-library" aria-labelledby="hard-library-heading">
        <h2 id="hard-library-heading" className="sr-only">
          Verified hard levels
        </h2>
        <LevelsExplorer
          levels={levels}
          emptyTitle="No complete hard-level guide is available"
          emptyCopy="Add a complete published level article to make it appear here automatically."
        />
      </section>
    </div>
  );
}
