import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">REVOX Operations</h1>
          <p className="mt-1 text-sm text-muted">Internal Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
