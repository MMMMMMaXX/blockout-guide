/** 文件职责：提供 vinext 的 Cloudflare Worker 入口和图片优化适配（仅用于构建期预渲染与本地测试；生产部署在构建末尾由 worker/deploy-minimal.js 替换）。 */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { levelMeta, editorialMeta } from "virtual:blockout-content";
import { buildRobotsText, buildSitemapXml } from "@/lib/seo/crawl-files";

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  /** 构建期入口保留完整运行时职责；生产部署由 scripts/build-deploy-worker.ts 改写为极简静态资源 Worker。 */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      return new Response(buildRobotsText(), {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname === "/sitemap.xml") {
      return new Response(buildSitemapXml(levelMeta, editorialMeta), {
        headers: { "content-type": "application/xml; charset=utf-8" },
      });
    }

    // 产品路由合同统一使用尾斜杠；把无尾斜杠请求 301 合并到规范 URL，避免 GSC 中展示量被拆分。
    if (url.pathname !== "/" && !url.pathname.endsWith("/") && !url.pathname.includes(".")) {
      const target = new URL(`${url.pathname}/${url.search}`, url.origin);
      return new Response(null, {
        status: 301,
        headers: { location: target.toString() },
      });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => {
            // 生产平台通过 env.ASSETS 服务静态资产；本地 vinext dev 无此绑定，回退到同域 fetch。
            const assetUrl = new URL(path, request.url);
            if (env.ASSETS) {
              return env.ASSETS.fetch(new Request(assetUrl));
            }
            return fetch(assetUrl);
          },
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
