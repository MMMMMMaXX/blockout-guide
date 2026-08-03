"use client";

import { useState } from "react";

/** 检测步骤图是否为横屏，用于决定采用横向并列还是竖向堆叠布局。 */
export function StepImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLandscape, setIsLandscape] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`${className ?? ""}${isLandscape ? " step-media--landscape" : ""}`}
      loading="lazy"
      onLoad={(event) => {
        const img = event.currentTarget;
        if (img.naturalWidth > img.naturalHeight) {
          setIsLandscape(true);
        }
      }}
    />
  );
}
