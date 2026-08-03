<!-- 文件职责：提供 Block Out Guides 的本地开发入口、架构导航与质量命令。 -->

# Block Out! Guides

Block Out! Guides 是 StratLore 的移动端优先关卡攻略站。Phase 0～3 已完成框架、内容体系、搜索、媒体播放、Playlist 生成、SEO 与发布质量门禁。

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 环境

- Node.js 22.13 或更高版本（推荐使用仓库声明的版本）
- npm 10 或更高版本

## 本地运行

```bash
npm ci
npm run dev
```

打开开发服务输出的 Local URL。当前主要路由：

- `/en/`：正式产品首页，仅展示已发布关卡
- `/en/levels/`：支持搜索、筛选、分组和分页的关卡聚合
- `/en/hard-levels/`：高难关卡与失败模式聚合
- `/en/levels/14/`：完整、可索引的关卡攻略详情
- `/en/obstacles/`、`/en/boosters/`、`/en/guides/`、`/en/updates/`：published-only 编辑内容聚合
- `/en/obstacles/ivy/` 等样例详情：明确标注且 `noindex` 的研究草稿
- `/en/about/`、`/en/legal/`：编辑标准与法律信息
- `/en/search/`：仅搜索已发布内容的本地混合索引，始终 `noindex`
- `/__design-system/`：仅开发环境可见；生产环境返回 404

## 质量检查

```bash
npm run check:comments
npm run typecheck
npm run lint
npm run validate:content
npm run test:unit
npm run build
npm run test:worker
npm run test:e2e
```

`npm run build` 会生成公共路径清单、静态 HTML 并检查标题、说明和索引资格。完整链使用 `npm run quality`，与 GitHub Actions 保持一致。

## 项目导航

- 产品与工程基线：`docs/implementation-plan.md`
- 设计系统合同：`docs/design-system.md`
- Phase 1 页面合同：`docs/phase-1-pages.md`
- Phase 2 内容合同：`docs/phase-2-content.md`
- Phase 3 搜索合同：`docs/phase-3-search.md`
- Phase 3 媒体、同步与 SEO 合同：`docs/phase-3-operations.md`
- 内容写作与模板：`docs/content-authoring.md`、`templates/content/`
- 质量门禁：`docs/quality-gates.md`
- 正式任务与会话台账：`docs/project-progress.md`
- 首批生产内容：Level 14、Ivy、Clock Booster、变体识别指南和 Version 729 更新
- 内容契约：`lib/content/types.ts`、`lib/content/schema.ts` 与 `lib/content/editorial-schema.ts`
- 构建期发现：`lib/content/discovery.server.ts` 与 `build/content-vite-plugin.ts`
- 查询与路径边界：`lib/content/level-repository.ts`、`lib/content/editorial-repository.ts`、`lib/routing/public-paths.ts`
- 仓库工作规则：`AGENTS.md`

## 内容原则

真实文章必须在同一任务内补齐棋盘、版本、视频/步骤、Booster、来源、媒体权利、SEO、内链和移动端检查，首次写入 `content/` 即使用 `published`。不得生成待审核、待补齐或审核队列字段；不完整材料只留在 `research/`。`draft` 仅限 `template-*` 结构模板，且不得进入聚合、搜索、Sitemap、JSON-LD 或可索引详情页。
