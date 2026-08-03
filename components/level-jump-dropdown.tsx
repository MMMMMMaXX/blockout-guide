/** 文件职责：按 30 关一组渲染所有已发布关卡号的下拉选择面板，供搜索框下方展开复用。 */
"use client";

import Link from "next/link";
import { useMemo } from "react";
type LevelJumpDropdownProps = {
  levels: readonly LevelJumpItem[];
  onClose: () => void;
  /** 是否显示顶部的“全部 N 关”标题与关闭按钮 */
  showHeader?: boolean;
};

/** 数字跳转菜单只依赖关卡号，允许首页实体和底栏轻量投影复用同一展示。 */
export type LevelJumpItem = {
  id?: string;
  levelNumber: number;
};

const GROUP_SIZE = 30;

/**
 * 关卡号下拉面板：按 30 关分组，每关一个直达链接。
 * 点击外部或 Escape 的关闭逻辑由父组件统一处理，避免两套监听冲突。
 */
export function LevelJumpDropdown({ levels, onClose, showHeader = true }: LevelJumpDropdownProps) {
  const groups = useMemo(() => {
    const sorted = [...levels].sort((a, b) => a.levelNumber - b.levelNumber);
    const result: { label: string; items: LevelJumpItem[] }[] = [];
    for (let index = 0; index < sorted.length; index += GROUP_SIZE) {
      const slice = sorted.slice(index, index + GROUP_SIZE);
      const first = slice[0].levelNumber;
      const last = slice[slice.length - 1].levelNumber;
      result.push({ label: `${first}–${last}`, items: slice });
    }
    return result;
  }, [levels]);

  return (
    <div className="level-jump-menu" role="listbox" aria-label="All level numbers">
      {showHeader ? (
        <div className="level-jump-menu__head">
          <span>All {levels.length} published levels</span>
          <button
            type="button"
            className="level-jump-menu__close"
            onClick={onClose}
            aria-label="Close level list"
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="level-jump-menu__body">
        {groups.map((group) => (
          <section key={group.label} className="level-jump-menu__group">
            <p className="level-jump-menu__label">{group.label}</p>
            <div className="level-jump-menu__grid">
              {group.items.map((level) => (
                <Link
                  key={`${group.label}-${level.id ?? level.levelNumber}`}
                  href={`/en/levels/${level.levelNumber}/`}
                  className="level-jump-menu__item"
                  onClick={onClose}
                >
                  {level.levelNumber}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
