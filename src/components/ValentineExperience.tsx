"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Stage = "intro" | "lock" | "question" | "final";

const CORRECT_CODE = "01072024";

export function ValentineExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [lockOpened, setLockOpened] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const requestFullscreen = async () => {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      try {
        await root.requestFullscreen();
      } catch {
        // Fullscreen can fail silently depending on browser settings.
      }
    }
  };

  const handleStart = async () => {
    await requestFullscreen();
    setStage("lock");
  };

  const handleUnlock = () => {
    pinInputRef.current?.blur();

    if (pin === CORRECT_CODE) {
      setError(false);
      setLockOpened(true);
      window.setTimeout(() => {
        setStage("question");
      }, 900);
      return;
    }

    setError(true);
    setLockOpened(false);
  };

  const randomPosition = useCallback(() => {
    const container = containerRef.current;
    const button = noButtonRef.current;

    if (!container || !button) {
      return;
    }

    const padding = 24;
    const maxX = container.clientWidth - button.offsetWidth - padding;
    const maxY = container.clientHeight - button.offsetHeight - padding;

    const nextX = Math.max(padding, Math.random() * maxX);
    const nextY = Math.max(padding, Math.random() * maxY);

    setNoButtonPosition({ x: nextX, y: nextY });
    setYesScale((value) => Math.min(value + 0.08, 1.75));
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (stage !== "question") {
        return;
      }

      const button = noButtonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

      if (distance < 120) {
        randomPosition();
      }
    },
    [randomPosition, stage],
  );

  const yesGlow = useMemo(
    () =>
      yesScale > 1
        ? "0 0 25px rgba(255, 105, 180, 0.65), 0 0 60px rgba(255, 20, 147, 0.35)"
        : "0 0 0px rgba(0, 0, 0, 0)",
    [yesScale],
  );

  useEffect(() => {
    if (stage === "question") {
      randomPosition();
    }
  }, [randomPosition, stage]);

  return (
    <main
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-200 via-rose-300 to-fuchsia-300 p-6 text-center"
    >
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.section
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              animate={{ scale: [1, 1.14, 1], rotate: [0, -6, 6, 0] }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="text-8xl drop-shadow-[0_0_28px_rgba(255,20,147,0.85)]"
            >
              ❤️
            </motion.div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleStart}
              className="rounded-full bg-white/70 px-7 py-4 text-lg font-semibold text-rose-700 shadow-xl backdrop-blur"
            >
              Для продовження натисни будь-де ❤️
            </motion.button>
          </motion.section>
        )}

        {stage === "lock" && (
          <motion.section
            key="lock"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-md"
          >
            <motion.div
              animate={
                error
                  ? { x: [0, -12, 12, -8, 8, -4, 4, 0] }
                  : lockOpened
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 rgba(255, 20, 147, 0)",
                          "0 0 45px rgba(255, 20, 147, 0.8)",
                          "0 0 0 rgba(255, 20, 147, 0)",
                        ],
                      }
                    : { x: 0 }
              }
              transition={{ duration: 0.65 }}
              className="mb-6 text-7xl"
            >
              {lockOpened ? "🔓" : "🔒"}
            </motion.div>
            <p className="mb-3 text-lg font-semibold text-rose-800">Введи наш код кохання</p>
            <input
              ref={pinInputRef}
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                setError(false);
                pinInputRef.current?.focus();
              }}
              type="password"
              inputMode="numeric"
              placeholder="01072024"
              className={`w-full rounded-xl border px-4 py-3 text-center text-xl tracking-widest outline-none transition ${
                error
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-rose-200 bg-white text-rose-700 focus:border-rose-400"
              }`}
            />
            {error && <p className="mt-3 text-sm text-red-600">Невірний код, спробуй ще раз 💔</p>}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleUnlock}
              className="mt-5 w-full rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white shadow-lg shadow-rose-500/40"
            >
              Відкрити
            </motion.button>
          </motion.section>
        )}

        {stage === "question" && (
          <motion.section
            key="question"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative flex h-[75vh] w-full max-w-3xl flex-col items-center justify-center"
          >
            <h1 className="mb-10 text-4xl font-bold text-rose-900 md:text-5xl">Ти будеш моєю Валентинкою? 💖</h1>

            <motion.button
              type="button"
              style={{ scale: yesScale, boxShadow: yesGlow }}
              whileTap={{ scale: yesScale * 0.97 }}
              onClick={() => setStage("final")}
              className="z-10 rounded-full bg-rose-600 px-8 py-4 text-xl font-bold text-white"
            >
              Так 💕
            </motion.button>

            <motion.button
              ref={noButtonRef}
              type="button"
              animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              onPointerEnter={randomPosition}
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                event.preventDefault();
                randomPosition();
              }}
              className="absolute left-0 top-0 rounded-full bg-white px-6 py-3 font-semibold text-rose-700 shadow-lg"
            >
              Ні 😢
            </motion.button>
          </motion.section>
        )}

        {stage === "final" && (
          <motion.section
            key="final"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl rounded-3xl bg-white/65 p-6 shadow-2xl backdrop-blur-md md:p-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-3xl font-bold text-rose-800 md:text-4xl"
            >
              Я знав, що ти скажеш так! з днем Валентина &lt;3
            </motion.h2>

            <motion.video
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              controls
              loop
              className="mx-auto w-full max-w-2xl rounded-2xl border border-rose-200 shadow-xl"
            >
              <source src="/video.mp4" type="video/mp4" />
              Твій браузер не підтримує відтворення відео.
            </motion.video>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
