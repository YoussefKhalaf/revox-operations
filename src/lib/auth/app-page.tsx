import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { renderAccountAccess } from "@/lib/auth/account-access";
import { getNavigationItems, getRoleLabel } from "@/lib/auth/navigation";
import type { NavItem } from "@/lib/auth/navigation";
import { getSessionContext } from "@/lib/auth/session";
import type { AppUser, Profile } from "@/lib/auth/types";

type AppPageReady = {
  kind: "ready";
  user: AppUser;
  navItems: NavItem[];
  profile: Profile;
};

type AppPageScreen = {
  kind: "screen";
  element: ReactNode;
};

export type AppPageContext = AppPageReady | AppPageScreen;

export async function getAppPageContext(activePath: string): Promise<AppPageContext> {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  const accessScreen = renderAccountAccess(context);
  if (accessScreen) {
    return { kind: "screen", element: accessScreen };
  }

  if (context.status !== "ready") {
    redirect("/login");
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
    navItems: getNavigationItems(profile.role, activePath),
  };
}
