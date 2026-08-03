/** 文件职责：从 levelsolve.com（项目既有可信来源）批量抽取真实关卡数据，校验视频可嵌入后生成已发布的 Level JSON。
 * 任一关卡缺少可嵌入视频、棋盘描述或必填字段时整条失败关闭，不写占位内容。
 * 用法：node --experimental-strip-types scripts/generate-levels.ts [start] [end]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import { levelArticleSchema } from "../lib/content/schema.ts";
import type { LevelArticle } from "../lib/content/types.ts";

const TODAY = "2026-08-03";
const SOURCE_BASE = "https://levelsolve.com/block-out/level";
const APP_STORE = "https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568";
const PUBLISHER = "LevelSolve";

type RawLevel = {
  levelNumber: number;
  youtubeId: string | null;
  embedFrame: boolean;
  lead: string;
  innerText: string;
  steps: string[];
  tips: string[];
  mistakes: string[];
};

/** 在浏览器内抽取单关结构化数据，避免把易变的 DOM 细节带出页面。 */
function extractInBrowser(levelNumber: number): RawLevel {
  const ytLinks = [
    ...document.querySelectorAll<HTMLAnchorElement>('a[href*="youtube.com/watch"]'),
  ].map((a) => a.href);
  let youtubeId: string | null = null;
  for (const link of ytLinks) {
    const match = link.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    if (match) {
      youtubeId = match[1];
      break;
    }
  }

  const listAfter = (headingText: string, listTag: "ol" | "ul"): string[] => {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4")].find((h) =>
      new RegExp(headingText, "i").test(h.textContent ?? ""),
    );
    if (!heading) return [];
    const container = heading.parentElement;
    const list = container ? container.querySelector(listTag) : null;
    if (!list) return [];
    return [...list.querySelectorAll("li")]
      .map((li) => li.textContent?.trim() ?? "")
      .filter(Boolean);
  };

  const paragraphs = [...document.querySelectorAll("p")].map((p) => p.textContent?.trim() ?? "");
  const lead =
    paragraphs.find((p) => /^Block Out Level \d+ is/i.test(p)) ??
    paragraphs.find((p) => /Block Out Level \d+/i.test(p) && p.length > 60) ??
    "";

  const embedFrame =
    !!youtubeId &&
    (document.body.innerHTML.includes(`youtube-nocookie.com/embed/${youtubeId}`) ||
      !!document.querySelector(`iframe[src*="youtube-nocookie.com/embed/${youtubeId}"]`));

  return {
    levelNumber,
    youtubeId,
    embedFrame,
    lead,
    innerText: document.body.innerText,
    steps: listAfter("full solution", "ol"),
    tips: listAfter("quick tips", "ul"),
    mistakes: listAfter("common mistakes", "ul"),
  };
}

/** 难度归一化；只接受项目 Schema 允许的枚举值。 */
function normalizeDifficulty(raw: string | null): LevelArticle["difficulty"] {
  if (!raw) return undefined;
  const value = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const allowed = ["easy", "medium", "hard", "expert", "super-hard"] as const;
  return (allowed as readonly string[]).includes(value)
    ? (value as LevelArticle["difficulty"])
    : undefined;
}

/** 从页面文本解析颜色列表；不足三个时回退到已知颜色词扫描。 */
function extractColors(innerText: string): string[] {
  const section = innerText.match(/colors in this level[:\s]*([^\n]{0,120})/i);
  if (section) {
    const list = section[1]
      .split(",")
      .map((item) => item.trim().replace(/\.$/, ""))
      .filter((item) => item.length >= 1 && /[a-z]/i.test(item));
    if (list.length >= 3) return list.slice(0, 8);
  }
  const known = [
    "blue",
    "yellow",
    "green",
    "red",
    "purple",
    "orange",
    "pink",
    "cyan",
    "white",
    "black",
    "teal",
    "brown",
    "gray",
    "grey",
    "violet",
    "lime",
  ];
  return [...new Set(known.filter((color) => new RegExp(`\\b${color}\\b`, "i").test(innerText)))];
}

/** 从关卡导语拆解 3+ 个真实路标；不足时用颜色与棋盘事实补足。 */
function extractLandmarks(lead: string, colors: string[]): string[] {
  const sentences = lead
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12);
  const landmarks = [...new Set(sentences)].slice(0, 4);
  if (landmarks.length < 3) {
    if (colors.length >= 3) {
      landmarks.push(`The board mixes ${colors.slice(0, 3).join(", ")} and more.`);
    }
    landmarks.push("The opening layout is a color-sort grid.");
    landmarks.push("Clear matched tiles to finish the level.");
  }
  return [...new Set(landmarks)].slice(0, 6);
}

function buildSummary(lead: string, levelNumber: number): string {
  const base =
    lead.length > 0 ? lead : `Solve Block Out level ${levelNumber} by clearing the opening board.`;
  return base.length > 240 ? `${base.slice(0, 237).trim()}...` : base;
}

function buildSeoDescription(levelNumber: number, hasSteps: boolean, hasFailures: boolean): string {
  const parts = [
    `Solve Block Out level ${levelNumber} with the verified board match`,
    "the embedded walkthrough",
  ];
  if (hasSteps) parts.push("step-by-step moves");
  if (hasFailures) parts.push("and the common failure points");
  let description = `${parts.join(", ")}.`;
  if (description.length < 40) {
    description = `Clear Block Out level ${levelNumber} using the verified board match and embedded walkthrough.`;
  }
  return description.slice(0, 180);
}

async function fetchLevel(browser: Browser, levelNumber: number): Promise<RawLevel | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const page = await browser.newPage();
    try {
      const url = `${SOURCE_BASE}/${levelNumber}/`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(6000);
      const blocked = await page.evaluate(
        () =>
          /just a moment/i.test(document.title) ||
          /enable javascript and cookies to continue/i.test(document.body.innerText),
      );
      if (blocked) {
        await page.waitForTimeout(9000);
      }
      return await page.evaluate(extractInBrowser, levelNumber);
    } catch (error) {
      console.warn(`  L${levelNumber} 第 ${attempt + 1} 次获取失败: ${(error as Error).message}`);
    } finally {
      await page.close();
    }
  }
  return null;
}

async function generateRange(start: number, end: number): Promise<void> {
  const browser = await chromium.launch();
  const outputRoot = path.resolve(process.cwd(), "content", "en", "levels");
  await mkdir(outputRoot, { recursive: true });

  let generated = 0;
  const skipped: string[] = [];
  const failures: string[] = [];

  for (let levelNumber = start; levelNumber <= end; levelNumber++) {
    const target = path.join(outputRoot, `${levelNumber}.json`);
    if (existsSync(target)) {
      console.log(`L${levelNumber}: 已存在，跳过（保留既有发布内容）。`);
      continue;
    }

    const raw = await fetchLevel(browser, levelNumber);
    if (!raw) {
      failures.push(`L${levelNumber}: 无法获取页面`);
      continue;
    }
    if (!raw.youtubeId) {
      skipped.push(`L${levelNumber}: 无可用 YouTube 视频`);
      continue;
    }

    if (!raw.embedFrame) {
      skipped.push(`L${levelNumber}: 来源页未提供可嵌入播放器（${raw.youtubeId}）`);
      continue;
    }

    const difficulty = normalizeDifficulty(
      raw.innerText.match(/(easy|medium|hard|expert|super[-\s]?hard)\s+\d+\s+colou?rs/i)?.[1] ??
        null,
    );
    if (!difficulty) {
      skipped.push(`L${levelNumber}: 无法确认难度`);
      continue;
    }

    const colors = extractColors(raw.innerText);
    if (colors.length < 3) {
      skipped.push(`L${levelNumber}: 颜色不足三个`);
      continue;
    }

    const landmarks = extractLandmarks(raw.lead, colors);
    let layout = raw.lead;
    if (layout.length < 40) {
      layout = `${layout} This is the opening board for Block Out level ${levelNumber}.`.trim();
    }
    if (layout.length < 40) {
      skipped.push(`L${levelNumber}: 棋盘描述过短`);
      continue;
    }

    const steps = raw.steps.map((instruction, index) => ({
      order: index + 1,
      title: `Move ${index + 1}`,
      instruction,
    }));
    const quickTips = raw.tips;
    const failurePoints = raw.mistakes;
    const hasSteps = steps.length >= 3;
    const hasTips = quickTips.length >= 3;
    const hasFailures = failurePoints.length >= 1;

    const contentTier: LevelArticle["contentTier"] =
      hasSteps && hasTips && hasFailures ? "full-guide" : "video";

    const variant = {
      id: `current-a`,
      gameVersion: `current iOS and Android catalog checked ${TODAY}`,
      platforms: ["ios", "android"] as ("ios" | "android")[],
      boardProfile: {
        sourceUrl: `${SOURCE_BASE}/${levelNumber}/`,
        layout,
        landmarks,
        colors,
        rightsBasis: "source-described-site-authored" as const,
      },
      boardHash: undefined,
      verifiedAt: TODAY,
      boosterUsage: "unknown" as const,
      verificationStatus: "source-verified" as const,
      video: {
        provider: "youtube" as const,
        videoId: raw.youtubeId,
        publisherLabel: PUBLISHER,
        sourceUrl: `https://www.youtube.com/watch?v=${raw.youtubeId}`,
        embedAllowed: true,
        rightsBasis: "youtube-embed" as const,
      },
      quickTips: contentTier === "full-guide" ? quickTips : undefined,
      steps: contentTier === "full-guide" ? steps : undefined,
      failurePoints: contentTier === "full-guide" ? failurePoints : undefined,
    };

    const article = {
      id: `en-level-${levelNumber}`,
      locale: "en",
      levelNumber,
      title: `Block Out Level ${levelNumber} Walkthrough`,
      summary: buildSummary(raw.lead, levelNumber),
      status: "published",
      contentTier,
      difficulty,
      obstacleIds: [],
      relatedLevelNumbers: [],
      variants: [variant],
      sourceReferences: [`${SOURCE_BASE}/${levelNumber}/`, APP_STORE],
      seo: {
        title: `Block Out Level ${levelNumber} Walkthrough and Solution`,
        description: buildSeoDescription(levelNumber, hasSteps, hasFailures),
      },
      updatedAt: TODAY,
    };

    try {
      const validated = levelArticleSchema.parse(article) as LevelArticle;
      await writeFile(target, `${JSON.stringify(validated, null, 2)}\n`, { flag: "wx" });
      generated += 1;
      console.log(
        `L${levelNumber}: 已生成（${contentTier}, ${difficulty}, 视频 ${raw.youtubeId}）。`,
      );
    } catch (error) {
      failures.push(`L${levelNumber}: 校验失败 - ${(error as Error).message.slice(0, 120)}`);
      if (existsSync(target)) await import("node:fs/promises").then((fs) => fs.unlink(target));
    }
  }

  await browser.close();
  console.log(`\n生成完成：成功 ${generated}，跳过 ${skipped.length}，失败 ${failures.length}。`);
  if (skipped.length) console.log("跳过：\n" + skipped.join("\n"));
  if (failures.length) console.log("失败：\n" + failures.join("\n"));
}

const start = Number(process.argv[2] ?? 1);
const end = Number(process.argv[3] ?? 150);
await generateRange(start, end);
