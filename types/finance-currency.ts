/**
 * Finance Domain — currency reference types (Mission P-009.1).
 */

/** ISO 4217 currency code (e.g. ZAR, USD, EUR). */
export type CurrencyCode = string;

/** Currency context attached to financial events and validation inputs. */
export type FinanceCurrencyContext = {
  readonly transactionCurrency: CurrencyCode;
  readonly functionalCurrency?: CurrencyCode;
  readonly reportingCurrency?: CurrencyCode;
  readonly exchangeRate?: number;
  readonly exchangeRateDate?: string;
};
