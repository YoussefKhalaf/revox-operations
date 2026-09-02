import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { OperationAccessDeniedScreen } from "@/components/operation-access-denied-screen";
import { renderAccountAccess } from "@/lib/auth/account-access";
import { getNavigationItems, getRoleLabel } from "@/lib/auth/navigation";
import type { NavItem } from "@/lib/auth/navigation";
import { getSessionContext } from "@/lib/auth/session";
import type { AppUser, Profile } from "@/lib/auth/types";

type OperationPageReady = {
  kind: "ready";
  user: AppUser;
  navItems: NavItem[];
  profile: Profile;
  operationMemberId: string;
};

type OperationPageScreen = {
  kind: "screen";
  element: ReactNode;
};

export type OperationPageContext = OperationPageReady | OperationPageScreen;

export async function getOperationPageContext(
  activePath: string,
): Promise<OperationPageContext> {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  const accessScreen = renderAccountAccess(context);
  if (accessScreen) {
    return { kind: "screen", element: accessScreen };
  }

  if (
    context.status !== "ready" ||
    context.profile.role !== "operation" ||
    !context.operationMemberId
  ) {
    return { kind: "screen", element: <OperationAccessDeniedScreen /> };
  }

  const { profile, operationMemberId } = context;

  return {
    kind: "ready",
    profile,
    operationMemberId,
    user: {
      fullName: profile.full_name,
      role: profile.role,
      roleLabel: getRoleLabel(profile.role),
    },
    navItems: getNavigationItems("operation", activePath),
  };
}

export async function requireActiveOperationMember() {
  const context = await getSessionContext();

  if (context.status === "unauthenticated") {
    return { ok: false as const, reason: "unauthenticated" as const };
  }

  if (
    context.status !== "ready" ||
    context.profile.role !== "operation" ||
    !context.operationMemberId
  ) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  return {
    ok: true as const,
    profile: context.profile,
    operationMemberId: context.operationMemberId,
  };
}
