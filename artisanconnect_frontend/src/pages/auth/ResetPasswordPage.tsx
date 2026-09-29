import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordInput } from "@/components/forms";
import { Button } from "@/components/ui";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";
import styles from "./ResetPasswordPage.module.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      // TODO: replace with authApi.resetPassword({ token, password: values.password })
      // once the API layer is wired up.
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("reset password payload", { token, ...values });
      navigate("/login");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  };

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Reset password"
        title="This link isn't valid"
        subtitle="The reset link is missing or has expired."
      >
        <p className="body-base">
          Request a new link from the{" "}
          <Link to="/forgot-password" className={styles.link}>
            forgot password
          </Link>{" "}
          page.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Make it something you haven't used before."
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className={styles.serverError} role="alert">
            {serverError}
          </div>
        )}

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          error={errors.password?.message}
          strengthValue={passwordValue}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
