/** 文件职责：提供当前路由状态、移动端折叠和键盘可达的主导航。 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const navigationItems = [
  ["Levels", "/en/levels/"],
  ["Hard Levels", "/en/hard-levels/"],
  ["Obstacles", "/en/obstacles/"],
  ["Boosters", "/en/boosters/"],
  ["Guides", "/en/guides/"],
  ["Updates", "/en/updates/"],
] as const;

/** 点击导航后立即关闭菜单，防止移动端跨页面保持遮挡。 */
export function SiteNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
        <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
      </button>
      <nav
        className={`main-nav${isOpen ? " main-nav--open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {navigationItems.map(([label, href]) => {
          const active = pathname === href.slice(0, -1) || pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
