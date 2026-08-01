import { Card } from "@/components/ui/Card";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_BODY_MUTED_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_CAPTION_CLASS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Intelligence Integration Layer administration dashboard (Mission P-006). */
export default async function IntelligenceIntegrationPage() {
  const { context } = await getDecisionServiceContext();
  const service = getIntelligenceIntegrationService();
  const health = service.getHealth(context);
  const services = service.serviceRegistry.list();
  const subscriptions = service.subscriptionManager.list();
  const events = service.listEvents(context, 10);
  const deadLetter = service.listDeadLetter(context);

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Intelligence Integration</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Event bus, subscriptions, routing, and health for ORION&apos;s central nervous system.
        </p>
      </header>

      <section className={WORKSPACE_SECTION_CLASS} aria-label="Integration health">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Status">
            <p className="text-2xl font-semibold capitalize text-orion-text">{health.status}</p>
            <p className={`mt-2 ${WORKSPACE_BODY_MUTED_CLASS}`}>{health.summary}</p>
          </Card>
          <Card title="Published Events">
            <p className="text-3xl font-semibold text-orion-text">{health.publishedTotal}</p>
          </Card>
          <Card title="Active Subscriptions">
            <p className="text-3xl font-semibold text-orion-text">{health.activeSubscriptions}</p>
          </Card>
          <Card title="Dead Letter Queue">
            <p className="text-3xl font-semibold text-orion-text">{health.deadLetterCount}</p>
          </Card>
        </div>

        <div className={WORKSPACE_GRID_2_COL}>
          <Card title="Registered Services">
            {services.length === 0 ? (
              <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
                No registered services.
              </p>
            ) : (
              <ul className="space-y-2">
                {services.map((entry) => (
                  <li key={entry.serviceId} className="flex justify-between gap-4 text-sm">
                    <span className="text-orion-text">{entry.label}</span>
                    <span className={WORKSPACE_BODY_MUTED_CLASS}>{entry.workspace}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Active Subscriptions">
            {subscriptions.length === 0 ? (
              <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
                No active subscriptions.
              </p>
            ) : (
              <ul className="space-y-2">
                {subscriptions.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <span className="font-medium text-orion-text">{entry.subscriberId}</span>
                    <p className={WORKSPACE_BODY_MUTED_CLASS}>
                      {entry.eventTypes.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Recent Events">
          {events.length === 0 ? (
            <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
              No events available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-orion-border/60">
                    <th className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>Type</th>
                    <th className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>Source</th>
                    <th className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>Entity</th>
                    <th className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.eventId} className="border-b border-orion-border/30">
                      <td className="px-3 py-2 text-orion-text">{event.eventType}</td>
                      <td className="px-3 py-2 text-orion-muted">{event.sourceService}</td>
                      <td className="px-3 py-2 text-orion-muted">
                        {event.entityType}:{event.entityId}
                      </td>
                      <td className="px-3 py-2 text-orion-muted">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {deadLetter.length > 0 ? (
          <Card title="Dead Letter Queue">
            <ul className="space-y-2">
              {deadLetter.map((record) => (
                <li key={record.id} className="text-sm text-orion-gold/90">
                  {record.event.eventType} — {record.failureReason}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
