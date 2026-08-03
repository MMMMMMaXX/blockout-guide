/** 文件职责：在任意语言页面间切换，保持路径其余部分，并写入跨子域语言 Cookie。 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supportedLocales, type Locale } from "@/lib/i18n/locales";
import { localeMeta } from "@/lib/i18n/locale-meta";
import { changeLocale, stripLocale } from "@/lib/i18n/locale-path";
import { buildLocaleCookie } from "@/lib/i18n/locale-cookie";

/** 下拉式语言切换器；点击即切换路径并写入 stratlore_locale Cookie。 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { locale: current, rest } = stripLocale(pathname ?? "/");

  const switchTo = (locale: Locale) => {
    // 写入跨子域语言 Cookie 以便 Worker 侧按语言响应；属预期副作用。
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = buildLocaleCookie(locale);
    setOpen(false);
    router.push(changeLocale(`/${current}${rest}`, locale));
  };

  return (
    <div className={`language-switcher${open ? " language-switcher--open" : ""}`}>
      <button
        type="button"
        className="language-switcher__toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">🌐</span>
        <span>{localeMeta[current]?.label ?? "English"}</span>
        <span className="sr-only">Change language</span>
      </button>
      {open ? (
        <ul className="language-switcher__menu" role="menu">
          {supportedLocales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === current}
                className={locale === current ? "is-current" : undefined}
                onClick={() => switchTo(locale)}
              >
                {localeMeta[locale].label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
