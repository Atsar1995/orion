import { AlertCenter } from "@/components/alerts";
import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { AlertCenterSnapshot } from "@/lib/alerts/models/Alert";

type AlertCenterWidgetProps = {
  snapshot: AlertCenterSnapshot;
};

/** EP-003 executive alert center dashboard widget. */
export function AlertCenterWidget({ snapshot }: AlertCenterWidgetProps) {
  return (
    <Widget>
      <WidgetHeader
        title="Executive Alert Center"
        description={`${snapshot.counts.active} active · ${snapshot.counts.critical} critical`}
      />
      <WidgetBody>
        <AlertCenter snapshot={snapshot} />
      </WidgetBody>
      <WidgetFooter>
        Snapshot generated {new Date(snapshot.generatedAt).toLocaleString("en-GB")}
      </WidgetFooter>
    </Widget>
  );
}
