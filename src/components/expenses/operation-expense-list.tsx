import { formatEgpAmount } from "@/lib/finance/amount";
import { formatApartmentLabel } from "@/lib/finance/types";
import type { OperationExpenseListItem } from "@/lib/expenses/types";

type OperationExpenseListProps = {
  expenses: OperationExpenseListItem[];
};

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatFunding(expense: OperationExpenseListItem) {
  return expense.cash_advance_id ? "Cash Advance" : "Not linked";
}

export function OperationExpenseList({ expenses }: OperationExpenseListProps) {
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
                Funding
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Amount
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
                <td className="px-4 py-3 text-sm text-muted">{formatFunding(expense)}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatEgpAmount(expense.amount)}
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
            <p className="text-sm font-medium text-foreground">
              {formatDisplayDate(expense.expense_date)}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatApartmentLabel(expense.apartment)}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatEgpAmount(expense.amount)}
            </p>
            <p className="mt-3 text-sm text-muted">
              <span className="text-foreground">Funding: </span>
              {formatFunding(expense)}
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
