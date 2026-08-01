import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type CrmExecutiveNotesProps = {
  notes: string;
};

/** Executive notes and decision context for customer intelligence. */
export function CrmExecutiveNotes({ notes }: CrmExecutiveNotesProps) {
  return (
    <Card title="Executive Notes">
      <p className={WORKSPACE_SUMMARY_CLASS}>{notes}</p>
    </Card>
  );
}
