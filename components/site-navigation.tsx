/** 文件职责：提供当前路由状态、移动端折叠和键盘可达的主导航，按当前语言本地化。 */
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/content/types";
import type { Messages } from "@/lib/i18n/messages";
import { LocaleLink } from "./locale-link";

/** 点击导航后立即关闭菜单，防止移动端跨页面保持遮挡。 */
export function SiteNavigation({ locale, messages }: { locale: Locale; messages: Messages }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items: ReadonlyArray<readonly [string, string]> = [
    [messages.nav.levels, "/levels/"],
    [messages.nav.hardLevels, "/hard-levels/"],
    [messages.nav.obstacles, "/obstacles/"],
    [messages.nav.boosters, "/boosters/"],
    [messages.nav.guides, "/guides/"],
    [messages.nav.updates, "/updates/"],
  ];

  return (
    <>
      <button
        className="menu-toggle"
        type="button"
        aria-controls="primary-navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">{isOpen ? "×" : "☰"}</span>
        <span className="sr-only">{isOpen ? messages.nav.closeNav : messages.nav.openNav}</span>
      </button>
      <nav
        className={`main-nav${isOpen ? " main-nav--open" : ""}`}
        id="primary-navigation"
        aria-label={messages.aria.primaryNavigation}
      >
        {items.map(([label, to]) => {
          const target = `/${locale}${to}`;
          const active = pathname === target.slice(0, -1) || pathname.startsWith(target);
          return (
            <LocaleLink
              locale={locale}
              to={to}
              key={to}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </LocaleLink>
          );
        })}
      </nav>
    </>
  );
}
