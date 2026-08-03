/** 文件职责：集中声明 Next 兼容层配置，当前保持最小安全默认值。 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 产品路由合同统一使用尾斜杠，避免 canonical 与运行时规范化方向相反。
  trailingSlash: true,
  // 棋盘封面已经是服务端下载的 AVIF，本地 dev 没有 env.ASSETS 绑定，禁用图片优化以直接服务静态资源。
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
