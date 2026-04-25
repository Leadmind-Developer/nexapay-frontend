"use client";

import { ReactNode, useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface AuthPageProps {
  videoSrc: string;
  imageSrc: string;
  children: ReactNode;
}

export default function AuthPage({
  videoSrc,
  imageSrc,
  children,
}: AuthPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 📱 Viewport + mobile detection (optimized)                                  */
  /* -------------------------------------------------------------------------- */
  const updateViewport = useCallback(() => {
    const height =
      window.visualViewport?.height ?? window.innerHeight;

    setViewportHeight(height);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    updateViewport();

    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, [updateViewport]);

  /* -------------------------------------------------------------------------- */
  /* 🎥 Safe video autoplay (iOS/Android compatible)                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch {
        // Autoplay blocked – silently ignore (expected on some devices)
      }
    };

    playVideo();
  }, [videoSrc]);

  /* -------------------------------------------------------------------------- */
  /* 📏 Overflow detection (debounced + safe observer)                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame: number;

    const checkOverflow = () => {
      frame = requestAnimationFrame(() => {
        setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
      });
    };

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    checkOverflow();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{
        height: viewportHeight ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* ---------------------------------------------------------------------- */}
      {/* Desktop background image                                               */}
      {/* ---------------------------------------------------------------------- */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* Mobile video background                                                */}
      {/* ---------------------------------------------------------------------- */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        className={`block md:hidden absolute inset-0 w-full h-full object-cover ${
          isMobile ? "object-top" : "object-center"
        }`}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* Content layer                                                          */}
      {/* ---------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-4 pt-24 md:pt-20 w-full"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : "100vh",
        }}
      >
        <div
          ref={containerRef}
          className={`
            w-full max-w-md
            bg-black/40 backdrop-blur-md
            p-6 rounded-2xl shadow-lg
            transition-all duration-200

            ${isOverflowing ? "overflow-y-auto overscroll-contain" : ""}
            max-h-full
          `}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
