// Requests use same-origin paths; next.config.ts selects your backend server.
// API Endpoints
export const API_ENDPOINTS = {
  REGISTER: "/register",
  LOGIN: "/login",
  ACCOUNTS: "/accounts",
  ACCOUNT: (accountId: string) => `/accounts/${encodeURIComponent(accountId)}`,
  DEPOSIT: (accountId: string) => `/accounts/${accountId}/deposit`,
  WITHDRAW: (accountId: string) => `/accounts/${accountId}/withdraw`,
  TRANSFERS: "/transfers",
  ENTRIES: (accountId: string) => `/accounts/${accountId}/entries`,
  RECONCILE: (accountId: string) => `/accounts/${accountId}/reconcile`,
  TRANSACTIONS: (txId: string) => `/transactions/${txId}`,
  HEALTH: "/health",
} as const;

// Toast notification duration (milliseconds)
export const TOAST_DURATION = 4000;

// Currency settings
export const CURRENCY = {
  CODE: "USD",
  SYMBOL: "$",
  LOCALE: "en-US",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  EMAIL: "email",
} as const;
