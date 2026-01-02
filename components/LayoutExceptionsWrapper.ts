"use client"; // MUST be at the top

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default function LayoutExceptionsWrapper({ children }: Props) {
  const pathname = usePathname();
  const [skipLayout, setSkipLayout] = useState(false);

  useEffect(() => {
    const isLanding = pathname === "/";
    const isOrganizer = pathname.startsWith("/organizer");
    setSkipLayout(isLanding || isOrganizer);
  }, [pathname]);

  // ✅ Use <div> instead of fragments for Turbopack
  if (skipLayout) return <div>{children}</div>;

  return <div>{children}</div>;
}
