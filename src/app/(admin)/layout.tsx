import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AdminGuard from "@/components/guards/AdminGuard";
import { SettingsProvider } from "@/lib/useSettings";
import { AlertsProvider } from "@/lib/useAlerts";
import { AppearanceProvider } from "@/lib/useAppearance";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AppearanceProvider>
        <SettingsProvider>
          <AlertsProvider>
            <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
              <Sidebar />
              <div style={{ marginLeft: "var(--sidebar-width)", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Header />
                <main style={{ flex: 1, padding: "28px 32px 40px", overflowY: "auto" }}>
                  {children}
                </main>
              </div>
            </div>
          </AlertsProvider>
        </SettingsProvider>
      </AppearanceProvider>
    </AdminGuard>
  );
}
