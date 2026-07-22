import { SparkIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";
import { EXECUTIVE_BRIEFING_ITEMS } from "@/lib/intelligence-data";
import {
  WORKSPACE_LIST_CLASS,
  WORKSPACE_LIST_ITEM_CLASS,
  WORKSPACE_PREMIUM_ICON_CLASS,
} from "@/lib/constants";

/** Hero executive briefing card for the Intelligence Workspace. */
export function ExecutiveBriefingCard() {
  return (
    <Card title="Executive Briefing" variant="premium">
      <div className="space-y-4">
        <div className={WORKSPACE_PREMIUM_ICON_CLASS}>
          <SparkIcon className="h-5 w-5 text-orion-gold" />
        </div>
        <ul className={WORKSPACE_LIST_CLASS}>
          {EXECUTIVE_BRIEFING_ITEMS.map((item) => (
            <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
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
