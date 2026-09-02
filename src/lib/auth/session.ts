import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, SessionContext, UserRole } from "@/lib/auth/types";

function isUserRole(value: string): value is UserRole {
  return value === "admin" || value === "operation";
}

export async function getSessionContext(): Promise<SessionContext> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "unauthenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { status: "account_unavailable" };
  }

  if (!profile) {
    return { status: "no_profile" };
  }

  if (!profile.is_active) {
    return {
      status: "inactive",
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: isUserRole(profile.role) ? profile.role : "operation",
        is_active: profile.is_active,
      },
    };
  }

  if (!isUserRole(profile.role)) {
    return {
      status: "invalid_role",
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: "operation",
        is_active: profile.is_active,
      },
    };
  }

  const typedProfile: Profile = {
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role,
    is_active: profile.is_active,
  };

  if (typedProfile.role === "operation") {
    const { data: member, error: memberError } = await supabase
      .from("operation_members")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) {
      return { status: "account_unavailable" };
    }

    if (!member) {
      return { status: "unlinked_operation", profile: typedProfile };
    }

    if (member.status !== "active") {
      return { status: "inactive_operation_member", profile: typedProfile };
    }

    return {
      status: "ready",
      profile: typedProfile,
      operationMemberId: member.id,
    };
  }

  return { status: "ready", profile: typedProfile };
}
