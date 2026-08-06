/** 文件职责：加载 10 种语言的 UI 文案目录，并提供模板变量替换。 */
import type { Locale } from "./locales";
import en from "@/messages/en.json";
import zhCn from "@/messages/zh-cn.json";
import ptBr from "@/messages/pt-br.json";
import ru from "@/messages/ru.json";
import de from "@/messages/de.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import tr from "@/messages/tr.json";

/** 英文目录充当类型与回退基准；所有语言键必须与之保持一致。 */
export type Messages = typeof en;

export const catalogs: Record<Locale, Messages> = {
  en,
  "zh-cn": zhCn,
  "pt-br": ptBr,
  ru,
  de,
  es,
  fr,
  ja,
  ko,
  tr,
};

/** 取得指定语言的 UI 文案；非法语言回退到英文。 */
export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en;
}

/** 把 `{name}` 形式的占位符替换为变量值，缺失变量保留原样。 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
