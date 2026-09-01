"use client";

interface TabsProps {
  options: string[];
  active: string;
  onChange: (option: string) => void;
}

export default function Tabs({ options, active, onChange }: TabsProps) {
  return (
    <div className="mb-9 flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
            option === active
              ? "border-cream bg-cream text-ink light:border-ink light:bg-ink light:text-paper"
              : "border-white/15 hover:border-white/40 light:border-line light:hover:border-sun-mid"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
