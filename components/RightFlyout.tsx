"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface RightFlyoutProps {
  visible: boolean;
  onClose: () => void;
  items: { title: string; href: string }[];
}

export default function RightFlyout({ visible, onClose, items }: RightFlyoutProps) {
  const pathname = usePathname();

  if (!visible) return null;

  return (
    <aside
      className="absolute left-full top-0 ml-2 w-56 max-h-[calc(100vh-96px)] bg-indigo-900 border-l border-indigo-800 flex flex-col py-4 px-2 z-50 shadow-lg rounded-md"
      onMouseLeave={onClose} // optional: hide on mouse leave
    >
      {/* Top Group */}
      <div className="flex flex-col space-y-2 border-b border-indigo-800 pb-2">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md text-gray-200 hover:bg-indigo-800 transition ${
              pathname === item.href ? "bg-indigo-700 text-white font-semibold" : ""
            }`}
            onClick={onClose}
          >
            {item.title}
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="my-2 border-b border-indigo-800" />

      {/* Bottom Group */}
      <div className="flex flex-col space-y-2 pt-2">
        {items.slice(3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-md text-gray-200 hover:bg-indigo-800 transition ${
              pathname === item.href ? "bg-indigo-700 text-white font-semibold" : ""
            }`}
            onClick={onClose}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </aside>
  );
}
