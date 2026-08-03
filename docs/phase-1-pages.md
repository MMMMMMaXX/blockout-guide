<!-- 文件职责：记录 Phase 1 首页、聚合页和详情页的内容消费与交互合同。 -->

# Phase 1 页面合同

> 文档更新时间：2026-08-02 01:15（Asia/Shanghai）

## 首页

`/en/` 是产品入口，只读取 `getPublishedLevels("en")`。首屏关卡号跳转允许编辑人员访问已存在的草稿详情，但首页列表、FAQ 和产品栏目不显示草稿或伪造热度。没有发布内容时展示编辑审核空状态。

## Levels 聚合

`/en/levels/` 支持关卡号/文本搜索、难度筛选、每 50 关分组和每页 12 项。筛选与分页是客户端增强；标题、说明和零内容状态保持服务端可读。无发布内容时页面为 `noindex, follow`，首次发布后自动切换为 `index, follow`。

## Level 详情

`/en/levels/:level/` 的 Variant 切换同时更新棋盘、平台、版本、核验状态、视频、章节、提示、步骤和失败点。层级规则如下：

- `video`：棋盘、事实和视频；
- `enhanced-video`：额外显示章节与快速提示；
- `full-guide`：额外显示步骤和失败点。

棋盘图或可嵌入视频缺失时展示诚实占位。相邻导航只链接实际已发布的前后关；草稿详情始终 `noindex, follow`。

## Hard Levels 聚合

`/en/hard-levels/` 只从 `getPublishedHardLevels("en")` 读取 `hard`、`expert` 和 `super-hard`。失败模式卡片是诊断信息，不链接不存在的攻略。没有已发布高难内容时保持 `noindex, follow`。

## 维护边界

内容作者使用 `templates/content/` 三个模板，并在提交前运行 `npm run validate:templates`。页面不得直接读取 JSON 文件；新增筛选规则应优先写入 `lib/levels/filter-levels.ts` 并配套纯函数测试。
