"use client";

interface TabsProps {
  options: string[];
  active: string;
  onChange: (option: string) => void;
  disabledOptions?: string[];
}

export default function Tabs({ options, active, onChange, disabledOptions = [] }: TabsProps) {
  return (
    <div className="mb-9 flex gap-2">
      {options.map((option) => {
        const isDisabled = disabledOptions.includes(option);
        return (
          <button
            key={option}
            onClick={() => !isDisabled && onChange(option)}
            disabled={isDisabled}
            title={isDisabled ? "Em breve" : undefined}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
              isDisabled
                ? "cursor-not-allowed border-white/10 opacity-40 light:border-line"
                : option === active
                  ? "border-cream bg-cream text-ink light:border-ink light:bg-ink light:text-paper"
                  : "border-white/15 hover:border-white/40 light:border-line light:hover:border-sun-mid"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
