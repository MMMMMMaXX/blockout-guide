<!-- 文件职责：说明 Phase 0 质量链、测试分层和 CI 失败处理边界。 -->

# 质量门禁

> 文档更新时间：2026-08-02 23:56（Asia/Shanghai）

`npm run quality` 是本地和 CI 的统一完成定义，顺序为：格式、中文职责注释、TypeScript、ESLint、结构模板检查、生产内容生成即发布检查、单元测试、生产构建、静态预渲染与 HTML 门禁、Worker 集成测试、Playwright E2E。

## 测试分层

- Vitest：Schema 发布约束、内容发现冲突、生成即发布策略、Playlist 原子转换、SEO、Repository 与公共路径过滤。
- 构建门禁：逐个生成并读取公共静态 HTML，检查标题、说明和 `noindex` 冲突。
- Worker 集成：直接调用部署入口，检查首页、草稿详情和开发专用路由。
- Playwright：桌面与移动端的关卡跳转、折叠菜单、当前路由和 robots 状态。

禁止为了让 CI 变绿而移除发布约束或跳过失败用例。若某项依赖外部浏览器或系统包，CI 负责安装 Chromium；应用测试不依赖账号、网络 API 或真实用户数据。
