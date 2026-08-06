/** 文件职责：为站点根层未匹配的未知路由提供品牌化 404 边界，并按 URL 中的语言段本地化文案。 */
"use client";

import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";
import { LocaleLink } from "@/components/locale-link";

/**
 * 根层 404 边界，覆盖 [locale] 段之外完全无法匹配的路由（如过深路径
 * /a/b/c/d）。语言从当前路径推导，与站内 LocaleLink 保持一致，缺失时回退英文。
 */
export default function RootNotFound() {
  const locale = useLocale();
  const t = getMessages(locale);
  return (
    <div className="shell page not-found-page">
      <div className="article-hero">
        <p className="eyebrow">404 · BLOCKED PATH</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.copy}</p>
        <div className="not-found-actions">
          <LocaleLink className="button-link" to="/">
            {t.notFound.home}
          </LocaleLink>
          <LocaleLink className="secondary-link" to="/levels/">
            {t.notFound.levels}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
