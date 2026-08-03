/** 文件职责：安全输出由站内可见事实构造的 JSON-LD，避免 HTML 注入。 */

/** 序列化结构化数据时转义尖括号，防止正文意外闭合 script。 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}
    />
  );
}
