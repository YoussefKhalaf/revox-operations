import Link from "next/link";
import { deleteExpenseAction } from "@/app/actions/delete-records";
import { DeleteRecordButton } from "@/components/delete-record-button";
import { formatEgpAmount } from "@/lib/finance/amount";
import { formatApartmentLabel } from "@/lib/finance/types";
import type { ExpenseListItem } from "@/lib/expenses/types";

type ExpenseTableProps = {
  expenses: ExpenseListItem[];
};

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatFunding(expense: ExpenseListItem) {
  return expense.cash_advance_id ? "Cash Advance" : "Unlinked / Direct";
}

function formatPaidBy(expense: ExpenseListItem) {
  if (!expense.paid_by_member_id) {
    return "REVOX Direct";
  }

  return expense.operation_members?.full_name ?? "—";
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Apartment
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Paid By
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Funding
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3 text-sm text-foreground">{formatDisplayDate(expense.expense_date)}</td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {formatApartmentLabel(expense.apartment)}
                </td>
                <td className="px-4 py-3 text-sm text-muted">{expense.category}</td>
                <td className="px-4 py-3 text-sm text-muted">{expense.description}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatPaidBy(expense)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatFunding(expense)}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatEgpAmount(expense.amount)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/income-expenses/expenses/${expense.id}/edit`}
                      className="font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteRecordButton
                      recordId={expense.id}
                      confirmMessage="Delete this expense entry? This cannot be undone."
                      deleteAction={deleteExpenseAction}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <article
            key={expense.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatDisplayDate(expense.expense_date)}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatApartmentLabel(expense.apartment)}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatEgpAmount(expense.amount)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link
                  href={`/income-expenses/expenses/${expense.id}/edit`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit
                </Link>
                <DeleteRecordButton
                  recordId={expense.id}
                  confirmMessage="Delete this expense entry? This cannot be undone."
                  deleteAction={deleteExpenseAction}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">
              <span className="text-foreground">Funding: </span>
              {formatFunding(expense)}
            </p>
            <p className="mt-1 text-sm text-muted">
              <span className="text-foreground">Paid by: </span>
              {formatPaidBy(expense)}
            </p>
            <p className="mt-1 text-sm text-muted">
              <span className="text-foreground">Category: </span>
              {expense.category}
            </p>
            <p className="mt-1 text-sm text-muted">
              <span className="text-foreground">Description: </span>
              {expense.description}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
