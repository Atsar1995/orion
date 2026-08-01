import Link from "next/link";
import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { DashboardMorningBriefData } from "@/lib/dashboard/types";

type MorningBriefWidgetProps = {
  data: DashboardMorningBriefData;
};

/** EP-002 morning brief widget — presentation only. */
export function MorningBriefWidget({ data }: MorningBriefWidgetProps) {
  return (
    <Widget variant="premium">
      <WidgetHeader
        title="Morning Executive Brief"
        description={`Lifecycle: ${data.lifecycle}`}
        action={
          <Link
            href="/brief"
            className="text-xs font-medium text-orion-gold hover:text-orion-gold/80"
          >
            Open full brief
          </Link>
        }
      />
      <WidgetBody className="space-y-4">
        <p className="text-base font-medium text-white/90">{data.headline}</p>
        <p className="text-sm font-light leading-relaxed text-white/70">{data.summary}</p>
        <ul className="space-y-2">
          {data.keyPoints.map((point) => (
            <li key={point} className="text-sm font-light text-white/65">
              {point}
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>
        Generated {new Date(data.generatedAt).toLocaleString("en-GB")}
      </WidgetFooter>
    </Widget>
  );
}
