<!-- 文件职责：记录 Phase 3 本地搜索的索引范围、排序、URL 与索引控制合同。 -->

# Phase 3 本地搜索合同

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 索引范围

`getPublishedSearchIndex(locale)` 只组合各领域 Repository 的 published 查询，覆盖 Level、Obstacle、Booster、Guide 和 Update。`buildSearchIndex` 还会再次执行防御性 published 过滤，因此误传 preview 清单也不会泄露草稿。

当前首批五个生产实体均为 `published`，因此 Level 14、Ivy、Clock Booster、变体识别指南和 Version 729 更新都会进入搜索索引。新增真实文章必须在同一生成任务中进入详情路由、所属栏目、搜索索引和 Sitemap；任一入口缺失都视为校验失败。

## 查询与排序

- 精确关卡号匹配优先级最高；
- 其后按标题开头、标题包含、关键词和摘要依次计分；
- 多词查询要求所有词都至少命中一个可搜索字段；
- 同分时按更新时间倒序、标题正序保持稳定；
- 类型筛选支持 all、level、obstacle、booster、guide、update。

## URL 与分页

搜索页面为 `/en/search/`，使用 `q`、`type` 和 `page` 参数。客户端交互通过 `history.replaceState` 同步 URL，不为每次输入制造浏览器历史。分页固定每页 10 项，异常或越界页码自动修正。

## SEO 边界

搜索页始终使用 `noindex, follow`，canonical 固定为 `/en/search/`。搜索结果链接指向内容主 canonical；草稿、归档和研究文件不进入索引。
