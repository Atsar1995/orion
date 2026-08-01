export type ReservationListViewItem = {
  readonly id: string;
  readonly reservationNumber: string;
  readonly guestName: string;
  readonly propertyName: string;
  readonly propertyId: string;
  readonly inventoryLabel?: string;
  readonly accommodationType: string;
  readonly source: string;
  readonly status: string;
  readonly arrival: string;
  readonly departure: string;
  readonly lengthOfStay: number;
  readonly rate: string;
  readonly paymentStatus: string;
  readonly isVip: boolean;
};

export type ReservationDetailView = {
  readonly record: import("@/types/hospitality-reservation").ReservationRecord;
  readonly guestName: string;
  readonly propertyName: string;
  readonly accommodationTypeName: string;
  readonly inventoryLabel?: string;
  readonly conflicts: import("@/types/hospitality-reservation").ConflictResult;
};

export type ReservationSearchView = {
  readonly total: number;
  readonly items: readonly ReservationListViewItem[];
  readonly filters: readonly { key: string; label: string }[];
};
