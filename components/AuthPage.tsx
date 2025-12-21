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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) =>
          console.warn("Video autoplay prevented:", err)
        );
      }
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Desktop background image */}
      <div
        className="hidden md:block absolute w-full h-full bg-center bg-cover"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Mobile video background */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        autoPlay
        playsInline
        className={`block md:hidden absolute w-full h-full object-cover ${
          isMobile ? "object-top" : "object-center"
        }`}
      />

      {/* Form container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        className="relative z-10 flex flex-col items-center justify-start h-full pt-40 px-4 md:pt-24"
      >
        <div className="w-full max-w-md bg-black/30 backdrop-blur-md p-8 rounded-2xl shadow-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
