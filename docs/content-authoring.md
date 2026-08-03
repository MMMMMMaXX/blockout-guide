<!-- 文件职责：规定内容 Agent 如何一次生成可上线文章，并隔离结构模板与未完成研究。 -->

# Level 内容作者规范

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 最高优先级：生成即发布

> 本节更新时间：2026-08-03 01:15（Asia/Shanghai）

本项目由个人同时维护多个网站，不设置逐页人工审核队列。任何 Agent 生成真实文章时，必须在同一个任务内把它完成到可线上发布质量，并直接写入 `content/`，使用 `status: published`。

生成任务只有在该实体同时出现在详情路由、所属栏目页、站内搜索和 Sitemap 后才算完成。`npm run validate:content` 会逐篇核对生产路由与搜索索引，生产构建还会验证栏目、详情和抓取入口；“文件已生成但页面不可见”属于发布失败。

- 不得生成 `pending-review`、`needs-review`、`not-started`、`in-progress`、`todo` 或语义等价的字段和值；
- 不得把缺来源、缺媒体权利、缺正文、缺翻译、缺 SEO、缺版本或缺核验结果的文件放进 `content/` 等待用户补齐；
- 无法诚实补齐的候选素材只能放在 `research/`，不能形成真实文章或生产路由；
- `draft` 只属于 `template-*` 结构模板，模板不能改名伪装成真实文章；
- 自动化可以代替逐页人工审批，但不能代替事实证据。不能确认的内容必须失败关闭，禁止猜测。

完成定义：文章正文、来源、版本、平台、Variant、棋盘或媒体权利、视频嵌入状态、SEO、内链、日期和结构化数据全部齐全，并通过 `npm run validate:content` 与 `npm run quality`。Agent 不能把任何后续审核步骤列为交付后的用户任务。

## 选择内容层级

| Tier             | 使用场景             | 最低正文                                                |
| ---------------- | -------------------- | ------------------------------------------------------- |
| `video`          | 大多数普通关卡       | 匹配棋盘、可嵌入视频、版本/平台/Booster/验证信息        |
| `enhanced-video` | 流量较高或容易误操作 | video 全部字段、至少 3 个时间点、3 条提示和已复现失败点 |
| `full-guide`     | 核心高难与机制代表关 | video 全部字段、3 条提示、至少 3 个步骤及失败原因       |

模板位于 `templates/content/`，永远保持 `draft`、`template-*` ID、无真实来源和无视频。Agent 可以用模板理解结构，但应在内存或 `research/` 中完成材料组装；只有完整结果才能以新 ID、`published` 状态写入 `content/{locale}/levels/`。

## Phase 2 内容类型

> 本节更新时间：2026-08-03 01:26（Asia/Shanghai）

`templates/editorial/` 包含 Obstacle、Booster、Guide、Update 四种安全草稿：

- Obstacle 必须记录触发规则、决策优先级、避坑点和已发布关联关卡；
- Booster 必须同时回答使用条件与不使用条件，不能只写效果宣传；
- Guide 必须解决跨关卡的独立问题，并包含至少两个有来源支撑的正文段落；
- Update 必须保留版本来源、已核验变化、受影响内容与影响检查日期。

四类内容发布时都需要独立 SEO、至少一个来源和 `verifiedAt`。参考原型只能用于页面结构，不能作为游戏事实来源。

## Agent 生成顺序

1. 记录来源和视频授权状态，不先写解法结论。
2. 确认关卡号、初始棋盘、Variant、游戏版本与平台。
3. 完整复现视频或步骤，记录 Booster 使用情况。
4. 按 Tier 补充时间点、提示、步骤和失败点。
5. 填写独立 SEO 标题与说明；不得复用模板文案。
6. 在同一任务内完成证据复核，写入 `verifiedAt` 和最终 `verificationStatus`。
7. 以 `published` 写入真实文章，运行 `npm run validate:templates`、`npm run validate:content` 与完整质量链。

## 发布检查

> 本节更新时间：2026-08-03 01:26（Asia/Shanghai）

- 棋盘图属于当前 Variant，路径指向实际 WebP/AVIF 资源；
- 视频允许嵌入，创作者与来源 URL 可追溯；
- 页面不含模板提示、占位来源或未复现结论；
- `source-verified` 或 `fully-verified` 与真实核验过程一致；
- 前后关或关联内容只链接已发布实体；
- 390px 页面能完整操作 Variant、视频时间点与移动底栏；
- 真实文章首次写入 `content/` 时就必须满足以上条件并使用 `published`；否则不应生成该文章。
