const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://trust-ledger.onrender.com/api";

// Token management
export const getToken = () => localStorage.getItem("trustledger_access_token");
export const setToken = (token: string) => localStorage.setItem("trustledger_access_token", token);
export const clearToken = () => localStorage.removeItem("trustledger_access_token");

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  // If token expired, try to refresh it
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("trustledger_refresh_token");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setToken(data.access);
          token = data.access;

          // Retry original request with new token
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...options?.headers,
            },
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ detail: "Request failed" }));
            throw new Error(error.detail || error.error || `HTTP ${retryResponse.status}`);
          }

          return retryResponse.json();
        }
      } catch {
        // Refresh failed — clear everything and redirect to login
        localStorage.removeItem("trustledger_access_token");
        localStorage.removeItem("trustledger_refresh_token");
        localStorage.removeItem("trustledger_user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // No refresh token — redirect to login
      localStorage.removeItem("trustledger_access_token");
      localStorage.removeItem("trustledger_user");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {

  getTraders: () => apiCall<TraderProfile[]>("/traders/"),
  getLenders: () => apiCall<Lender[]>("/lenders/"),
  getLoanOutcomes: () => apiCall<LoanOutcome[]>("/loan-outcomes/"),
  // Auth
  login: async (username: string, password: string) => {
    const data = await apiCall<{ access: string; refresh: string }>("/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access);
    localStorage.setItem("trustledger_refresh_token", data.refresh);
    return data;
  },

  signup: (payload: {
    username: string;
    email: string;
    password: string;
    role: "trader" | "lender";
    phone_number?: string;
    market_name?: string;
    state?: string;
    institution_name?: string;
  }) =>
    apiCall<{ message: string }>("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Trader
  getMyProfile: () => apiCall<TraderProfile>("/traders/me/"),
  getMyScore: () => apiCall<ScoreBreakdown>("/traders/me/"),
  searchTraders: (q: string) => apiCall<TraderProfile[]>(`/traders/search/?q=${q}`),
  getTraderScore: (id: number) => apiCall<ScoreBreakdown>(`/traders/${id}/score/`),

  // Transactions
  getTransactions: () => apiCall<Transaction[]>("/transactions/"),
  createTransaction: (data: {
    transaction_type: "sale" | "expense" | "debt";
    amount: number;
    date: string;
    note?: string;
  }) =>
    apiCall<Transaction>("/transactions/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Vouches
  getMyNetwork: () => apiCall<VouchNetwork>("/vouches/my_network/"),
  createVouch: (vouchee: number) =>
    apiCall<Vouch>("/vouches/", {
      method: "POST",
      body: JSON.stringify({ vouchee }),
    }),

  // Loan outcomes
  reportLoanOutcome: (data: {
    trader: number;
    amount: number;
    outcome: "repaid" | "defaulted" | "late";
  }) =>
    apiCall<LoanOutcome>("/loan-outcomes/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin
  getPendingLenders: () => apiCall<Lender[]>("/admin/lenders/"),
  verifyLender: (id: number) =>
    apiCall<{ message: string }>(`/admin/lenders/${id}/verify/`, {
      method: "POST",
    }),
  getFraudFlags: () => apiCall<FraudFlag[]>("/fraud-flags/"),
  getAdminTraders: () => apiCall<TraderProfile[]>("/admin/traders/"),
};

// Types
export interface TraderProfile {
  id: number;
  user: number;
  phone_number: string;
  market_name: string;
  state: string;
  trust_score: number;
  created_at: string;
  score_breakdown?: ScoreBreakdown;
}

export interface ScoreBreakdown {
  transaction_consistency: number;
  income_trend: number;
  vouch_network: {
    score_contribution: number;
    voucher_count: number;
    avg_voucher_score: number;
  };
  loan_history: {
    repaid: number;
    late: number;
    defaulted: number;
    score_contribution: number;
  };
  fraud_flags: {
    unresolved_count: number;
    penalty: number;
  };
  final_score: number;
}

export interface Transaction {
  id: number;
  trader: number;
  transaction_type: "sale" | "expense" | "debt";
  amount: string;
  note: string;
  date: string;
  created_at: string;
}

export interface Vouch {
  id: number;
  voucher: number;
  vouchee: number;
  created_at: string;
}

export interface VouchNetwork {
  vouches_received: Vouch[];
  vouches_given: Vouch[];
}

export interface Lender {
  id: number;
  user: number;
  institution_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoanOutcome {
  id: number;
  trader: number;
  lender: number;
  amount: string;
  outcome: "repaid" | "defaulted" | "late";
  reported_at: string;
}

export interface FraudFlag {
  id: number;
  trader: number;
  reason: string;
  flagged_at: string;
  resolved: boolean;
}