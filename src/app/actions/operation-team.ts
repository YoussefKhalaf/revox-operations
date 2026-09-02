"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActiveAdmin } from "@/lib/auth/admin-page";
import { isEligibleLoginProfile } from "@/lib/operation-team/queries";
import {
  normalizeTeamMemberInput,
  parseTeamMemberForm,
  validateTeamMemberForm,
} from "@/lib/operation-team/validation";
import type { TeamMemberFormValues } from "@/lib/operation-team/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SAVE_ERROR =
  "Unable to save the team member. Please review the information and try again.";
const LINK_CONFLICT_ERROR =
  "This login account is already linked to another team member.";

export type TeamMemberActionState = {
  errors?: Partial<Record<keyof TeamMemberFormValues, string>>;
  formError?: string;
  values?: TeamMemberFormValues;
};

async function assertCanSaveLoginLink(userId: string | null, memberId?: string) {
  if (!userId) {
    return true;
  }

  return isEligibleLoginProfile(userId, memberId);
}

export async function createTeamMemberAction(
  _prevState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseTeamMemberForm(formData, true);
  const validated = validateTeamMemberForm(values, true);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const canLink = await assertCanSaveLoginLink(validated.data.user_id || null);
  if (!canLink) {
    return { formError: LINK_CONFLICT_ERROR, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeTeamMemberInput(validated.data);

  const { error } = await supabase.from("operation_members").insert(payload);

  if (error) {
    if (error.code === "23505") {
      return { formError: LINK_CONFLICT_ERROR, values: validated.data };
    }

    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/operation-team");
  redirect("/operation-team");
}

export async function updateTeamMemberAction(
  memberId: string,
  _prevState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  const admin = await requireActiveAdmin();
  if (!admin.ok) {
    return { formError: SAVE_ERROR };
  }

  const values = parseTeamMemberForm(formData, false);
  const validated = validateTeamMemberForm(values, false);

  if (!validated.success) {
    return { errors: validated.errors, values: validated.values };
  }

  const canLink = await assertCanSaveLoginLink(validated.data.user_id || null, memberId);
  if (!canLink) {
    return { formError: LINK_CONFLICT_ERROR, values: validated.data };
  }

  const supabase = await createServerSupabaseClient();
  const payload = normalizeTeamMemberInput(validated.data);

  const { error } = await supabase
    .from("operation_members")
    .update(payload)
    .eq("id", memberId);

  if (error) {
    if (error.code === "23505") {
      return { formError: LINK_CONFLICT_ERROR, values: validated.data };
    }

    return { formError: SAVE_ERROR, values: validated.data };
  }

  revalidatePath("/operation-team");
  redirect("/operation-team");
}
