"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LayoutExceptionsWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [skipLayout, setSkipLayout] = useState(false);

  useEffect(() => {
    const isLanding = pathname === "/";
    const isOrganizer = pathname.startsWith("/organizer");
    setSkipLayout(isLanding || isOrganizer);
  }, [pathname]);

  if (skipLayout) return <>{children}</>;

  return <>{children}</>;
}
