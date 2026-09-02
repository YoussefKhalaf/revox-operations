import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminAccessDeniedScreen } from "@/components/admin-access-denied-screen";
import { renderAccountAccess } from "@/lib/auth/account-access";
import { getNavigationItems, getRoleLabel } from "@/lib/auth/navigation";
import type { NavItem } from "@/lib/auth/navigation";
import { getSessionContext } from "@/lib/auth/session";
import type { AppUser, Profile } from "@/lib/auth/types";

type AdminPageReady = {
  kind: "ready";
  user: AppUser;
  navItems: NavItem[];
  profile: Profile;
};

type AdminPageScreen = {
  kind: "screen";
  element: ReactNode;
};

export type AdminPageContext = AdminPageReady | AdminPageScreen;

export async function getAdminPageContext(activePath: string): Promise<AdminPageContext> {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  const accessScreen = renderAccountAccess(context);
  if (accessScreen) {
    return { kind: "screen", element: accessScreen };
  }

  if (context.status !== "ready" || context.profile.role !== "admin") {
    return { kind: "screen", element: <AdminAccessDeniedScreen /> };
  }

  const { profile } = context;

  return {
    kind: "ready",
    profile,
    user: {
      fullName: profile.full_name,
      role: profile.role,
      roleLabel: getRoleLabel(profile.role),
    },
    navItems: getNavigationItems("admin", activePath),
  };
}

export async function requireActiveAdmin() {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    return { ok: false as const, reason: "unauthenticated" as const };
  }

  if (context.status !== "ready" || context.profile.role !== "admin") {
    return { ok: false as const, reason: "forbidden" as const };
  }

  return { ok: true as const, profile: context.profile };
}
