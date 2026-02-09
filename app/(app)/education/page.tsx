"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const PRODUCTS = [
  {
    name: "WAEC Result Checker PIN",
    href: "/education/waecresultpin",
    logo: "/images/icons/waecres.png",
    serviceID: "waec",
    description: "Purchase WAEC result checker PINs instantly.",
  },
  {
    name: "WAEC Registration PIN",
    href: "/education/waecregpin",
    logo: "/images/icons/waecreg.png",
    serviceID: "waec-registration",
    description: "Register candidates for WAEC online.",
  },
  {
    name: "JAMB PIN (UTME / Direct Entry)",
    href: "/education/jambpin",
    logo: "/images/icons/jamb.png",
    serviceID: "jamb",
    description: "Buy JAMB PINs with profile verification.",
  },
];

export default function EducationPage() {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    PRODUCTS.forEach(async (p) => {
      try {
        const res = await api.get(`/vtpass/education/${p.serviceID}/variations`);
        const variations = res.data || [];
        // Use first variation price as the default display
        if (variations.length > 0) {
          setPrices(prev => ({
            ...prev,
            [p.serviceID]: variations[0].amount,
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch variations for ${p.name}`, err);
      }
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Education Services
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {PRODUCTS.map((p) => (
          <Link
            key={p.name}
            href={p.href}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={p.logo}
              alt={p.name}
              className="w-20 h-20 mb-4"
            />
            <h2 className="text-lg font-semibold text-center">{p.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {p.description}
            </p>
            {prices[p.serviceID] && (
              <p className="text-base font-bold mt-2 text-blue-600 dark:text-blue-400">
                ₦{Number(prices[p.serviceID]).toLocaleString()}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
