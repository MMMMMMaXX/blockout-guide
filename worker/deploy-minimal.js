/** 文件职责：极简生产 Worker —— 仅服务 Cloudflare Static Assets，不承载 SSR / 图片优化 / 运行时 SEO。
 * 页面与静态资源由 dist/client 经 ASSETS 绑定直接返回；未知路径回退到自定义 404.html。
 * 不导入 vinext/server/app-router-entry、virtual:blockout-content 或图片优化模块，确保脚本体积远低于 3 MiB 免费限制。
 */
const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const notFound = await env.ASSETS.fetch(new Request(`${url.origin}/404.html`));
      return new Response(notFound.body, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }
    return response;
  },
};

export default worker;
