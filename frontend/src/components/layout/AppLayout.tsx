import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}