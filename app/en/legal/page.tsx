/** 文件职责：提供可直接上线的隐私、版权与非官方声明。 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal and privacy",
  description:
    "Read the privacy, copyright and unofficial fan-guide boundaries for Block Out Guides.",
  alternates: { canonical: "/en/legal/" },
};

/** 法律页只描述当前已实现的数据处理和第三方媒体边界。 */
export default function LegalPage() {
  return (
    <div className="shell page info-page">
      <header className="article-hero">
        <p className="eyebrow">LEGAL & PRIVACY</p>
        <h1>Clear boundaries for an unofficial guide</h1>
        <p>
          Effective August 2, 2026. This notice describes the current site behavior and is updated
          before any new data collection is introduced.
        </p>
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
