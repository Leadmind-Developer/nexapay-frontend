"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const name = localStorage.getItem("userName");
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
    }
  }, []);

  const dashboardLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Savings", href: "/dashboard/savings" },
    { name: "Loans", href: "/dashboard/loans" },
    { name: "Funds", href: "/dashboard/funds" },
  ];

  const transactionLinks = [
    { name: "Cash Out", href: "/transactions/cashout" },
    { name: "Collections", href: "/transactions/collection" },
    { name: "Disbursement", href: "/transactions/disbursement" },
    { name: "Enterprise", href: "/transactions/enterprise" },
    { name: "Remittance", href: "/transactions/remittance" },
    { name: "VAS", href: "/transactions/vas" },
  ];

  const developerLinks = [
    { name: "Webhooks", href: "/webhooks" },
    { name: "Developer API", href: "/developer/api" },
  ];

  const linkClasses = (href: string) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      pathname === href
        ? "bg-blue-500 text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-md transform transition-transform duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">NexaApp</h1>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-500 dark:text-gray-300 hover:text-blue-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)] space-y-6">
          {isLoggedIn && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-medium text-gray-900 dark:text-gray-100">{userName}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dashboard</p>
            {dashboardLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClasses(item.href)} onClick={() => setOpen(false)}>
                {item.name}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Transactions</p>
            {transactionLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClasses(item.href)} onClick={() => setOpen(false)}>
                {item.name}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Developer</p>
            {developerLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClasses(item.href)} onClick={() => setOpen(false)}>
                {item.name}
              </Link>
            ))}
          </div>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="mt-6 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
