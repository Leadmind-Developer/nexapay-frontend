"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 📱 Detect mobile + dynamic viewport height (keyboard safe)                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);

      // Use visualViewport when available (iOS Safari keyboard fix)
      const height =
        window.visualViewport?.height || window.innerHeight;

      setViewportHeight(height);
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🎥 Safe video autoplay                                                      */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [videoSrc]);

  /* -------------------------------------------------------------------------- */
  /* 📏 Auto-detect long forms → enable scroll                                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const el = containerRef.current!;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{
        height: viewportHeight ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* ---------------------------------------------------------------------- */}
      {/* Desktop background image                                                */}
      {/* ---------------------------------------------------------------------- */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* Mobile video background                                                 */}
      {/* ---------------------------------------------------------------------- */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        autoPlay
        playsInline
        className={`block md:hidden absolute inset-0 object-cover ${
          isMobile ? "object-top" : "object-center"
        }`}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* Auth content                                                            */}
      {/* ---------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          relative z-10
          flex flex-col items-center
          px-4 pt-28 md:pt-24
          w-full
        "
        style={{
          height: viewportHeight ? `${viewportHeight}px` : "100vh",
        }}
      >
        <div
          ref={containerRef}
          className={`
            w-full max-w-md
            bg-black/30 backdrop-blur-md
            p-6 rounded-2xl shadow-lg

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
