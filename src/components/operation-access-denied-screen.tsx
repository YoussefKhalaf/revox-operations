import { AccountAccessScreen } from "@/components/account-access-screen";

export function OperationAccessDeniedScreen() {
  return (
    <AccountAccessScreen
      title="Access denied"
      description="This page is available to Operation users only."
    />
  );
}
