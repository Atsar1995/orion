import { Card } from "@/components/ui/Card";

type InsightListCardProps = {
  title: string;
  items: readonly string[];
  marker?: "bullet" | "check" | "alert";
};

function ListMarker({ marker }: { marker: NonNullable<InsightListCardProps["marker"]> }) {
  if (marker === "check") {
    return (
      <span aria-hidden className="text-orion-gold">
        ✓
      </span>
    );
  }

  if (marker === "alert") {
    return (
      <span aria-hidden className="text-amber-400/80">
        !
      </span>
    );
  }

  return (
    <span aria-hidden className="text-orion-gold/70">
      •
    </span>
  );
}

/** Placeholder insight, recommendation, or alert list card. */
export function InsightListCard({
  title,
  items,
  marker = "bullet",
}: InsightListCardProps) {
  return (
    <Card title={title}>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm font-light leading-relaxed text-white/60"
          >
            <ListMarker marker={marker} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
