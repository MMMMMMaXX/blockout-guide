<!-- 文件职责：说明 Block Out Guides 设计 Token、组件状态和响应式维护边界。 -->

# Block Out Guides 设计系统

> 文档更新时间：2026-08-03 01:15（Asia/Shanghai）

## 单一来源

`app/globals.css` 的 `:root` 是颜色、容器、圆角和阴影 Token 的唯一来源。业务组件优先使用语义变量，不能重复声明品牌色或用局部渐变制造另一套视觉语言。

开发环境 `/__design-system/` 展示颜色、排版、按钮、状态和竖屏媒体。生产环境访问该路由会返回 404，且 Metadata 固定为 `noindex, nofollow`。

## 组件合同

- `SiteShell`：共享 Header、Footer、Skip Link 和品牌免责声明。
- `SiteNavigation`：维护当前路由、移动端折叠和 `aria-current`。
- `LevelJumpForm`：只接受正整数，稳定跳转 `/en/levels/:level/`。
- `BoardPreview`：仅作框架示意；真实内容必须使用有权利记录的 `boardImage`，或使用带来源且由本站撰写的 `boardProfile`。
- `LevelCard`：整卡单链接；状态和难度必须来自内容实体。

## 响应式检查

> 本节更新时间：2026-08-02 00:12（Asia/Shanghai）

| 宽度   | 重点                                                |
| ------ | --------------------------------------------------- |
| 320px  | 两列关卡卡片不溢出；导航可折叠；固定底栏不遮正文    |
| 390px  | 首要真机场景；输入和按钮至少 40px；竖屏媒体完整可见 |
| 1024px | Header 搜索和主导航共存；详情双栏不挤压正文         |
| 1440px | 内容不超过 `--shell`；信息密度提升但不放大营销字号  |

修改 Token 或共享组件后必须运行完整质量链，并在浏览器视觉验收任务中覆盖以上四个宽度。
