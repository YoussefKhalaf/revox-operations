import { signOutAction } from "@/app/actions/auth";

type AccountAccessScreenProps = {
  title: string;
  description: string;
};

export function AccountAccessScreen({
  title,
  description,
}: AccountAccessScreenProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
