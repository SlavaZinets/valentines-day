"use client";

import {
  createElement,
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type PropsWithChildren,
} from "react";

type MotionProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  animate?: Record<string, unknown>;
  initial?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  transition?: { duration?: number };
};

function safeStyle(input: Record<string, unknown> | undefined): CSSProperties {
  if (!input) {
    return {};
  }

  const style: CSSProperties = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" || typeof value === "number") {
      style[key as keyof CSSProperties] = value as never;
    }
  }
  return style;
}

function createMotionComponent<T extends ElementType>(tag: T) {
  return forwardRef<HTMLElement, MotionProps<T>>(function MotionComponent(props, ref) {
    const { animate, initial, exit, whileTap, transition, style, children, ...rest } = props;
    void exit;
    void whileTap;

    const combinedStyle: CSSProperties = {
      ...safeStyle(initial),
      ...safeStyle(animate),
      ...(style as CSSProperties),
      transitionDuration: typeof transition?.duration === "number" ? `${transition.duration}s` : undefined,
    };

    return createElement(tag, { ...rest, ref, style: combinedStyle }, children);
  });
}

export function AnimatePresence({ children }: PropsWithChildren<{ mode?: string }>) {
  return <>{children}</>;
}

export const motion = new Proxy(
  {},
  {
    get: (_, tag: string) => createMotionComponent(tag as ElementType),
  },
) as Record<string, ReturnType<typeof createMotionComponent>>;
