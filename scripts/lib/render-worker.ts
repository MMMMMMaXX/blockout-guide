/** 文件职责：为预渲染和构建验证共享生产 Worker 的 HTML 渲染入口。 */

type WorkerFetch = (
  request: Request,
  env: Record<string, unknown>,
  ctx: { waitUntil: () => void; passThroughOnException: () => void },
) => Response | Promise<Response>;

/** Worker 模块在整个进程内只加载一次，避免逐页重复 import 导致内存累积 OOM。 */
let workerModulePromise: Promise<{ default: { fetch: WorkerFetch } }> | null = null;

async function loadWorkerModule(): Promise<{ default: { fetch: WorkerFetch } }> {
  if (!workerModulePromise) {
    workerModulePromise = (async () => {
      const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
      return (await import(workerUrl.href)) as { default: { fetch: WorkerFetch } };
    })();
  }
  return workerModulePromise;
}

/** 导入最新构建 Worker 并渲染指定路径，避免测试缓存上一次产物。 */
export async function renderWorkerPath(pathname: string): Promise<Response> {
  const { default: worker } = await loadWorkerModule();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}
