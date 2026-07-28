import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "@phosphor-icons/react";

export function AppLayout() {
  const { mockMode, toggleMockMode } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">
              {mockMode ? "Mock Mode" : "Live API"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMockMode}
              className="h-8 px-2"
            >
              {mockMode ? (
                <ToggleLeft className="h-5 w-5" />
              ) : (
                <ToggleRight className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
