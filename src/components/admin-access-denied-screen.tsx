import { AccountAccessScreen } from "@/components/account-access-screen";

export function AdminAccessDeniedScreen() {
  return (
    <AccountAccessScreen
      title="Access denied"
      description="This area is available to REVOX administrators only."
    />
  );
}
