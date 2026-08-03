/** 文件职责：提供全站共享的 Header、导航与 Footer，并按当前语言渲染本地化文案与链接。 */
import type { ReactNode } from "react";
import type { Locale } from "@/lib/content/types";
import type { Messages } from "@/lib/i18n/messages";
import { LocaleLink } from "./locale-link";
import { SiteNavigation } from "./site-navigation";
import { LanguageSwitcher } from "./language-switcher";

/** 为所有语言页面渲染一致的品牌壳层、真实内部链接与语言切换器。 */
export function SiteShell({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const m = messages;
  return (
    <>
      <a className="skip-link" href="#main">
        {m.nav.skipToContent}
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <LocaleLink locale={locale} to="/" className="brand" aria-label={`${m.brand.name} home`}>
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{m.brand.name}</span>
          </LocaleLink>
          <SiteNavigation locale={locale} messages={m} />
          <LanguageSwitcher />
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <strong>{m.brand.name}</strong>
            <p>{m.brand.tagline}</p>
          </div>
          <div>
            <strong>{m.footer.explore}</strong>
            <LocaleLink locale={locale} to="/levels/">
              {m.nav.levels}
            </LocaleLink>
            <LocaleLink locale={locale} to="/search/">
              {m.nav.search}
            </LocaleLink>
            <LocaleLink locale={locale} to="/obstacles/">
              {m.nav.obstacles}
            </LocaleLink>
            <LocaleLink locale={locale} to="/boosters/">
              {m.nav.boosters}
            </LocaleLink>
            <LocaleLink locale={locale} to="/guides/">
              {m.nav.guides}
            </LocaleLink>
          </div>
          <div>
            <strong>{m.footer.information}</strong>
            <LocaleLink locale={locale} to="/updates/">
              {m.nav.updates}
            </LocaleLink>
            <LocaleLink locale={locale} to="/about/">
              {m.nav.about}
            </LocaleLink>
            <LocaleLink locale={locale} to="/legal/">
              {m.nav.legal}
            </LocaleLink>
          </div>
          <p className="footer-note">{m.brand.footerNote}</p>
        </div>
      </footer>
    </>
  );
}
