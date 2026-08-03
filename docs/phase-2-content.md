<!-- 文件职责：记录 Phase 2 编辑内容的类型边界、页面合同和发布策略。 -->

# Phase 2 内容与页面合同

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 统一边界

Obstacle、Booster、Guide 和 Update 由 `editorial-schema.ts` 校验，并在构建期与 Level 一起注入 Worker。页面只通过 `editorial-repository.ts` 查询；所有公开聚合、首页模块和公共路径只消费 `published`。

四类内容共同发布条件：

1. 独立标题、摘要与 SEO 信息；
2. 至少一个可追溯来源；
3. 明确的 `verifiedAt` 和 `updatedAt`；
4. 通过对应领域的最低正文门禁；
5. 关联关卡只解析为实际已发布实体。

## Obstacles

路径为 `/en/obstacles/` 与 `/en/obstacles/:slug/`。发布内容至少需要两条已观察规则、两条可复现策略、优先级和失败点。`content/` 不提供草稿预览；结构模板只保存在 `templates/`。

## Boosters

路径为 `/en/boosters/` 与 `/en/boosters/:slug/`。每篇决策指南必须同时包含至少两个使用条件和两个不使用条件，防止内容退化为单向推荐。相关关卡必须为已发布的可复现实例。

## Guides

路径为 `/en/guides/` 与 `/en/guides/:slug/`。Guide 解决跨关卡问题，发布时至少有两个结构化正文段落；障碍、Booster 和 Level 关系只作为经过发布过滤的辅助证据。

## Updates

路径为 `/en/updates/` 与 `/en/updates/:slug/`。Update 必须记录来源、版本日期、已核验变化和受影响内容。它的职责是同步官方变化及其攻略影响，不是复制普通新闻流。

## About、Legal 与 404

`/en/about/` 解释生成即发布流程、纠错和所有权；`/en/legal/` 记录当前可直接上线的非官方声明、隐私与第三方媒体边界。英文站点 404 提供首页和已验证关卡库的恢复入口。

## 当前内容状态

首批 Ivy、Clock Booster、board variants 和 Version 729 均为带来源的生产文章，已进入各自栏目、详情路由、搜索索引和 Sitemap。Level 14 同时为这些跨类型内容提供首个公开关卡实例；后续 Agent 必须维持同样的生成即展示合同。
