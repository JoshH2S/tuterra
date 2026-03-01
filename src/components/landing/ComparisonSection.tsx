"use client";

import { motion } from "framer-motion";

const platforms = [
  {
    name: "Tuterra",
    logo: "/lovable-uploads/5abc5bdf-f0f2-4773-844c-b174f2e2b884.png",
    logoAlt: "Tuterra Logo",
    isTuterra: true,
  },
  {
    name: "Coursera",
    logo: "/lovable-uploads/cfcdbcb8-21ea-4d0f-beae-4368ad873520.png",
    logoAlt: "Coursera Logo",
    isTuterra: false,
  },
  {
    name: "Skillshare",
    logo: "/lovable-uploads/c74dcaa0-03f0-4ace-83cb-ad0b944f15dd.png",
    logoAlt: "Skillshare Logo",
    isTuterra: false,
  },
  {
    name: "Magic School",
    logo: "/lovable-uploads/9c384236-998d-4be7-8fce-38625409b005.png",
    logoAlt: "Magic School Logo",
    isTuterra: false,
  },
];

const features = [
  { name: "Live News Integration",    values: [true,  false,             false,                false] },
  { name: "Mobile UI",               values: [true,  true,              true,                 true] },
  { name: "AI-Powered Feedback",     values: [true,  "Basic",           false,                "Prompt-based"] },
  { name: "Job Interview Prep",      values: [true,  "Rare",            false,                false] },
  { name: "Career-Prep Tools",       values: ["Strong", "Medium",       "Weak",               "Low"] },
  { name: "Engagement",              values: ["High",  "Medium–High",   "High (Creative)",    "Low"] },
];

function CellValue({ value, isTuterra }: { value: boolean | string; isTuterra: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className={`text-base font-semibold ${isTuterra ? "text-[#C8A84B]" : "text-stone-400"}`}>✓</span>
    ) : (
      <span className="text-stone-300 text-base select-none">—</span>
    );
  }
  return (
    <span className={`text-sm ${isTuterra ? "text-[#091747] font-medium" : "text-stone-500"}`}>
      {value}
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#C8A84B] mb-4">
            Why Tuterra
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#091747]">
            Built Differently
          </h2>
          <p className="mt-3 text-stone-500 max-w-xl mx-auto text-base leading-relaxed">
            See how Tuterra compares to other learning platforms on the features that matter most.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full overflow-x-auto"
        >
          <div className="min-w-[640px]">

            {/* Platform header row */}
            <div className="grid comparison-grid gap-px mb-2">
              <div /> {/* feature name column spacer */}
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className={`py-5 px-4 flex items-center justify-center rounded-t-xl ${
                    p.isTuterra ? "bg-[#F7F3EC] border border-[#C8A84B]/30 border-b-0" : "bg-stone-50"
                  }`}
                >
                  <img src={p.logo} alt={p.logoAlt} className="h-8 object-contain" />
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {features.map((feature, fi) => (
              <div key={feature.name} className="grid comparison-grid gap-px">
                {/* Feature name */}
                <div className={`py-4 flex items-center ${fi < features.length - 1 ? "border-b border-stone-100" : ""}`}>
                  <span className="text-sm font-medium text-[#091747]">{feature.name}</span>
                </div>

                {/* Values */}
                {feature.values.map((val, vi) => {
                  const isTuterra = vi === 0;
                  return (
                    <div
                      key={vi}
                      className={`py-4 px-4 flex items-center justify-center text-center
                        ${isTuterra ? "bg-[#F7F3EC] border-x border-[#C8A84B]/30" : "bg-stone-50/50"}
                        ${fi < features.length - 1 ? "border-b border-stone-100" : ""}
                        ${fi === features.length - 1 && isTuterra ? "rounded-b-xl border-b border-[#C8A84B]/30" : ""}
                      `}
                    >
                      <CellValue value={val} isTuterra={isTuterra} />
                    </div>
                  );
                })}
              </div>
            ))}

          </div>
        </motion.div>

      </div>
    </section>
  );
}
