/** 文件职责：提供英文首发站点的共享 Header、导航与 Footer。 */
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNavigation } from "./site-navigation";

/** 为所有英文页面渲染一致的品牌壳层和真实内部链接。 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" href="/en/" aria-label="Block Out Guides home">
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              BLOCK OUT <em>GUIDES</em>
            </span>
          </Link>
          <SiteNavigation />
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <strong>Block Out! Guides</strong>
            <p>Board-aware, mobile-first help for players who want the right solution fast.</p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link href="/en/levels/">All levels</Link>
            <Link href="/en/search/">Search</Link>
            <Link href="/en/obstacles/">Obstacles</Link>
            <Link href="/en/boosters/">Boosters</Link>
            <Link href="/en/guides/">Guides</Link>
          </div>
          <div>
            <strong>Information</strong>
            <Link href="/en/updates/">Updates</Link>
            <Link href="/en/about/">About</Link>
            <Link href="/en/legal/">Legal & privacy</Link>
          </div>
          <p className="footer-note">
            Unofficial fan guide operated by StratLore. Not affiliated with Grand Games.
          </p>
        </div>
      </footer>
    </>
  );
}
