import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  // Only allow same-origin relative redirects (prevents open-redirect).
  const next = rawNext && rawNext.startsWith("/") ? rawNext : "/";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const login = useLogin();

  return (
    <AuthShell
      title="Sign in"
      subtitle="Enter your credentials to access your workspace."
    >
      <form
        onSubmit={form.handleSubmit((v) =>
          login.mutate(v, {
            onSuccess: (data) => {
              signIn(data.accessToken, data.user);
              toast.success(
                `Welcome back, ${data.user.name ?? data.user.email}`,
              );
              navigate(next, { replace: true });
            },
            onError: (err: ApiError) => {
              if (err.status === 401)
                form.setError("password", {
                  message: "Invalid email or password",
                });
              toast.error(err.message || "Login failed");
            },
          }),
        )}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
