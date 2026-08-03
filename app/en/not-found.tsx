/** 文件职责：为英文站点未知路由提供明确恢复入口。 */
import Link from "next/link";

/** 404 不猜测缺失内容，优先带用户返回关卡搜索或首页。 */
export default function EnglishNotFound() {
  return (
    <div className="shell page not-found-page">
      <div className="article-hero">
        <p className="eyebrow">404 · BLOCKED PATH</p>
        <h1>This block has no exit</h1>
        <p>The page does not exist, the guide is not verified, or its URL has changed.</p>
        <div className="not-found-actions">
          <Link className="button-link" href="/en/">
            Back home
          </Link>
          <Link className="secondary-link" href="/en/levels/">
            Browse verified levels
          </Link>
        </div>
      </div>
    </div>
  );
}
