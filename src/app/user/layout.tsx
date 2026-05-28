import UserSidebar from "@/components/user/UserSidebar";
import UserGuard from "@/components/guards/UserGuard";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGuard>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <UserSidebar />
        <div style={{ marginLeft: "var(--sidebar-width, 240px)", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <main style={{ flex: 1, padding: "28px 32px 40px", overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </UserGuard>
  );
}
