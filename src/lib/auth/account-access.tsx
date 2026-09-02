import { AccountAccessScreen } from "@/components/account-access-screen";
import type { SessionContext } from "@/lib/auth/types";

const ACCESS_MESSAGES: Record<
  Exclude<SessionContext["status"], "unauthenticated" | "ready">,
  { title: string; description: string }
> = {
  account_unavailable: {
    title: "Unable to verify account",
    description:
      "Your account could not be verified right now. Please try again later or contact the REVOX administrator.",
  },
  no_profile: {
    title: "Account setup required",
    description:
      "Your login exists, but an administrator must complete your account setup before you can access REVOX Operations.",
  },
  inactive: {
    title: "Account inactive",
    description:
      "Your account is inactive. Contact the REVOX administrator for assistance.",
  },
  invalid_role: {
    title: "Account access denied",
    description:
      "Your account does not have a valid role for this system. Contact the REVOX administrator for assistance.",
  },
  unlinked_operation: {
    title: "Operation profile not linked",
    description:
      "Your login is not linked to an Operation team member record. An administrator must complete this link before you can continue.",
  },
  inactive_operation_member: {
    title: "Operation access inactive",
    description:
      "Your Operation team member record is inactive. Contact the REVOX administrator for assistance.",
  },
};

export function renderAccountAccess(context: SessionContext) {
  if (context.status === "unauthenticated" || context.status === "ready") {
    return null;
  }

  const message = ACCESS_MESSAGES[context.status];
  return (
    <AccountAccessScreen
      title={message.title}
      description={message.description}
    />
  );
}
