export type Role = "trader" | "lender" | "admin";

export interface User {
  id: string;
  username: string;
  role: Role;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface TraderProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  trust_score: number;
  vouch_count: number;
  total_transactions: number;
  successful_loans: number;
  defaulted_loans: number;
  fraud_flags: number;
  created_at: string;
}

export interface LenderProfile {
  id: string;
  user_id: string;
  business_name: string;
  total_lent: number;
  active_loans: number;
  default_rate: number;
  avg_loan_size: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  trader_id: string;
  trader_name: string;
  lender_id: string;
  lender_name: string;
  amount: number;
  status: "pending" | "completed" | "defaulted" | "disputed";
  created_at: string;
  due_date: string;
}

export interface Vouch {
  id: string;
  voucher_id: string;
  voucher_name: string;
  vouchee_id: string;
  vouchee_name: string;
  relationship: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface FraudFlag {
  id: string;
  trader_id: string;
  trader_name: string;
  reason: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  created_at: string;
  resolved_at?: string;
}
