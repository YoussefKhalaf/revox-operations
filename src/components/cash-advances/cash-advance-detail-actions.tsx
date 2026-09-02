"use client";

import { useRouter } from "next/navigation";
import {
  deleteAdvanceReturnAction,
  deleteCashAdvanceAction,
  deleteExpenseAction,
} from "@/app/actions/delete-records";
import { DeleteRecordButton } from "@/components/delete-record-button";

type CashAdvanceDetailActionsProps = {
  advanceId: string;
  expenseId?: string;
  returnId?: string;
  showExpenseDelete?: boolean;
  showReturnDelete?: boolean;
};

export function CashAdvanceDetailActions({
  advanceId,
  expenseId,
  returnId,
  showExpenseDelete = false,
  showReturnDelete = false,
}: CashAdvanceDetailActionsProps) {
  const router = useRouter();

  if (showExpenseDelete && expenseId) {
    return (
      <DeleteRecordButton
        recordId={expenseId}
        confirmMessage="Delete this linked expense? This cannot be undone."
        deleteAction={deleteExpenseAction}
      />
    );
  }

  if (showReturnDelete && returnId) {
    return (
      <DeleteRecordButton
        recordId={returnId}
        confirmMessage="Delete this returned amount? This cannot be undone."
        deleteAction={deleteAdvanceReturnAction}
      />
    );
  }

  return (
    <DeleteRecordButton
      recordId={advanceId}
      label="Delete advance"
      confirmMessage="Delete this cash advance? Linked expenses or returns must be removed first."
      deleteAction={async (recordId) => {
        const result = await deleteCashAdvanceAction(recordId);
        if (result.ok) {
          router.push("/cash-advances");
        }
        return result;
      }}
      className="inline-flex"
    />
  );
}
