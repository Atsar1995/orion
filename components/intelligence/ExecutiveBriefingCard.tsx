import { SparkIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";
import { EXECUTIVE_BRIEFING_ITEMS } from "@/lib/intelligence-data";

/** Hero executive briefing card for the Intelligence Workspace. */
export function ExecutiveBriefingCard() {
  return (
    <Card title="Executive Briefing" variant="premium">
      <div className="space-y-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-orion-md border border-orion-gold/25 bg-orion-gold/10">
          <SparkIcon className="h-5 w-5 text-orion-gold" />
        </div>
        <ul className="space-y-2.5">
          {EXECUTIVE_BRIEFING_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm font-light leading-relaxed text-white/65"
            >
              <span aria-hidden className="text-orion-gold/70">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
