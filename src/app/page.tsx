import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdminDashboardContent } from "@/components/dashboard/admin-dashboard-content";
import { OperationDashboardContent } from "@/components/dashboard/operation-dashboard-content";
import { renderAccountAccess } from "@/lib/auth/account-access";
import { getNavigationItems, getRoleLabel } from "@/lib/auth/navigation";
import { getSessionContext } from "@/lib/auth/session";
import {
  getCurrentCairoMonthStart,
  parseDashboardPeriod,
} from "@/lib/dashboard/period";

type DashboardPageProps = {
  searchParams: Promise<{
    month?: string;
    period?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  const accessScreen = renderAccountAccess(context);
  if (accessScreen) {
    return accessScreen;
  }

  if (context.status !== "ready") {
    redirect("/login");
  }

  const { profile } = context;
  const user = {
    fullName: profile.full_name,
    role: profile.role,
    roleLabel: getRoleLabel(profile.role),
  };
  const navItems = getNavigationItems(profile.role, "/");
  const resolvedSearchParams = await searchParams;
  const currentMonthParam = getCurrentCairoMonthStart().slice(0, 7);
  const period = parseDashboardPeriod(resolvedSearchParams);

  return (
    <AppShell user={user} navItems={navItems}>
      {profile.role === "admin" ? (
        <AdminDashboardContent period={period} currentMonthParam={currentMonthParam} />
      ) : (
        <OperationDashboardContent />
      )}
    </AppShell>
  );
}
