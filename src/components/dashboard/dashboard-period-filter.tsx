import Link from "next/link";

type DashboardPeriodFilterProps = {
  currentMonthParam: string;
  selectedMonthParam?: string;
  isAllTime: boolean;
};

export function DashboardPeriodFilter({
  currentMonthParam,
  selectedMonthParam,
  isAllTime,
}: DashboardPeriodFilterProps) {
  return (
    <form method="get" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="month" className="block text-sm font-medium text-foreground">
          Period
        </label>
        <input
          id="month"
          name="month"
          type="month"
          defaultValue={isAllTime ? currentMonthParam : selectedMonthParam ?? currentMonthParam}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Apply
        </button>
        <Link
          href="/?period=all"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          All Time
        </Link>
      </div>
    </form>
  );
}
