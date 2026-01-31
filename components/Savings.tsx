import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type ServiceType = "AIRTIME" | "DATA" | "CABLE" | "ELECTRICITY" | "EDUCATION";

const SERVICE_CATEGORIES: { type: ServiceType; label: string; path: string; options: string[] }[] = [
  { type: "AIRTIME", label: "Buy Phone Airtime", path: "/airtime", options: ["MTN", "GLO", "Airtel", "9Mobile"] },
  { type: "DATA", label: "Buy Internet Data", path: "/data", options: ["MTN", "GLO", "Airtel", "9Mobile", "SMILE"] },
  { type: "CABLE", label: "Pay TV Subscription", path: "/cable", options: ["DSTV", "GOTV", "STARTIMES"] },
  { type: "ELECTRICITY", label: "Pay Electricity Bill", path: "/electricity", options: ["IKEDC", "EKEDC", "PHED", "AEDC", "KEDCO", "IBEDC", "JED", "KAEDCO"] },
  { type: "EDUCATION", label: "Buy Education PIN", path: "/education", options: ["WAEC", "JAMB", "NECO", "NABTEB"] },
];

export default function Services() {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-50 text-center" aria-labelledby="services-heading">
      <h2 id="services-heading" className="text-3xl font-bold mb-6">Pay Bills & Buy Airtime/Data/Education</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10 px-4">
        {SERVICE_CATEGORIES.map((s, idx) => (
          <motion.div
            key={s.type}
            onClick={() => router.push(s.path)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="cursor-pointer p-4 w-full rounded-lg shadow-md bg-white text-gray-800 hover:scale-105 hover:bg-indigo-50 transition transform"
            role="button"
            aria-label={`Go to ${s.label}`}
          >
            <h3 className="text-base font-semibold mb-1">{s.label}</h3>
            <ul className="text-xs space-y-0.5">
              {s.options.map((opt) => (
                <li key={opt} className="py-1 px-2 rounded hover:bg-indigo-100 hover:text-indigo-700">{opt}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
