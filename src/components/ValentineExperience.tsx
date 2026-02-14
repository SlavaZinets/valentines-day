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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

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

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPin(event.target.value);
        if (error) {
            setError(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleUnlock();
        }
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

    const randomPosition = useCallback((cursorX?: number, cursorY?: number) => {
        const container = containerRef.current;
        const button = noButtonRef.current;

        if (!container || !button) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        const maxX = containerRect.width - buttonRect.width;
        const maxY = containerRect.height - buttonRect.height;

        let newX = Math.random() * maxX;
        let newY = Math.random() * maxY;

        // Center coordinates of the button in the new position relative to the viewport
        // to check distance from cursor.
        // However, the button's position is relative to its relative parent.
        // In this case, the parent is a div at line 201.
        // Let's assume for simplicity we just want to avoid the cursor.

        // We need to convert newX, newY (relative to parent) to viewport coordinates
        // or convert cursorX, cursorY to parent-relative coordinates.

        const parent = button.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();

        // Try up to 10 times to find a position that is not under the cursor
        for (let i = 0; i < 10; i++) {
            newX = Math.random() * (parentRect.width - buttonRect.width);
            newY = Math.random() * (parentRect.height - buttonRect.height);

            // If we don't have cursor info, any random position is fine
            if (cursorX === undefined || cursorY === undefined) break;

            const buttonCenterX = parentRect.left + newX + buttonRect.width / 2;
            const buttonCenterY = parentRect.top + newY + buttonRect.height / 2;

            const dist = Math.hypot(buttonCenterX - cursorX, buttonCenterY - cursorY);
            // Ensure the button is at least 100px away from the cursor
            if (dist > 100) break;
        }

        setNoButtonPosition({ x: newX, y: newY });
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

            if (distance < 50) {
                randomPosition(event.clientX, event.clientY);
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
        if (stage === "lock") {
            const timer = setTimeout(() => {
                pinInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }

        if (stage === "question") {
            const interval = setInterval(() => {
                setYesScale((prev) => prev + 0.3);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [stage]);

    useEffect(() => {
        if (stage === "lock" && !audioRef.current) {
            const audio = new Audio("/musicFolder/bg_music.mp3");
            audio.loop = true;
            audio.volume = 1;
            audio.play().catch((err) => console.error("Audio play failed:", err));
            audioRef.current = audio;
        }

        if (stage === "final" && audioRef.current) {
            const audio = audioRef.current;
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.1) {
                    audio.volume -= 0.1;
                } else {
                    audio.volume = 0;
                    audio.pause();
                    clearInterval(fadeOutInterval);
                    if (videoRef.current) {
                        videoRef.current.muted = false;
                        videoRef.current.play().catch(err => console.error("Video play failed:", err));
                    }
                }
            }, 50);
            return () => clearInterval(fadeOutInterval);
        }
    }, [stage]);

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
                    <section
                        key="lock"
                        className="w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-md"
                    >
                        <div
                            className="mb-6 text-7xl"
                        >
                            {lockOpened ? "🔓" : "🔒"}
                        </div>
                        <p className="mb-3 text-lg font-semibold text-rose-800">Введи наш код кохання</p>
                        <input
                            ref={pinInputRef}
                            value={pin}
                            onChange={handlePasswordChange}
                            onKeyDown={handleKeyDown}
                            // type="password"
                            inputMode="numeric"
                            placeholder="наша дата..."
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
                    </section>
                )}

                {stage === "question" && (
                    <section
                        className="relative flex h-[75vh] w-full max-w-3xl flex-col items-center justify-center"
                    >
                        <h1 className="mb-10 text-4xl font-bold text-rose-900 md:text-5xl">Ти будеш моєю Валентинкою? 💖</h1>
                        <div className="relative flex justify-center gap-6 w-full">
                            <button
                                type="button"
                                style={{ scale: yesScale, boxShadow: yesGlow }}
                                onClick={() => setStage("final")}
                                className="z-10 rounded-full bg-rose-600 px-8 py-4 text-xl font-bold text-white w-40"
                            >
                                Так 💕
                            </button>

                            <button
                                ref={noButtonRef}
                                type="button"
                                onPointerEnter={(e) => randomPosition(e.clientX, e.clientY)}
                                onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                                    event.preventDefault();
                                    randomPosition(event.clientX, event.clientY);

                                }}
                                style={{
                                    left: noButtonPosition.x,
                                    top: noButtonPosition.y,
                                }}
                                className=" z-10 absolute w-40 transition-all duration-200 rounded-full bg-white px-6 py-3 font-semibold text-rose-700 shadow-lg"
                            >
                                Ні 😢
                            </button>
                        </div>
                    </section>
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
                            Я знав, що ти скажеш так 😘 з Днем Валентина ❤️❤️❤️
                        </motion.h2>

                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            controls
                            loop
                            className="mx-auto w-full h-80 max-w-2xl rounded-2xl border border-rose-200 shadow-xl"
                        >
                            <source src={"/videoFolder/video.mp4"} type="video/mp4" />
                            Твій браузер не підтримує відтворення відео.
                        </video>
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
}
