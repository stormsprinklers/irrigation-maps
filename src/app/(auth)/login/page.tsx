import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Irrigation Maps</h1>
        <p className="mt-1 text-muted-foreground">Professional irrigation planning for contractors</p>
      </div>
      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
