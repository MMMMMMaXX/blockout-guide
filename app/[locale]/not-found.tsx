/** 文件职责：为未知路由提供明确恢复入口，并按当前语言本地化文案与链接。 */
import { LocaleLink } from "@/components/locale-link";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

type PageProps = { params?: Promise<{ locale: string }> };

/** 为所有受支持语言预生成 404 边界静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 404 不猜测缺失内容，优先带用户返回关卡搜索或首页。 */
export default async function LocaleNotFound({ params }: PageProps) {
  const resolved = (await params) ?? ({} as { locale?: string });
  const current = (resolved.locale ?? "en") as Locale;
  const t = getMessages(current);
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
