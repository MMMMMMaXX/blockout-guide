# CI 失败修复 — 总览（2026-08-07）

## 问题
GitHub Actions `quality` workflow 第二次失败（日志 `logs_84517149209.zip`）。
失败环节：`check:comments`，报两个脚本「缺少首行中文职责注释」：
- `scripts/check-i18n-parity.mjs`
- `scripts/normalize-level-colors.mjs`

## 根因
`scripts/check-comments.mjs` 要求被检文件**第一行**同时包含中文字符（`[\u3400-\u9fff]`）和「职责」二字。
两文件原本的 JSDoc 首行为 `/*`（无中文），职责说明落在第二行，因此被判不合格。

## 修复
将两个脚本的多行 JSDoc 折叠为「首行即含『文件职责』+ 中文」的单行注释（补充说明保留在第 2/3 行）：
- `scripts/check-i18n-parity.mjs`
- `scripts/normalize-level-colors.mjs`

改动极小：2 文件 +2/-4 行。

## 验证（本地）
- `npm run check:comments`：两个文件已不再报错（失败列表仅剩**未跟踪**的临时翻译脚本，CI 检出不含，不影响）。
- `prettier --check` 两文件：通过。
- `npm run validate:i18n`：通过（确认编辑脚本未破坏其功能）。

## 提交与推送
- 提交 `85a6081`：`fix(ci): 折叠脚本首行注释以满足 check:comments 门禁`
- 推送成功：`f296fd8..85a6081 main -> main`

## 遗留提醒
工作区存在约 30+ 个未跟踪临时翻译/调试脚本（`scripts/translate-*.mjs`、`_*.mjs`、`*.json` 及根目录 `_tr*.mjs`、`blockout_ru.py` 等）。
它们会让本地 `npm run quality` 报错，但**未加入 git，CI 不受影响**。建议后续清理或加入 `.gitignore`，避免本地校验噪音。

---

## 新增：Cloudflare 部署失败诊断（与 CI 无关，2026-08-07）

### 现象
Cloudflare Workers Builds 成功构建，但部署阶段报错（build log / 截图）：
```
✘ [ERROR] Your Worker failed validation because it exceeded size limits.
Your Worker exceeded the size limit of 3 MiB.
Please upgrade to a paid plan to deploy Workers up to 10 MiB. [code: 10027]
```

### 测量（本地 `dist/server/index.js`）
- 未压缩：~22 MiB
- gzip 压缩：~4.98 MiB

Cloudflare Workers Free 限制：**gzip 后 3 MiB**；Paid：**gzip 后 10 MiB**。当前 4.98 MiB 卡在两者之间。

### 根因
当前部署是 Cloudflare Worker + Static Assets。Worker 入口脚本必须包含 vinext/React 服务器运行时、应用路由处理程序以及 `virtual:blockout-content` 注入的全部内容数据，导致压缩后仍超过 Free 计划上限。单纯去除注释/空白几乎不改善 gzip（已验证）。

### 推荐解决方案
1. **最快、最稳：升级 Cloudflare Workers 到 Paid 计划**（10 MiB gzip 上限）。当前 4.98 MiB 可直接部署，无需改代码。
2. **若坚持 Free 计划**：需要较大的架构调整——将内容数据从 Worker bundle 中移出（用 KV/R2/Static JSON），并把 `/sitemap.xml` 和搜索索引改为构建期静态产物。这样可显著缩小 Worker，但改动面广，且需验证预渲染、搜索、Sitemap 链路。

### 建议
优先方案 1（升级）。方案 2 可作为后续降本/优化项，不适合在当前 SEO 交付窗口内完成。

## 已落地的 SEO 修复（前序，已在更早提交）
- hreflang / canonical 尾斜杠统一（`lib/seo/metadata.ts` + `scripts/prerender.ts`）
- Worker 301 合并无尾斜杠 URL（`worker/index.ts`）
- 关卡页优先 `level.seo.title/description`；新增 OG/Twitter Card
- 本地化 FAQ 结构化数据；VideoObject 缩略图升级；`full-guide` 关卡新增 HowTo 结构化数据
- 诊断报告：`docs/seo-audit-2026-08-07.md`
