/** 文件职责：提供可直接上线的隐私、版权与非官方声明，按语言本地化。 */
import type { Metadata } from "next";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成 Legal 页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** Legal 页自指 canonical + 完整 10 语言 hreflang；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.legal.title,
    description: t.legal.body,
    alternates: buildFullAlternates(`/${current}/legal/`),
    robots: "index, follow",
  };
}

/** 法律页只描述当前已实现的数据处理和第三方媒体边界。 */
export default async function LegalPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return (
    <div className="shell page info-page">
      <header className="article-hero">
        <p className="eyebrow">{t.legal.eyebrow}</p>
        <h1>{t.legal.title}</h1>
        <p>{t.legal.body}</p>
      </header>
      <div className="article-main">
        <section className="content-panel">
          <h2>Unofficial fan guide</h2>
          <p>
            Block Out Guides is operated by StratLore and is not affiliated with, endorsed by or
            sponsored by Grand Games or the game&apos;s rights holders.
          </p>
        </section>
        <section className="content-panel">
          <h2>Trademarks and game assets</h2>
          <p>
            Names, trademarks and game assets belong to their respective owners. Site-authored
            explanations and interface code remain the property of their respective authors.
          </p>
        </section>
        <section className="content-panel">
          <h2>Privacy</h2>
          <p>
            The current site does not provide accounts, comments, uploads or behavioral advertising.
            Standard hosting security logs may still be processed by the hosting provider. Future
            features must update this notice before collecting additional data.
          </p>
        </section>
        <section className="content-panel">
          <h2>External media and links</h2>
          <p>
            Future video embeds and external sources may be governed by third-party terms and
            privacy practices. Only media recorded as embeddable may be published.
          </p>
        </section>
        <section className="content-panel">
          <h2>Accuracy and corrections</h2>
          <p>
            Game versions can change boards and mechanics. Guides are informational and may be
            withdrawn when their evidence no longer matches the current game.
          </p>
        </section>
      </div>
    </div>
  );
}
