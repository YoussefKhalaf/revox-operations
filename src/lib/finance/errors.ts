const BALANCE_ERROR = "This amount exceeds the remaining cash advance balance.";
const MEMBER_MISMATCH_ERROR =
  "This cash advance does not belong to the selected team member.";
const ADVANCE_SAVE_ERROR =
  "Unable to save the cash advance. Please review the information and try again.";
const RETURN_SAVE_ERROR = "Unable to record the returned amount. Please try again.";
const EXPENSE_SAVE_ERROR =
  "Unable to save the financial entry. Please review the information and try again.";

export function mapDatabaseError(error: { message?: string } | null): string {
  const message = error?.message ?? "";

  if (
    message.includes("EXPENSE_EXCEEDS_BALANCE") ||
    message.includes("RETURN_EXCEEDS_BALANCE")
  ) {
    return BALANCE_ERROR;
  }

  if (
    message.includes("ADVANCE_MEMBER_MISMATCH") ||
    message.includes("EXPENSE_MEMBER_REQUIRED")
  ) {
    return MEMBER_MISMATCH_ERROR;
  }

  return "";
}

export function mapCashAdvanceSaveError(error: { message?: string } | null): string {
  return mapDatabaseError(error) || ADVANCE_SAVE_ERROR;
}

export function mapReturnSaveError(error: { message?: string } | null): string {
  return mapDatabaseError(error) || RETURN_SAVE_ERROR;
}

export function mapExpenseSaveError(error: { message?: string } | null): string {
  return mapDatabaseError(error) || EXPENSE_SAVE_ERROR;
}

export {
  BALANCE_ERROR,
  MEMBER_MISMATCH_ERROR,
  ADVANCE_SAVE_ERROR,
  RETURN_SAVE_ERROR,
  EXPENSE_SAVE_ERROR,
};
