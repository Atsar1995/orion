"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SearchBox } from "@/components/ui/SearchBox";
import { WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import type { ReservationListViewItem } from "@/lib/hospitality/models/reservations";

type ReservationDirectoryProps = {
  items: readonly ReservationListViewItem[];
};

/** Searchable reservation directory (Mission P-007.2). */
export function ReservationDirectory({ items }: ReservationDirectoryProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (status !== "all" && !item.status.toLowerCase().includes(status)) return false;
      if (!query) return true;
      const haystack = `${item.reservationNumber} ${item.guestName} ${item.propertyName} ${item.accommodationType}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [items, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <SearchBox
          value={query}
          onChange={(value) => startTransition(() => setQuery(value))}
          placeholder="Search by number, guest, property..."
          className="max-w-md"
          id="reservation-search"
        />
        <label className="text-xs text-white/45">
          Status
          <select
            value={status}
            onChange={(event) => startTransition(() => setStatus(event.target.value))}
            className="ml-2 rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80"
          >
            <option value="all">All</option>
            {["confirmed", "checked in", "provisional", "quote", "cancelled"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Card title="Reservations">
        <p className={`mb-4 ${WORKSPACE_CAPTION_CLASS}`}>{filtered.length} reservation(s)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Reservation directory</caption>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Number", "Guest", "Property", "Type", "Arrival", "Departure", "Status", "Source", "Rate"].map(
                  (header) => (
                    <th key={header} scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-3 py-3">
                    <Link href={`/hospitality/reservations/${item.id}`} className="text-orion-gold hover:underline">
                      {item.reservationNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-white/70">
                    {item.guestName}
                    {item.isVip ? " · VIP" : ""}
                  </td>
                  <td className="px-3 py-3 text-white/70">{item.propertyName}</td>
                  <td className="px-3 py-3 text-white/70">{item.accommodationType}</td>
                  <td className="px-3 py-3 text-white/70">{item.arrival}</td>
                  <td className="px-3 py-3 text-white/70">{item.departure}</td>
                  <td className="px-3 py-3 text-white/70">{item.status}</td>
                  <td className="px-3 py-3 text-white/70">{item.source}</td>
                  <td className="px-3 py-3 text-white/70">{item.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
