/** 文件职责：为构建期内容虚拟模块提供 TypeScript 合同。 */
declare module "virtual:blockout-content" {
  import type { EditorialMeta, LevelMeta } from "@/lib/content/types";
  export const levelMeta: readonly LevelMeta[];
  export const editorialMeta: readonly EditorialMeta[];
}