/** 文件职责：覆盖全部已生成内容的导航、展示、搜索与移动端入口。 */
import { expect, test } from "@playwright/test";

test("homepage search opens the published Level 14 guide", async ({ page }) => {
  await page.goto("/en/");
  await page.getByLabel("Level number").last().fill("14");
  await page.getByRole("button", { name: "Find solution" }).last().click();
  await expect(page).toHaveURL(/\/en\/levels\/14\/$/);
  await expect(page.getByRole("heading", { name: "Level 14", exact: true })).toBeVisible();
  await expect(page.getByText("Confirm these board landmarks")).toBeVisible();
});

test("mobile navigation reports the current page", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation contract");
  await page.goto("/en/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await page.getByRole("link", { name: "Levels", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/levels\/$/);
});

test("level collections show the published hard guide", async ({ page }) => {
  // /en/levels/ 分页展示（每页 12 关），L14 不在默认首页；用检索框定位到已发布硬关卡。
  await page.goto("/en/levels/");
  await page.getByLabel("Search verified levels").fill("14");
  await expect(page.getByRole("heading", { name: "Level 14", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);

  // /en/hard-levels/ 首页即包含 L14。
  await page.goto("/en/hard-levels/");
  await expect(page.getByRole("heading", { name: "Level 14", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
});

test("Phase 2 collections and detail pages show every generated article", async ({ page }) => {
  const routes = [
    ["/en/obstacles/", "Ivy obstacle: reveal covered doors"],
    ["/en/boosters/", "Clock booster: when stopping time helps"],
    ["/en/guides/", "How to match a Block Out board variant"],
    ["/en/updates/", "Block Out Version 729: Ivy and new levels"],
  ];
  for (const [pathname, title] of routes) {
    await page.goto(pathname);
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.goto("/en/obstacles/ivy/");
  await expect(page.getByRole("heading", { name: "How Ivy works" })).toBeVisible();
  await page.goto("/en/boosters/time-freeze/");
  await expect(page.getByRole("heading", { name: /When it may help/i })).toBeVisible();
  await page.goto("/en/guides/how-to-read-variants/");
  await expect(
    page.getByRole("heading", { name: /Start with landmarks, not the level number/i }),
  ).toBeVisible();
  await page.goto("/en/updates/version-729/");
  await expect(page.getByRole("heading", { name: /What changed/i })).toBeVisible();
});

test("local search finds generated content", async ({ page }) => {
  await page.goto("/en/search/");
  const search = page.getByLabel("Search published content");
  await search.fill("14");
  await expect(page).toHaveURL(/\/en\/search\/\?q=14$/);
  await expect(page.getByText("Block Out Level 14 Walkthrough")).toBeVisible();
});

test("About, Legal and 404 remain available", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.getByRole("heading", { name: /Board-aware help/i })).toBeVisible();
  await page.goto("/en/legal/");
  await expect(page.getByRole("heading", { name: /Clear boundaries/i })).toBeVisible();
  const response = await page.goto("/en/not-a-real-section/");
  expect(response?.status()).toBe(404);
});
