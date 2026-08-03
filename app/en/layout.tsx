/** 文件职责：为首发英文路由挂载共享站点壳层。 */
import { SiteShell } from "@/components/site-shell";

/** 英文页面共享导航和页脚，后续语言版本可复用同一组件并传入词典。 */
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
