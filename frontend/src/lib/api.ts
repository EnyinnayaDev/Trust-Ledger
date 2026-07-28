import type { User, TraderProfile, LenderProfile, Transaction, Vouch, FraudFlag } from "./types";
import { mockUsers, mockTraders, mockLenders, mockTransactions, mockVouches, mockFraudFlags } from "./mock-data";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://trust-ledger.onrender.com/api";

let useMockMode = localStorage.getItem("trustledger_mock_mode") !== "false";

export const setMockMode = (enabled: boolean) => {
  useMockMode = enabled;
  localStorage.setItem("trustledger_mock_mode", String(enabled));
};

export const isMockMode = () => useMockMode;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (useMockMode) {
    await delay(300 + Math.random() * 400);
    return handleMockEndpoint<T>(endpoint);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn("API call failed, falling back to mock mode:", error);
    setMockMode(true);
    await delay(300);
    return handleMockEndpoint<T>(endpoint);
  }
}

function handleMockEndpoint<T>(endpoint: string): T {
  if (endpoint === "/auth/login") {
    return mockUsers[0] as T;
  }
  if (endpoint === "/traders") {
    return mockTraders as T;
  }
  if (endpoint === "/lenders") {
    return mockLenders as T;
  }
  if (endpoint === "/transactions") {
    return mockTransactions as T;
  }
  if (endpoint === "/vouches") {
    return mockVouches as T;
  }
  if (endpoint === "/fraud-flags") {
    return mockFraudFlags as T;
  }
  if (endpoint.startsWith("/traders/")) {
    const id = endpoint.split("/")[2];
    return mockTraders.find(t => t.id === id) as T;
  }
  if (endpoint.startsWith("/lenders/")) {
    const id = endpoint.split("/")[2];
    return mockLenders.find(l => l.id === id) as T;
  }
  throw new Error(`Mock endpoint not found: ${endpoint}`);
}

export const api = {
  login: (username: string, _password: string) =>
    apiCall<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password: _password }),
    }),

  getTraders: () => apiCall<TraderProfile[]>("/traders"),
  getTrader: (id: string) => apiCall<TraderProfile>(`/traders/${id}`),

  getLenders: () => apiCall<LenderProfile[]>("/lenders"),
  getLender: (id: string) => apiCall<LenderProfile>(`/lenders/${id}`),

  getTransactions: () => apiCall<Transaction[]>("/transactions"),

  getVouches: () => apiCall<Vouch[]>("/vouches"),

  getFraudFlags: () => apiCall<FraudFlag[]>("/fraud-flags"),

  createTransaction: (data: Partial<Transaction>) =>
    apiCall<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createVouch: (data: Partial<Vouch>) =>
    apiCall<Vouch>("/vouches", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFraudFlag: (id: string, status: FraudFlag["status"]) =>
    apiCall<FraudFlag>(`/fraud-flags/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
