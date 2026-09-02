export type OperationMemberStatus = "active" | "inactive";

export type OperationMember = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: OperationMemberStatus;
  created_at: string;
  updated_at: string;
};

export type LoginProfileOption = {
  id: string;
  full_name: string;
};

export type TeamMemberFormValues = {
  full_name: string;
  email: string;
  phone: string;
  user_id: string;
  status: OperationMemberStatus;
};

export type TeamMemberSummary = {
  total: number;
  active: number;
  inactive: number;
  loginLinked: number;
};

export function buildTeamMemberSummary(members: OperationMember[]): TeamMemberSummary {
  return {
    total: members.length,
    active: members.filter((member) => member.status === "active").length,
    inactive: members.filter((member) => member.status === "inactive").length,
    loginLinked: members.filter((member) => member.user_id !== null).length,
  };
}

export function sortOperationMembers(members: OperationMember[]): OperationMember[] {
  return [...members].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "active" ? -1 : 1;
    }

    return left.full_name.localeCompare(right.full_name, undefined, {
      sensitivity: "base",
    });
  });
}
