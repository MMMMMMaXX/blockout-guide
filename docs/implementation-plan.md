<!-- 文件职责：记录 Block Out Guides 已采用的产品边界、技术架构与阶段交付策略。 -->

# Block Out Guides 实施基线

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 1. 本轮结论

本项目复用 PoE2 Guides 已验证的核心模式，但不直接复制其领域代码：

- 静态优先、结构化 JSON、聚合页和详情页共享同一内容事实源；
- Schema 在内容进入页面前校验，错误失败关闭；
- Repository 隔离文件系统与页面查询语义；
- `draft` / `archived` 与 `published` 在统一边界过滤；
- 搜索、Sitemap、SEO 和页面路由只消费已发布内容；
- 移动端只保留必要交互，优先输出可读 HTML；
- 质量门禁、任务表和会话记录随代码一起维护。

首轮采用 TypeScript strict、React 19、Next 兼容 App Router、vinext/Vite 和 Cloudflare Worker 兼容构建。该选择保留静态优先能力，同时与当前 Sites 本地运行时一致。若未来迁移为 React Router Framework Mode，页面仍通过 Repository 取数，内容 JSON 和领域类型无需改写。

## 2. 分层与维护边界

```text
app/                      路由、页面 Metadata 与组合层
components/               无领域存储知识的共享 UI
lib/content/types.ts      跨层共享类型契约
lib/content/schema.ts     JSON 输入校验与失败关闭边界
lib/content/*repository   页面允许使用的查询语义
content/{locale}/         内容唯一事实源
public/images/            已核验媒体资源
scripts/                  内容、索引、SEO 与质量自动化
docs/                     架构、任务和运营台账
```

页面和 Repository 均不直接 import 某个 JSON。`loadLevelManifest` 在构建期递归发现、校验并检查 ID/路由冲突，Vite 虚拟模块只把通过门禁的内容注入 Worker。Repository 只维护查询语义；公共路径清单和静态 HTML 仅消费 `published`。

Phase 0 和 Phase 1 的本地完成定义由 `npm run quality` 统一执行：模板校验、Prettier、中文职责注释、TypeScript、ESLint、Vitest、生产构建、静态 HTML 门禁、Worker 集成和 Playwright E2E。CI 使用同一命令。

## 3. 路由合同

| 路由                       | 当前状态                | 索引策略              | 正式任务            |
| -------------------------- | ----------------------- | --------------------- | ------------------- |
| `/`                        | 跳转 `/en/`             | 不承载重复正文        | TASK-001            |
| `/en/`                     | 正式产品首页            | 只聚合 `published`    | TASK-001 / TASK-009 |
| `/en/levels/`              | 可筛选关卡聚合          | 空目录 `noindex`      | TASK-010            |
| `/en/levels/:level/`       | 层级化详情与样例        | 草稿 `noindex`        | TASK-011            |
| `/en/hard-levels/`         | 高难与失败模式聚合      | 空目录 `noindex`      | TASK-012            |
| `/en/search/`              | published-only 混合搜索 | `noindex`             | TASK-018            |
| `/en/board-matcher/`       | 规划状态                | `noindex`             | TASK-024            |
| `/en/obstacles/`           | 机制列表与详情          | 空目录/草稿 `noindex` | TASK-013            |
| `/en/boosters/`            | 决策列表与详情          | 空目录/草稿 `noindex` | TASK-014            |
| `/en/guides/`              | 策略列表与详情          | 空目录/草稿 `noindex` | TASK-015            |
| `/en/updates/`             | 版本影响列表与详情      | 空目录/草稿 `noindex` | TASK-016            |
| `/en/about/`、`/en/legal/` | 正式信息页              | 可索引                | TASK-017            |

详情路由只为真实内容实体生成参数，不预建 1～1000 的空页面。Variant 在页面内切换，canonical 保持关卡主 URL。

## 4. 内容生成即发布门禁

> 本节更新时间：2026-08-03 00:13（Asia/Shanghai）

项目由个人同时维护多个站点，不建立逐页人工审核队列。真实文章只能在以下条件全部满足后首次写入 `content/`，并直接使用 `status: published`：

1. 关卡号、Variant、游戏版本、平台和初始棋盘映射明确；
2. 视频可播放并确认允许嵌入，或完整步骤序列可用；
3. 棋盘图或合规替代封面存在；
4. Booster 使用状态和验证状态明确；
5. 前后关卡链接不会指向空壳；
6. SEO 标题、说明、canonical 和可见独立信息完整；
7. 390px 移动端、键盘操作和触控目标检查通过；
8. 内容证据达到对应 Tier 的复现标准，并由当前 Agent 在同一任务内完成校验；
9. 不含 `pending-review`、`needs-review`、`not-started`、`in-progress`、`todo`、占位来源或待用户补齐字段；
10. `npm run validate:content`、相关测试和完整质量链全部通过。

`draft` 只允许用于 `templates/` 下的 `template-*` 结构模板。未完成研究只保存在 `research/`；不能确认的事实失败关闭，不生成真实文章。写入 `content/` 的每个实体必须完整、可发布，并同时进入详情路由、所属栏目、搜索索引、Sitemap 和 JSON-LD；任一展示入口缺失都会使质量门禁失败。

Playlist 同步同样先验证整个批次，再原子写入完整 `published` 文章；任一条缺少棋盘、来源、权利、版本、平台、Variant、正文或 SEO 时整批不写入，不生成等待人工确认的草稿队列。

## 5. 首发阶段

- Phase 0：完成仓库、设计 Token、Schema、Repository、路由、质量和进度基线。
- Phase 1：用 10 个真实关卡验证视频、Variant、移动端详情和发布流程。
- Phase 2：扩展到 50 个 video、10 个 enhanced-video、5 个 full-guide，并补齐机制内容。
- Phase 3：本地搜索、隐私增强视频/章节、原子 Playlist 同步、SEO、Sitemap、结构化数据和响应式质量门禁。
- Phase 4：在有足够真实棋盘数据后开发 pHash 截图匹配，不提前建设上传存储。

## 6. 明确非目标

- 不从参考原型复制竞品素材或把示意棋盘当成游戏截图；
- 不在首轮接数据库、账号、付费或图片上传；
- 不生成 500 个只有 iframe 的页面；
- 不把动态商店评分或排名写死；
- 不在未获当前会话授权时部署、推送或修改外部服务。
