/** 文件职责：从生产 Worker 验证全部已生成内容在页面与抓取入口可见。 */
import assert from "node:assert/strict";
import test from "node:test";

/** 通过构建产物渲染指定路径，确保测试覆盖真实部署入口。 */
async function render(pathname = "/en/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("homepage and level collections expose published levels", async () => {
  // 首页按 updatedAt 展示最新 8 个关卡；全部为同一天时取清单前 8（即 1-8）。
  const home = await render("/en/");
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /[0-9]+ verified levels are live/);
  assert.match(homeHtml, /Level (?:<!-- -->)?1\b/);
  assert.doesNotMatch(homeHtml, /name="robots" content="noindex/i);

  for (const pathname of ["/en/levels/", "/en/hard-levels/"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Level (?:<!-- -->)?14/);
    assert.doesNotMatch(html, /name="robots" content="noindex/i);
  }
});

test("published Level 14 renders the full solution", async () => {
  const response = await render("/en/levels/14/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Confirm these board landmarks/);
  assert.match(html, /STEP-BY-STEP SOLUTION/);
  assert.match(html, /Release the centerpiece/);
  assert.doesNotMatch(html, /Template preview|\bpending\b|name="robots" content="noindex/i);
  assert.equal((await render("/en/levels/218/")).status, 404);
});

test("all Phase 2 collections and details expose published content", async () => {
  const routes = [
    ["/en/obstacles/", /Ivy obstacle: reveal covered doors/],
    ["/en/obstacles/ivy/", /How Ivy works/],
    ["/en/boosters/", /Clock booster: when stopping time helps/],
    ["/en/boosters/time-freeze/", /When it may help/],
    ["/en/guides/", /How to match a Block Out board variant/],
    ["/en/guides/how-to-read-variants/", /Start with landmarks, not the level number/],
    ["/en/updates/", /Block Out Version 729: Ivy and new levels/],
    ["/en/updates/version-729/", /What changed/],
  ];
  for (const [pathname, copy] of routes) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, copy);
    assert.doesNotMatch(html, /Editorial research preview|name="robots" content="noindex/i);
  }
});

test("search finds published content while remaining noindex", async () => {
  const response = await render("/en/search/?q=14");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Block Out Level 14 Walkthrough/);
  assert.match(html, /name="robots" content="noindex, follow"/i);
});

test("serves information pages, 404 and published crawl files", async () => {
  for (const pathname of ["/en/about/", "/en/legal/"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /name="robots" content="noindex/i);
  }
  assert.equal((await render("/en/not-a-real-section/")).status, 404);
  assert.equal((await render("/__design-system/")).status, 404);
  const robots = await (await render("/robots.txt")).text();
  assert.match(robots, /Disallow: \/en\/search\//);
  const sitemap = await (await render("/sitemap.xml")).text();
  for (const path of [
    "levels/14",
    "obstacles/ivy",
    "boosters/time-freeze",
    "guides/how-to-read-variants",
    "updates/version-729",
  ]) {
    assert.match(sitemap, new RegExp(path));
  }
  assert.doesNotMatch(sitemap, /levels\/218/);
});
