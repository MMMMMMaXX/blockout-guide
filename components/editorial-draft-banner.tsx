/** 文件职责：明确标识不可索引的编辑草稿，防止研究占位被误解为游戏事实。 */

/** 仅在非 published 详情使用，说明该页面的事实边界。 */
export function EditorialDraftBanner() {
  return (
    <div className="draft-banner">
      <strong>Editorial research preview</strong>
      <span>This draft is noindex and must not be treated as verified game guidance.</span>
    </div>
  );
}
