import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LoginProfileOption, OperationMember } from "@/lib/operation-team/types";
import { sortOperationMembers } from "@/lib/operation-team/types";

export async function fetchOperationMembers(): Promise<OperationMember[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("operation_members")
    .select("id, user_id, full_name, phone, email, status, created_at, updated_at")
    .order("status", { ascending: true })
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return sortOperationMembers(data as OperationMember[]);
}

export async function fetchOperationMemberById(id: string): Promise<OperationMember | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("operation_members")
    .select("id, user_id, full_name, phone, email, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as OperationMember;
}

export async function fetchEligibleLoginProfiles(
  currentMemberId?: string,
): Promise<LoginProfileOption[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: profiles, error: profilesError }, { data: members, error: membersError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "operation")
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
      supabase.from("operation_members").select("id, user_id"),
    ]);

  if (profilesError || membersError || !profiles || !members) {
    return [];
  }

  const currentMember = currentMemberId
    ? members.find((member) => member.id === currentMemberId)
    : null;

  const linkedUserIds = new Set(
    members
      .map((member) => member.user_id)
      .filter((userId): userId is string => Boolean(userId)),
  );

  const currentLinkedUserId = currentMember?.user_id ?? null;
  if (currentLinkedUserId) {
    linkedUserIds.delete(currentLinkedUserId);
  }

  const eligible = profiles
    .filter((profile) => !linkedUserIds.has(profile.id))
    .map((profile) => ({
      id: profile.id,
      full_name: profile.full_name,
    }));

  if (currentLinkedUserId && !eligible.some((profile) => profile.id === currentLinkedUserId)) {
    const { data: linkedProfile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", currentLinkedUserId)
      .eq("role", "operation")
      .maybeSingle();

    if (linkedProfile) {
      eligible.push({
        id: linkedProfile.id,
        full_name: linkedProfile.full_name,
      });
      eligible.sort((left, right) =>
        left.full_name.localeCompare(right.full_name, undefined, { sensitivity: "base" }),
      );
    }
  }

  return eligible;
}

export async function isEligibleLoginProfile(
  userId: string,
  excludeMemberId?: string,
): Promise<boolean> {
  const eligibleProfiles = await fetchEligibleLoginProfiles(excludeMemberId);
  return eligibleProfiles.some((profile) => profile.id === userId);
}
