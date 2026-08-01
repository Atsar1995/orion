/** Standard HCM REST API response contracts (S-002.7). */

export type HcmPaginationMeta = {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
};

export type HcmPaginatedData<T> = {
  readonly items: readonly T[];
  readonly pagination: HcmPaginationMeta;
};

export type HcmApiSuccessResponse<T> = {
  readonly success: true;
  readonly data: T;
};

export type HcmApiErrorResponse = {
  readonly success: false;
  readonly error: string;
};

export type HcmPaginationParams = {
  readonly page?: number;
  readonly pageSize?: number;
};
