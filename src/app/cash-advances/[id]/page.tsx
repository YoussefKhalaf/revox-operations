import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AdvanceStatusBadge } from "@/components/cash-advances/advance-status-badge";
import { CashAdvanceDetailActions } from "@/components/cash-advances/cash-advance-detail-actions";
import { getAdminPageContext } from "@/lib/auth/admin-page";
import {
  fetchCashAdvanceBalanceById,
  fetchCashAdvanceById,
  fetchLinkedExpensesForAdvance,
  fetchReturnsForAdvance,
} from "@/lib/cash-advances/queries";
import { formatEgpAmount } from "@/lib/finance/amount";
import { formatApartmentLabel } from "@/lib/finance/types";
import { isPositiveBalance } from "@/lib/finance/balance";
import { isValidUuid } from "@/lib/finance/validation";

type CashAdvanceDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export default async function CashAdvanceDetailPage({ params }: CashAdvanceDetailPageProps) {
  const { id } = await params;

  if (!isValidUuid(id)) {
    notFound();
  }

  const page = await getAdminPageContext(`/cash-advances/${id}`);

  if (page.kind === "screen") {
    return page.element;
  }

  const [advance, balance, expenses, returns] = await Promise.all([
    fetchCashAdvanceById(id),
    fetchCashAdvanceBalanceById(id),
    fetchLinkedExpensesForAdvance(id),
    fetchReturnsForAdvance(id),
  ]);

  if (!advance || !balance) {
    notFound();
  }

  return (
    <AppShell user={page.user} navItems={page.navItems}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Cash advance details</h2>
            <p className="mt-1 text-sm text-muted">{balance.operation_member_name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/cash-advances/${id}/edit`}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Edit advance
            </Link>
            {isPositiveBalance(balance.remaining_balance) && (
              <Link
                href={`/cash-advances/${id}/returns/new`}
                className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Record return
              </Link>
            )}
            <CashAdvanceDetailActions advanceId={id} />
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Issued date</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDisplayDate(advance.issued_date)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Issued amount</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatEgpAmount(balance.issued_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Spent</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatEgpAmount(balance.total_linked_expenses)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Returned</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatEgpAmount(balance.total_returned)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Remaining</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatEgpAmount(balance.remaining_balance)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Status</p>
            <div className="mt-1">
              <AdvanceStatusBadge remainingBalance={balance.remaining_balance} />
            </div>
          </div>
          {advance.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-muted">Notes</p>
              <p className="mt-1 text-sm text-foreground">{advance.notes}</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Linked expenses</h3>
          {expenses.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted shadow-sm">
              No linked expenses yet.
            </section>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Apartment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatDisplayDate(expense.expense_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatApartmentLabel(expense.apartment)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{expense.category}</td>
                      <td className="px-4 py-3 text-sm text-muted">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatEgpAmount(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <CashAdvanceDetailActions
                          advanceId={id}
                          expenseId={expense.id}
                          showExpenseDelete
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Returned amounts</h3>
          {returns.length === 0 ? (
            <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted shadow-sm">
              No returned amounts recorded yet.
            </section>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {returns.map((advanceReturn) => (
                    <tr key={advanceReturn.id}>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatDisplayDate(advanceReturn.return_date)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatEgpAmount(advanceReturn.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {advanceReturn.notes?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/cash-advances/${id}/returns/${advanceReturn.id}/edit`}
                            className="font-medium text-accent hover:underline"
                          >
                            Edit
                          </Link>
                          <CashAdvanceDetailActions
                            advanceId={id}
                            returnId={advanceReturn.id}
                            showReturnDelete
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
