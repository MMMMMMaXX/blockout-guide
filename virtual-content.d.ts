/** 文件职责：为构建期内容虚拟模块提供 TypeScript 合同。 */
declare module "virtual:blockout-content" {
  import type { EditorialArticle, LevelArticle } from "@/lib/content/types";
  const levels: readonly LevelArticle[];
  export const editorial: readonly EditorialArticle[];
  export default levels;
}
