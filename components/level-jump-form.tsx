/** 文件职责：提供可键盘与触控操作的关卡号跳转交互。 */
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** 校验正整数后进入稳定关卡 URL，避免把无效输入写入路由。 */
export function LevelJumpForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [levelNumber, setLevelNumber] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLevel = Number.parseInt(levelNumber, 10);
    if (!Number.isSafeInteger(parsedLevel) || parsedLevel < 1) return;
    router.push(`/en/levels/${parsedLevel}/`);
  }

  return (
    <form className={`level-jump${compact ? " level-jump--compact" : ""}`} onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={compact ? "header-level" : "hero-level"}>
        Level number
      </label>
      <input
        id={compact ? "header-level" : "hero-level"}
        inputMode="numeric"
        min="1"
        pattern="[0-9]*"
        placeholder={compact ? "Level #" : "Enter a level number, e.g. 14"}
        type="number"
        value={levelNumber}
        onChange={(event) => setLevelNumber(event.target.value)}
      />
      <button type="submit">Find solution</button>
    </form>
  );
}
