export type UserRole = "admin" | "operation";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export type SessionContext =
  | { status: "unauthenticated" }
  | { status: "account_unavailable" }
  | { status: "no_profile" }
  | { status: "inactive"; profile: Profile }
  | { status: "invalid_role"; profile: Profile }
  | { status: "unlinked_operation"; profile: Profile }
  | { status: "inactive_operation_member"; profile: Profile }
  | { status: "ready"; profile: Profile; operationMemberId?: string };

export type AppUser = {
  fullName: string;
  role: UserRole;
  roleLabel: string;
};
