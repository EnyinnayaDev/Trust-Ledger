import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { TraderDashboard } from "@/pages/trader/Dashboard";
import { TraderTransactions } from "@/pages/trader/Transactions";
import { TraderVouches } from "@/pages/trader/Vouches";
import { TraderProfile } from "@/pages/trader/Profile";
import { LenderDashboard } from "@/pages/lender/Dashboard";
import { LenderTraders } from "@/pages/lender/Traders";
import { LenderTransactions } from "@/pages/lender/Transactions";
import { LenderProfile } from "@/pages/lender/Profile";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminTraders } from "@/pages/admin/Traders";
import { AdminLenders } from "@/pages/admin/Lenders";
import { AdminFraud } from "@/pages/admin/Fraud";
import { AdminAnalytics } from "@/pages/admin/Analytics";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const rolePaths = {
    trader: "/trader",
    lender: "/lender",
    admin: "/admin",
  };

  return <Navigate to={rolePaths[user.role]} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Trader Routes */}
      <Route path="/trader" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<TraderDashboard />} />
        <Route path="transactions" element={<TraderTransactions />} />
        <Route path="vouches" element={<TraderVouches />} />
        <Route path="profile" element={<TraderProfile />} />
      </Route>

      {/* Lender Routes */}
      <Route path="/lender" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<LenderDashboard />} />
        <Route path="traders" element={<LenderTraders />} />
        <Route path="transactions" element={<LenderTransactions />} />
        <Route path="profile" element={<LenderProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="traders" element={<AdminTraders />} />
        <Route path="lenders" element={<AdminLenders />} />
        <Route path="fraud" element={<AdminFraud />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;