"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function NewUpdate({
  onHeightChange,
}: {
  onHeightChange?: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  const messages = [
    <>
      Need a free bills payment website like <span className="font-semibold">NexaApp</span>?{" "}
      <Link
        href="/contact"
        className="underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        Click here
      </Link>
    </>,
    <>
      Ready to crowdfund your project or cause? <span className="font-semibold">launch</span> your campaign now!{" "}
      <Link
        href="/contact"
        className="underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        Click here
      </Link>
    </>,
    <>
      Need a quick loan?{" "}
      <Link
        href="/contact"
        className="underline font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        Click here
      </Link>
    </>,
    <>
      Do you want to build a saving culture? Earn <span className="font-semibold">10% interest</span> on your savings.
    </>,
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("newUpdateDismissed");
    if (dismissed === "true") setVisible(false);
  }, []);

  // Cycle messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track height changes
  useEffect(() => {
    if (!ref.current || !onHeightChange) return;

    const updateHeight = () => onHeightChange(ref.current?.offsetHeight || 0);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onHeightChange]);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("newUpdateDismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-[60] flex items-center justify-between px-4 py-2
                     bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900
                     text-blue-900 dark:text-blue-100 border-b border-blue-200 dark:border-blue-700"
          role="status"
          aria-live="polite"
        >
          {/* Logo */}
          <motion.img
            src="/logo.png"
            alt="NexaApp Logo"
            className="w-6 h-6 rounded-full flex-shrink-0"
            initial={{ y: -5 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Rotating message */}
          <div className="flex-1 flex items-center mx-2 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-sm leading-tight whitespace-nowrap"
              >
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  New
                </span>

                {/* Scrollable text on small screens */}
                <div className="overflow-x-auto max-w-full scrollbar-none">
                  {messages[currentMessage]}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="ml-2 p-1 text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            aria-label="Dismiss update banner"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
