import type { TraderProfile, LenderProfile, Transaction, Vouch, FraudFlag, User } from "./types";

export const mockUsers: User[] = [
  { id: "u1", username: "amina_trader", role: "trader", email: "amina@trustledger.io", full_name: "Amina Osei", phone: "+233 24 555 0101", created_at: "2024-06-12" },
  { id: "u2", username: "kwame_lender", role: "lender", email: "kwame@trustledger.io", full_name: "Kwame Mensah", phone: "+233 20 555 0202", created_at: "2024-03-01" },
  { id: "u3", username: "admin", role: "admin", email: "admin@trustledger.io", full_name: "System Admin", created_at: "2024-01-01" },
];

export const mockTraders: TraderProfile[] = [
  { id: "t1", user_id: "u1", full_name: "Amina Osei", phone: "+233 24 555 0101", trust_score: 87, vouch_count: 12, total_transactions: 34, successful_loans: 8, defaulted_loans: 1, fraud_flags: 0, created_at: "2024-06-12" },
  { id: "t2", user_id: "u4", full_name: "Fatima Diallo", phone: "+233 27 555 0303", trust_score: 72, vouch_count: 6, total_transactions: 18, successful_loans: 4, defaulted_loans: 2, fraud_flags: 1, created_at: "2024-07-20" },
  { id: "t3", user_id: "u5", full_name: "Kofi Asante", phone: "+233 26 555 0404", trust_score: 94, vouch_count: 21, total_transactions: 56, successful_loans: 14, defaulted_loans: 0, fraud_flags: 0, created_at: "2024-04-05" },
  { id: "t4", user_id: "u6", full_name: "Grace Adjei", phone: "+233 23 555 0505", trust_score: 61, vouch_count: 3, total_transactions: 9, successful_loans: 2, defaulted_loans: 3, fraud_flags: 2, created_at: "2024-09-11" },
  { id: "t5", user_id: "u7", full_name: "Ibrahim Suleiman", phone: "+233 20 555 0606", trust_score: 79, vouch_count: 9, total_transactions: 27, successful_loans: 6, defaulted_loans: 1, fraud_flags: 0, created_at: "2024-05-18" },
  { id: "t6", user_id: "u8", full_name: "Abena Boateng", phone: "+233 24 555 0707", trust_score: 83, vouch_count: 15, total_transactions: 41, successful_loans: 10, defaulted_loans: 0, fraud_flags: 0, created_at: "2024-02-28" },
];

export const mockLenders: LenderProfile[] = [
  { id: "l1", user_id: "u2", business_name: "Mensah Microfinance", total_lent: 125000, active_loans: 18, default_rate: 4.2, avg_loan_size: 3500, created_at: "2024-03-01" },
  { id: "l2", user_id: "u9", business_name: "Accra Capital Partners", total_lent: 340000, active_loans: 42, default_rate: 2.8, avg_loan_size: 5200, created_at: "2024-01-15" },
  { id: "l3", user_id: "u10", business_name: "Sahel Trust Lending", total_lent: 89000, active_loans: 11, default_rate: 6.1, avg_loan_size: 2800, created_at: "2024-05-22" },
  { id: "l4", user_id: "u11", business_name: "Gold Coast Ventures", total_lent: 210000, active_loans: 29, default_rate: 3.5, avg_loan_size: 4100, created_at: "2024-02-10" },
];

export const mockTransactions: Transaction[] = [
  { id: "tx1", trader_id: "t1", trader_name: "Amina Osei", lender_id: "l1", lender_name: "Mensah Microfinance", amount: 3500, status: "completed", created_at: "2025-01-15", due_date: "2025-04-15" },
  { id: "tx2", trader_id: "t2", trader_name: "Fatima Diallo", lender_id: "l2", lender_name: "Accra Capital Partners", amount: 5200, status: "pending", created_at: "2025-02-20", due_date: "2025-05-20" },
  { id: "tx3", trader_id: "t3", trader_name: "Kofi Asante", lender_id: "l1", lender_name: "Mensah Microfinance", amount: 2800, status: "completed", created_at: "2025-01-08", due_date: "2025-03-08" },
  { id: "tx4", trader_id: "t4", trader_name: "Grace Adjei", lender_id: "l3", lender_name: "Sahel Trust Lending", amount: 1500, status: "defaulted", created_at: "2024-11-10", due_date: "2025-02-10" },
  { id: "tx5", trader_id: "t5", trader_name: "Ibrahim Suleiman", lender_id: "l4", lender_name: "Gold Coast Ventures", amount: 4100, status: "completed", created_at: "2025-01-22", due_date: "2025-04-22" },
  { id: "tx6", trader_id: "t1", trader_name: "Amina Osei", lender_id: "l2", lender_name: "Accra Capital Partners", amount: 6000, status: "pending", created_at: "2025-03-01", due_date: "2025-06-01" },
  { id: "tx7", trader_id: "t6", trader_name: "Abena Boateng", lender_id: "l1", lender_name: "Mensah Microfinance", amount: 3200, status: "completed", created_at: "2024-12-15", due_date: "2025-03-15" },
  { id: "tx8", trader_id: "t2", trader_name: "Fatima Diallo", lender_id: "l4", lender_name: "Gold Coast Ventures", amount: 4500, status: "disputed", created_at: "2025-02-05", due_date: "2025-05-05" },
  { id: "tx9", trader_id: "t3", trader_name: "Kofi Asante", lender_id: "l2", lender_name: "Accra Capital Partners", amount: 7000, status: "completed", created_at: "2025-01-30", due_date: "2025-04-30" },
  { id: "tx10", trader_id: "t5", trader_name: "Ibrahim Suleiman", lender_id: "l3", lender_name: "Sahel Trust Lending", amount: 2200, status: "pending", created_at: "2025-03-10", due_date: "2025-06-10" },
];

export const mockVouches: Vouch[] = [
  { id: "v1", voucher_id: "t3", voucher_name: "Kofi Asante", vouchee_id: "t1", vouchee_name: "Amina Osei", relationship: "Business partner", status: "accepted", created_at: "2024-08-15" },
  { id: "v2", voucher_id: "t6", voucher_name: "Abena Boateng", vouchee_id: "t1", vouchee_name: "Amina Osei", relationship: "Market neighbor", status: "accepted", created_at: "2024-09-20" },
  { id: "v3", voucher_id: "t1", voucher_name: "Amina Osei", vouchee_id: "t5", vouchee_name: "Ibrahim Suleiman", relationship: "Supplier", status: "accepted", created_at: "2024-10-05" },
  { id: "v4", voucher_id: "t5", voucher_name: "Ibrahim Suleiman", vouchee_id: "t2", vouchee_name: "Fatima Diallo", relationship: "Former colleague", status: "pending", created_at: "2025-02-14" },
  { id: "v5", voucher_id: "t3", voucher_name: "Kofi Asante", vouchee_id: "t6", vouchee_name: "Abena Boateng", relationship: "Family friend", status: "accepted", created_at: "2024-07-10" },
  { id: "v6", voucher_id: "t2", voucher_name: "Fatima Diallo", vouchee_id: "t4", vouchee_name: "Grace Adjei", relationship: "Customer", status: "rejected", created_at: "2025-01-03" },
];

export const mockFraudFlags: FraudFlag[] = [
  { id: "ff1", trader_id: "t2", trader_name: "Fatima Diallo", reason: "Discrepancy in reported transaction volume vs. lender records", status: "investigating", created_at: "2025-01-28" },
  { id: "ff2", trader_id: "t4", trader_name: "Grace Adjei", reason: "Multiple default patterns within short timeframe", status: "open", created_at: "2025-02-15" },
  { id: "ff3", trader_id: "t4", trader_name: "Grace Adjei", reason: "Identity verification mismatch on phone number", status: "open", created_at: "2025-03-02" },
  { id: "ff4", trader_id: "t2", trader_name: "Fatima Diallo", reason: "Disputed transaction amount with Gold Coast Ventures", status: "resolved", created_at: "2024-12-10", resolved_at: "2025-01-15" },
];
