import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { useRegister } from "../hooks/useLogin";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email(),
    password: z.string().min(8, "Minimum 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const register = useRegister();

  return (
    <AuthShell
      title="Create account"
      subtitle="Start managing invoices in under a minute."
    >
      <form
        onSubmit={form.handleSubmit((v) =>
          register.mutate(v, {
            onSuccess: (data) => {
              signIn(data.accessToken, data.user);
              toast.success("Account created");
              navigate("/", { replace: true });
            },
            onError: (err: ApiError) => {
              if (err.status === 409)
                form.setError("email", { message: "Email already in use" });
              toast.error(err.message || "Registration failed");
            },
          }),
        )}
        className="space-y-4"
      >
        {(
          [
            ["name", "Full name", "text", "Arihant Chougule"],
            ["email", "Email", "email", "you@company.com"],
            ["password", "Password", "password", "Min 8 characters"],
            ["confirm", "Confirm password", "password", "Repeat password"],
          ] as const
        ).map(([field, label, type, ph]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              type={type}
              placeholder={ph}
              {...form.register(field)}
            />
            {form.formState.errors[field] && (
              <p className="text-xs text-destructive">
                {form.formState.errors[field]?.message}
              </p>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
