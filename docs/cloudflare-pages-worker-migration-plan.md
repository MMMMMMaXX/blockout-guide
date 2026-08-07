<!-- 文件职责：记录 Block Out Guides 从 Worker + Static Assets 迁移到 Pages 静态托管与极简 Worker 的问题、实施边界和验收标准。 -->

# Cloudflare Pages 静态托管 + 极简 Worker 迁移方案

> 文档更新时间：2026-08-07 16:37（Asia/Shanghai）
>
> 本文是实施方案，不代表迁移已经完成。当前只保留方案、风险和验收标准，具体代码与 Cloudflare 配置由后续实施任务完成。

## 1. 背景与当前问题

### 1.1 当前部署链路

当前项目使用 Vinext/Vite 构建 Cloudflare Worker，并把静态产物作为 Worker Static Assets 上传：

```text
npm run build
  ├─ vinext build                         构建 RSC / SSR Worker 与客户端资源
  ├─ scripts/prerender.ts                预渲染全部 published 公共路径
  └─ scripts/verify-build.ts             检查 HTML、内容、SEO 与资源门禁

npx wrangler deploy --config dist/server/wrangler.json
  ├─ Worker：dist/server
  └─ Static Assets：dist/client
```

当前 Worker 入口同时承担：

- Vinext App Router SSR 与 RSC 请求处理；
- `/robots.txt` 与 `/sitemap.xml` 运行时生成；
- 无尾斜杠 URL 的 301 规范化；
- `/_vinext/image` 图片优化；
- 由 `virtual:blockout-content` 注入的关卡与编辑内容元数据。

### 1.2 本次失败证据

构建日志为本地附件 `/Users/manxin/Downloads/blockout-guide.production.a8d7ac1a-1abe-409b-9c70-71fcb263e0c2.build.log`：

- `npm run build` 成功；
- 静态预渲染完成 5270 个公共路径；
- 生产构建门禁通过；
- 5287 个静态资源上传成功；
- 失败发生在最后的 `wrangler deploy` 阶段，而不是编译或预渲染阶段；
- Cloudflare 返回错误码 `10027`：Worker 超过免费计划 3 MiB 脚本体积限制；
- 日志列出的主要依赖包括 `dist/server/ssr/index.js`、消息模块、关卡详情模块、Router 与 Link 模块。

此前已经将约 30 MB 的原始内容内联数据压缩为较轻的构建期元数据，但 Worker 仍需携带 Vinext、React RSC、SSR 路由、图片处理和运行时内容边界，因此仍超过免费计划限制。静态资源上传成功说明问题不是 5287 个 HTML/图片文件本身，而是 Worker 脚本依赖图过大。

### 1.3 目标

在不改变正式 URL、内容、SEO 元数据和用户主要功能的前提下：

1. 让 Pages 直接托管已预渲染的 `dist/client`；
2. 让生产 Worker 不再包含完整 Vinext SSR 运行时；
3. 将 Sitemap、robots、重定向和图片资源改为静态或极小边缘能力；
4. 使免费计划下的生产 Worker 体积明显低于 3 MiB，并保留安全余量；
5. 在切换正式域名之前完成 10 种语言、SEO、功能、缓存和回滚验收。

### 1.4 非目标

- 不在本方案中重新生成或翻译内容；
- 不修改内容事实源、文章结构、语言文案或 SEO 策略；
- 不通过删除页面、减少语言或关闭索引来规避体积限制；
- 不把完整 `dist/server` 改名后继续作为 Pages Function 上传；
- 不以升级付费计划替代架构验证。付费计划可作为临时兜底，但不是本方案的完成条件。

## 2. 目标架构

```text
GitHub / Cloudflare Build
          │
          ▼
      npm run build
          │
          ├─ dist/client ───────────────► Cloudflare Pages
          │                                静态 HTML / JS / CSS / 图片 / 字体
          │
          └─ edge worker bundle ─────────► Cloudflare Worker（可选）
                                           仅处理必要的极少数边缘请求

正式域名 blockout.stratlore.com
          │
          ├─ 静态页面、资源、语言路径 ───► Pages
          └─ robots / sitemap / 精确重定向 ─► 极简 Worker 或 Pages 静态文件
```

Cloudflare 支持静态资源与 Worker 组合，但静态资源请求和 Worker 脚本是不同的处理边界；本方案的关键是不要让完整 SSR Worker 继续成为正式页面的默认处理器。[Cloudflare Worker 静态资源路由](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)

### 2.1 Pages 的职责

Pages 只部署 `dist/client`，负责：

- 5270 个已预渲染公共页面；
- 10 种语言目录；
- 客户端 JS、CSS、字体和本地棋盘图片；
- 静态 `robots.txt`、`sitemap.xml`、`404.html` 和重定向规则；
- 浏览器直接访问、爬虫抓取和 CDN 缓存。

当前构建产物约 5287 个文件，低于 Cloudflare Pages 免费计划 20,000 个文件的限制；单文件仍需低于 25 MiB。[Cloudflare Pages 限制](https://developers.cloudflare.com/pages/platform/limits/)

### 2.2 极简 Worker 的职责

优先级从低到高：

1. **优先不保留 Worker**：如果 robots、Sitemap、重定向和图片都能生成静态文件，则 Pages 单独部署即可。
2. **保留极简 Worker**：只处理无法方便静态化的 robots、Sitemap 或少量精确重定向。
3. **禁止回退到 SSR**：极简 Worker 不得导入 `vinext/server/app-router-entry`，不得导入 `virtual:blockout-content`，不得对所有页面调用 App Router handler。

极简 Worker 的边界应当是白名单路由，而不是“所有未命中资源都进入 Worker”。

## 3. 具体实施方案

### 阶段 0：建立基线和可回滚版本

实施者需要先保存：

- 当前 Cloudflare Worker 名称、生产版本和最近成功/失败构建号；
- 当前正式域名绑定关系；
- 当前 `dist/client` 文件数量、HTML 数量和静态资源总量；
- 当前 10 种语言的代表 URL；
- 当前 Search Console Sitemap 提交状态；
- 当前部署前的 `git` commit SHA。

此阶段不切换 DNS、不删除现有 Worker、不删除旧 Pages 项目。

### 阶段 1：静态产物兼容性改造

#### 1. 生成静态 SEO 文件

将以下运行时逻辑改为构建期生成到 `dist/client`：

- `robots.txt`；
- `sitemap.xml`；
- 根路径 `/` 的语言跳转或默认语言入口；
- 无尾斜杠到尾斜杠的规范化规则；
- 自定义 `404.html`。

Sitemap 必须继续使用完整绝对 URL、canonical URL 和已发布页面集合；不得因为拆分部署而漏掉语言页、编辑内容页或关卡详情页。

#### 2. 移除图片优化端点依赖

当前部分预渲染 HTML 仍可能包含 `/_vinext/image` URL。实施者必须在部署前完成以下二选一：

- 将预渲染 HTML 和组件输出统一改为直接引用 `/boards/{N}.avif`；
- 单独保留一个体积可验证的图片处理 Worker，但不能重新引入完整 App Router。

优先选择直接引用本地 AVIF，因为当前棋盘图片已经是构建期准备好的静态资源。

#### 3. 保留静态 HTML 中的 SEO 内容

静态页面必须继续在首次 HTTP 响应中包含：

- 唯一且本地化的 `<title>`；
- `<meta name="description">`；
- `robots` 指令；
- canonical；
- 10 语言 hreflang；
- Open Graph / Twitter Card；
- FAQ、HowTo、VideoObject 等适用 JSON-LD；
- 可抓取的真实 `<a href="...">` 内链。

### 阶段 2：生产 Worker 瘦身

从生产 Worker 入口移除或迁移：

| 当前依赖/职责                    | 处理方式                                                     |
| -------------------------------- | ------------------------------------------------------------ |
| `vinext/server/app-router-entry` | 从生产 Worker 移除；页面由 Pages 静态文件返回                |
| `virtual:blockout-content`       | Sitemap 和边缘逻辑改为构建期产物，不在 Worker 内存放内容清单 |
| `handleImageOptimization`        | 优先改为直接静态图片；只有确有需求才独立保留                 |
| 全量路径尾斜杠判断               | 转成 Pages `_redirects` 或等价静态规则                       |
| 运行时 Sitemap                   | 转成构建期 Sitemap                                           |
| 运行时 robots                    | 转成静态文件                                                 |

不得移除：

- `dist/client` 中的静态 HTML；
- 客户端语言切换、搜索、筛选和菜单脚本；
- 页面需要的 CSS、字体、棋盘图片和视频封面；
- 10 种语言的消息和已发布内容。

### 阶段 3：客户端导航兼容性处理

当前组件使用 `next/link`，并可能触发 RSC 客户端导航。实施者必须明确选择：

#### 方案 A：静态优先、整页导航

将跨页面导航保证为普通可抓取链接，允许点击后完整刷新页面。优点是依赖最少、最符合 Pages 静态托管；缺点是页面切换没有 RSC 的局部刷新。

#### 方案 B：保留静态 RSC 导航

验证 Pages 是否能够正确返回所有客户端导航需要的 RSC 资源。如果必须由 Worker 生成 RSC 响应，则该 Worker 不能再称为极简 Worker，必须重新测量体积，并确认不会回到 3 MiB 限制。

本项目建议优先采用方案 A，确保 SEO、稳定性和免费计划部署边界清晰；语言切换和搜索结果仍可通过 URL 与静态页面工作。

### 阶段 4：Cloudflare 部署切换

建议先创建或使用独立 Pages 项目进行预览部署：

```text
Build command：npm run build
Output directory：dist/client
Pages Functions：不上传 dist/server，不启用大体积 _worker.js
```

如果保留极简 Worker：

- Worker 单独部署；
- 只给它配置明确的路由白名单；
- 页面和静态资源默认由 Pages 提供；
- 不让 Worker 作为所有页面请求的 fallback；
- 生产域名切换前先用预览域名完成完整验收。

如果采用同域选择性路由，必须在 Cloudflare 控制台确认 Pages 和 Worker 的路径优先级；如果同域路由难以验证，则先使用独立子域测试极简 Worker。

### 阶段 5：正式切换与监控

1. 预览环境完成所有验收；
2. 保留旧 Worker 版本和旧部署记录；
3. 先部署 Pages，再启用极简 Worker 路由；
4. 确认正式域名每个代表 URL 的状态码、HTML 和资源；
5. 提交或重新确认根目录 Sitemap；
6. 观察 Search Console 覆盖率、抓取错误、软 404、canonical 和 CTR；
7. 至少保留旧 Worker 可回滚 7 天。

## 4. 风险与应对

| 风险                     | 表现                                         | 预防/处理                                              |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| Pages 把未知路径返回首页 | 爬虫看到多个 URL 的相同 200 内容，形成软 404 | 自定义 404，未知路径必须返回 404                       |
| 尾斜杠规则丢失           | canonical、内部链接和实际 URL 不一致         | 保留 301/308 规则，并逐路径测试                        |
| Sitemap 漏语言或漏内容   | 收录发现速度下降                             | 用现有 `public-paths` 与 Sitemap 数量做前后 diff       |
| `/_vinext/image` 变 404  | 关卡图片破损、LCP 变差                       | 部署前扫描所有 HTML，禁止残留该路径                    |
| RSC 请求失败             | 点击链接后报错或回退刷新                     | 优先使用普通静态导航；浏览器测试完整点击链             |
| 旧缓存继续返回旧 HTML    | 用户或爬虫混合看到新旧版本                   | 保留带 hash 的资源名，必要时对 HTML 做短期缓存或 purge |
| Pages/Worker 路由冲突    | 某些路径被错误 Worker 接管                   | 预览域名逐项验证路由优先级，正式切换前不删除旧服务     |
| 新部署不完整             | 部分语言或深层 URL 404                       | 统计 5270 公共路径并抽样所有语言、栏目和详情页         |

## 5. 实施完成定义

只有以下条件全部满足，才能把迁移标记为完成：

1. Cloudflare Pages 成功部署 `dist/client`；
2. 极简 Worker（如保留）成功部署，Worker 体积低于免费计划 3 MiB，并保留至少 30% 余量；
3. 生产构建仍完成 5270 个公共路径；
4. `dist/client` 不含未处理的 `/_vinext/image` 地址；
5. 10 种语言首页、栏目页、列表页、关卡详情页和编辑详情页均可直接访问；
6. 所有正式页面首次响应包含正文、title、description、canonical 和 hreflang；
7. Sitemap URL 数量与发布路径清单一致，robots 可访问；
8. 已知页面返回 200，未知页面返回真正的 404；
9. 无尾斜杠 URL 按统一规则返回 301/308，尾斜杠 URL 返回 200；
10. 浏览器可以完成语言切换、导航、搜索、筛选、关卡跳转和媒体点击；
11. 移动端 390×844 与桌面端至少一个宽视口无布局回退；
12. Google Search Console URL 检查确认代表页可抓取、可渲染、canonical 正确；
13. 迁移后 24 小时内无 Pages 5xx、404 激增、软 404、robots 阻断或 Sitemap 读取错误；
14. 旧 Worker 仍可恢复，且已记录回滚步骤。

## 6. 验收命令与浏览器验收

### 6.1 本地构建门禁

```bash
npm run check:comments
npm run typecheck
npm run lint
npm run validate:content
npm run validate:i18n
npm run test:unit
npm run build
npm run test:worker
npm run test:e2e
```

### 6.2 静态产物检查

```bash
find dist/client -type f | wc -l
find dist/client -name index.html | wc -l
rg -n '/_vinext/image|noindex|canonical|hreflang|application/ld\+json' dist/client --glob '*.html'
test -f dist/client/robots.txt
test -f dist/client/sitemap.xml
test -f dist/client/404.html
```

`noindex` 检查必须按页面合同解释：搜索页和明确的非生产页面可以 noindex，正式关卡、栏目和编辑内容页不得被误加 noindex。

### 6.3 线上 HTTP 检查

至少检查以下 URL 类别：

- `/`；
- `/en/`、`/zh-cn/`、`/ja/`、`/ru/`；
- `/en/levels/`；
- `/en/levels/14/`；
- `/zh-cn/levels/14/`；
- `/en/obstacles/` 与一个详情页；
- `/sitemap.xml`；
- `/robots.txt`；
- 一个不存在的详情页；
- 一个无尾斜杠 URL。

每个 URL 记录状态码、最终 URL、HTML 大小、canonical、hreflang、robots 和关键资源状态。不能只依赖浏览器“页面看起来能打开”。

### 6.4 浏览器功能检查

- 首屏 HTML 到达后可以立即点击导航；
- 语言下拉可打开，10 种语言路径正确；
- Levels 搜索、难度筛选和分页可用；
- 关卡详情上一关/下一关和返回列表可用；
- YouTube 播放器按点击加载，未点击时不阻塞首屏；
- 390×844 视口无横向滚动、底部导航不遮挡正文；
- 控制台无 RSC、资源 404、hydration 或图片错误。

## 7. SEO 验收结论标准

迁移不改变域名和正式 URL 时，不应触发站点迁移意义上的排名重置。验收重点是内容和信号是否保持：

- HTTP 首次响应已有完整正文，不依赖 JavaScript 才出现；
- canonical 与 sitemap 使用同一套规范尾斜杠 URL；
- hreflang 仍然互相指向 10 种语言页面；
- robots 不阻止正式页面和必要资源；
- 301/308 只做规范化，不把大量无关页面重定向到首页；
- JSON-LD 与可见正文一致；
- Search Console 中没有新增的“已抓取但未编入索引”“软 404”“重定向错误”异常。

Google 会使用响应 HTML 和渲染后的 HTML 处理 JavaScript 页面；预渲染能减少对二次渲染的依赖，但不能替代正确的状态码、canonical、robots 与 Sitemap 配置。[Google JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

## 8. 回滚方案

如果出现 5xx、页面 404、图片大量损坏、语言路径错误或 Search Console 抓取异常：

1. 立即停止 Pages/Worker 路由继续扩散；
2. 将正式域名路由恢复到旧 Worker 版本；
3. 保留新 Pages 预览部署，禁止直接删除，便于定位差异；
4. 对比失败 URL 的 HTML、状态码、资源和响应头；
5. 修复后重新跑完整验收，不以“首页能打开”作为恢复标准。

## 9. 交付记录要求

实施者完成后必须在 `docs/project-progress.md` 追加：

- 实际迁移日期和 Asia/Shanghai 时间；
- Pages 项目名、Worker 名称和部署 commit SHA；
- Pages 与 Worker 的最终路由边界；
- 实际 Worker 体积；
- 5270 公共路径和静态文件数量；
- SEO、浏览器、移动端和 Search Console 验证结果；
- 已知限制、监控窗口和回滚位置。

## 10. 实施记录（2026-08-07 17:xx Asia/Shanghai）

本方案已按「极简 Worker」子路径实施（对应 2.2 第 2 项：保留极简 Worker，不回退到 SSR）。未改为纯 Pages Functions-only，以最小改动复用既有 `wrangler deploy` 命令与 `wrangler.json` 的 `html_handling: force-trailing-slash` / `not_found_handling: none`。

### 10.1 实际改动

- **静态 SEO 文件（阶段 1）**：新增 `scripts/generate-static-seo.ts`，构建期读取 `dist/.openai/public-paths.json`，把 `robots.txt` 与 `sitemap.xml` 写入 `dist/client`（5270 条 URL，与公共路径一致）；新增 `public/404.html`（vinext 复制到 `dist/client`，未知路径由极简 Worker 回退）。
- **图片优化端点下线（阶段 1.2 / 风险表）**：`components/level/board-module.tsx` 的关卡棋盘图由 `next/image` 改为原生 `<img>`，直接引用构建期下载的 `/boards/{N}.avif`。vinext 的 SSR 会把 `next/image` 的本地图改写到 `/_vinext/image`（即便 `next.config.ts` 设了 `images.unoptimized`，vinext 不生效），此前 3480 个 HTML 受影响。修复后 `dist/client` 内 `/_vinext/image` 引用归零。
- **生产 Worker 瘦身（阶段 2）**：新增 `worker/deploy-minimal.js`（纯 ESM，无 `vinext/server/app-router-entry`、`virtual:blockout-content`、图片优化导入），仅 `env.ASSETS.fetch` 服务静态资产 + 404 回退。新增 `scripts/build-deploy-worker.ts`，在 `verify-build` 之后清理 `dist/server`（仅保留 `wrangler.json`）并写入该极简 Worker 为 `dist/server/index.js`。
- **构建链路**：`package.json` 新增 `build:deploy`（`npm run build` + 写入极简 Worker）与 `deploy`（`build:deploy && wrangler deploy --config dist/server/wrangler.json`）；`build` 末尾追加 `generate-static-seo`，但**不**在 `build` 内做 Worker 替换，以保证 CI 的 `test:worker`（加载完整 SSR Worker 渲染 `/robots.txt`、`/sitemap.xml`）不受影响。
- **构建期 SSR Worker 保留**：`worker/index.ts` 仍是完整 SSR 入口，仅用于 `scripts/prerender.ts` / `verify-build.ts` / `test:worker` 的构建期渲染；生产部署由 `build-deploy-worker.ts` 替换。
- **类型门禁修复**：补充仓库级 `vite-env.d.ts`（`/// <reference types="vite/client" />`），修复 `import.meta.glob` 在 `lib/content/*-repository.ts` 的类型报错（此前依赖未跟踪的临时文件，CI 全新 `npm ci` 会失败）。

### 10.2 验证结果

- `npm run build:deploy` 退出 0：vinext build → 静态预渲染 5270 路径 → 生产门禁通过 → 静态 SEO 生成 → 极简 Worker 写入。
- `dist/server` 总体积 **8.0 KiB**（仅 `wrangler.json` + 916 字节 `index.js`），远低于免费计划 3 MiB（错误码 10027）限制。
- `dist/client` 含 `robots.txt`、`sitemap.xml`（5270 `<loc>`）、`404.html`；**0** 个 `/_vinext/image` 引用。
- `npm run typecheck` 0 错；`npm run test:unit` 49/49。
- 部署命令改为 `npm run deploy`（禁止裸 `wrangler deploy`，否则会再次上传完整 SSR Worker 超体积）。

### 10.3 已知遗留

- `tests/rendered-html.test.mjs` 对 `/robots.txt` 断言 `Disallow: /en/search/`，但 `buildRobotsText()` 产出 `Disallow: /search/`（早于本次改动，非本次回归）。若 CI 运行 `test:worker` 会在此断言失败；建议后续把 robots 改为 `Disallow: /*/search/`（覆盖全部语言搜索页）并同步修正测试，与本部署修复解耦。
- 正式切换、Search Console 验收与 7 天回滚窗口待生产域名部署后按阶段 5 执行。
