export type FrontOfficeQueueItem = {
  readonly stayId: string;
  readonly reservationId: string;
  readonly reservationNumber: string;
  readonly guestId: string;
  readonly guestName: string;
  readonly propertyId: string;
  readonly propertyName: string;
  readonly inventoryLabel?: string;
  readonly accommodationType: string;
  readonly status: string;
  readonly arrival: string;
  readonly departure: string;
  readonly expectedArrivalTime?: string;
  readonly isVip: boolean;
  readonly isGroup: boolean;
  readonly groupName?: string;
  readonly earlyCheckInRequested: boolean;
  readonly roomAssigned: boolean;
  readonly roomReady: boolean;
};

export type FrontOfficeDashboardView = {
  readonly occupancy: {
    readonly percent: number;
    readonly inHouse: number;
    readonly totalRooms: number;
    readonly vacantClean: number;
    readonly vacantDirty: number;
    readonly outOfOrder: number;
    readonly outOfService: number;
  };
  readonly today: {
    readonly arrivals: number;
    readonly departures: number;
    readonly stayovers: number;
    readonly walkIns: number;
    readonly noShows: number;
    readonly vipArrivals: number;
    readonly groupArrivals: number;
  };
  readonly queues: {
    readonly arrivals: readonly FrontOfficeQueueItem[];
    readonly inHouse: readonly FrontOfficeQueueItem[];
    readonly departures: readonly FrontOfficeQueueItem[];
    readonly unassigned: readonly FrontOfficeQueueItem[];
  };
};

export type OccupancyBoardItem = {
  readonly inventoryItemId: string;
  readonly label: string;
  readonly propertyId: string;
  readonly bucket: string;
  readonly guestName?: string;
  readonly stayId?: string;
  readonly departure?: string;
};

export type FrontOfficeBriefContribution = {
  readonly currentOccupancy: number;
  readonly vipInHouse: number;
  readonly operationalDelays: readonly string[];
  readonly earlyArrivals: number;
  readonly lateDepartures: number;
  readonly unassignedArrivals: number;
  readonly roomsNotReady: number;
};
