import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Forecast service contract — implementation P-009.5+. */
export type ForecastService = {
  getActiveForecast(context: ServiceContext): ServiceResult<{ id: string; name: string } | null>;
};

export class StubForecastService implements ForecastService {
  getActiveForecast(_context: ServiceContext): ServiceResult<{ id: string; name: string } | null> {
    return {
      success: false,
      error: {
        code: ServiceErrorCode.NotImplemented,
        message: "Forecast not implemented until P-009.5",
      },
    };
  }
}

export const stubForecastService = new StubForecastService();
