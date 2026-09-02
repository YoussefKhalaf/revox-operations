"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DeleteActionResult } from "@/app/actions/delete-records";

type DeleteRecordButtonProps = {
  recordId: string;
  label?: string;
  confirmMessage: string;
  deleteAction: (recordId: string) => Promise<DeleteActionResult>;
  className?: string;
};

export function DeleteRecordButton({
  recordId,
  label = "Delete",
  confirmMessage,
  deleteAction,
  className,
}: DeleteRecordButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteAction(recordId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <span className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting…" : label}
      </button>
      {error && (
        <span className="mt-1 block text-xs text-red-700" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
