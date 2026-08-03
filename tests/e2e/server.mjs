/** 文件职责：用 Node HTTP 包装生产 Worker，供无 Wrangler 的 E2E 浏览器访问。 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import worker from "../../dist/server/index.js";

const contentTypes = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".html": "text/html",
  ".avif": "image/avif",
};

/** 只从 dist/client 服务构建资产，路径逃逸或缺失统一返回 404。 */
async function fetchAsset(request) {
  const pathname = new URL(request.url).pathname;
  const relative = pathname.replace(/^\/+/, "");
  const target = path.resolve("dist/client", relative);
  if (!target.startsWith(path.resolve("dist/client")))
    return new Response("Not found", { status: 404 });
  try {
    const info = await stat(target);
    const file = info.isDirectory() ? path.join(target, "index.html") : target;
    return new Response(await readFile(file), {
      headers: { "content-type": contentTypes[path.extname(file)] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

const server = createServer(async (incoming, outgoing) => {
  const request = new Request(`http://127.0.0.1:4173${incoming.url}`, {
    method: incoming.method,
    headers: incoming.headers,
  });
  // 生产平台会在 Worker 路由前直接服务静态资产；本地包装器保持同一顺序。
  const pathname = new URL(request.url).pathname;
  const isStaticAsset =
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/boards/") ||
    pathname === "/favicon.svg";
  const response = isStaticAsset
    ? await fetchAsset(request)
    : await worker.fetch(
        request,
        { ASSETS: { fetch: fetchAsset } },
        { waitUntil() {}, passThroughOnException() {} },
      );
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(4173, "127.0.0.1", () => console.log("E2E server ready on 4173"));
