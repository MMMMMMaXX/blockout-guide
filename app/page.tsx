/** 文件职责：将站点根路径稳定引导到首发英文首页。 */
import { redirect } from "next/navigation";

/** 根路径不承载重复内容，避免未来多语言首页产生 canonical 冲突。 */
export default function RootPage() {
  redirect("/en/");
}
