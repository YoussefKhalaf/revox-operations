type SummaryCardProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

export function SummaryCard({ label, value, valueClassName }: SummaryCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${valueClassName ?? "text-foreground"}`}>
        {value}
      </p>
    </article>
  );
}
