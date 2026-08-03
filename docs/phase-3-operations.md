<!-- 文件职责：记录 Phase 3 媒体、Playlist、SEO、结构化数据和质量合同。 -->

# Phase 3 运营与发现合同

> 文档更新时间：2026-08-02 23:56（Asia/Shanghai）

## YouTube 与章节

播放器只接受 `embedAllowed: true` 的视频，首次由用户点击后才加载 `youtube-nocookie.com`。章节按钮可直接从指定秒数启动；失效或禁止嵌入时显示来源回退，不写 Cookie、Local Storage、账号或行为事件。

## Playlist 同步

`npm run sync:playlist -- research/playlists/export.json` 接收 Playlist 导出与已经完整研究的文章事实。标题必须只解析出一个关卡号，且必须与文章一致；棋盘、来源、创作者、可嵌入状态、Variant、版本、平台、正文和 SEO 缺一不可。

同步先验证整个批次，再以排他写入方式生成 `published` JSON。任意一条失败时不写入本批次任何文章，不生成草稿或人工确认队列，也不覆盖已有内容。候选或不完整导出保留在 `research/`。

## SEO 与爬虫

- 每个正式页面维护独立标题、说明和 canonical；
- hreflang 只在 Repository 中存在真实发布翻译时输出；
- Sitemap 只读取 published Repository，并包含固定公开页；
- robots 隔离站内搜索、Board Matcher 规划页和开发路由；
- 首页输出 WebSite/SearchAction；发布关卡输出与可见面包屑、FAQ、视频事实一致的 JSON-LD；
- 搜索页和结构模板不进入 Sitemap，也不输出可索引结构化数据。

## 响应式、无障碍与性能

390px 为主验收宽度。播放器在用户操作前不发起第三方请求，减少首屏成本和隐私暴露；按钮支持键盘焦点，触控目标不小于 40px；媒体容器预留比例以降低 CLS。全量完成以 `npm run quality` 为准。
