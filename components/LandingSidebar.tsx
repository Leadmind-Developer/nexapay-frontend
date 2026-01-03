"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Wifi,
  Tv,
  Zap,
  MoreVertical,
  Users,
  Mail,
  Star,
  Ticket,
  Car,
  School,
} from "lucide-react";

const mainItems = [
  { title: "Airtime", href: "/airtime", icon: Smartphone },
  { title: "Data", href: "/data", icon: Wifi },
  { title: "TV", href: "/cable", icon: Tv },
  { title: "Electricity", href: "/electricity", icon: Zap },
];

const moreItems = [
  { title: "Education", href: "/education", icon: School },
  { title: "Events Tickets", href: "/events", icon: Ticket },
  { title: "Insurance", href: "/insurance", icon: Car },
  { title: "Partner", href: "/partner", icon: Users },
  { title: "Contact", href: "/contact", icon: Mail },
  { title: "What's New", href: "/whats-new", icon: Star },
];

export default function LandingSidebar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [flyoutTop, setFlyoutTop] = useState<number>(0);

  // Dynamically calculate flyout position so it stays above ellipsis if near bottom
  useEffect(() => {
    if (showMore && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flyoutHeight = moreItems.length * 40 + 16; // estimated height + padding

      if (spaceBelow < flyoutHeight) {
        // not enough space below → position above
        setFlyoutTop(rect.top - flyoutHeight + window.scrollY);
      } else {
        // enough space below → align top with button
        setFlyoutTop(rect.top + window.scrollY);
      }
    }
  }, [showMore]);

  const linkClasses = (href: string) =>
    `flex flex-col items-center gap-1 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
      pathname === href
        ? "bg-indigo-700 text-white"
        : "text-gray-300 hover:bg-indigo-800"
    }`;

  return (
    <aside
      className="w-32 min-h-screen bg-indigo-900 border-r border-indigo-800 flex flex-col justify-start py-6 fixed left-0 z-50"
      style={{ top: "var(--header-height)" }}
    >
      <div className="flex flex-col items-center space-y-4 relative">
        {/* Main Items */}
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-800/60 group-hover:bg-indigo-700 transition-colors duration-300">
                <Icon size={20} className="text-indigo-100" />
              </div>
              <span className="text-[11px]">{item.title}</span>
            </Link>
          );
        })}

        {/* More Dropdown */}
        <div className="relative mt-2">
          <button
            ref={buttonRef}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-800/60 hover:bg-indigo-700 text-gray-200 transition-colors"
            onClick={() => setShowMore((prev) => !prev)}
          >
            <MoreVertical size={18} />
          </button>

          {/* Flyout menu - appears to the right but adjusts vertically */}
          {showMore && (
            <div
              className="fixed z-[9999] bg-indigo-900 border border-indigo-800 rounded-lg shadow-2xl flex flex-col divide-y divide-indigo-800 backdrop-blur-md w-48"
              style={{
                top: `${flyoutTop}px`,
                left: "8rem", // positioned to the right of sidebar
              }}
              onMouseLeave={() => setShowMore(false)}
            >
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-indigo-800 text-white font-semibold"
                        : "text-gray-200 hover:bg-indigo-800"
                    }`}
                    onClick={() => setShowMore(false)}
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
