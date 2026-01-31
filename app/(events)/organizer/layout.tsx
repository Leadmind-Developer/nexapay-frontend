import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/organizer/events" },
  { label: "Create Event", href: "/organizer/events/create" },
  { label: "My Tickets", href: "/organizer/events/tickets" },
  { label: "Analytics", href: "/organizer/events/analytics" },
];

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r hidden md:flex flex-col">
            <div className="px-6 py-5 border-b">
              <h1 className="text-xl font-bold">Nexa Events</h1>
              <p className="text-sm text-gray-500">Organizer Dashboard</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-6 py-4 border-t text-sm text-gray-500">
              © {new Date().getFullYear()} Nexa Events
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col">
            <header className="md:hidden bg-white border-b px-4 py-3">
              <h2 className="font-semibold">Nexa Events Organizer</h2>
            </header>

            <main className="flex-1 p-4 md:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
