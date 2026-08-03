/** 文件职责：为预渲染和构建验证共享生产 Worker 的 HTML 渲染入口。 */

/** 导入最新构建 Worker 并渲染指定路径，避免测试缓存上一次产物。 */
export async function renderWorkerPath(pathname: string): Promise<Response> {
  const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("build", `${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}
