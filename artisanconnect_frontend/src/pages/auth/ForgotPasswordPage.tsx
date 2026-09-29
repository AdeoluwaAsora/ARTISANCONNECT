import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiCheckCircle } from "react-icons/fi";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Input } from "@/components/forms";
import { Button } from "@/components/ui";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import styles from "./ForgotPasswordPage.module.css";

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      // TODO: replace with authApi.requestPasswordReset(values) once the API layer is wired up.
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("forgot password payload", values);
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        eyebrow="Check your inbox"
        title="Reset link sent"
        subtitle="We've emailed you a link to reset your password."
      >
        <div className={styles.confirmation}>
          <FiCheckCircle size={40} className={styles.confirmationIcon} aria-hidden="true" />
          <p className="body-base">
            If an account exists for that email, a password reset link is on its way.
            It expires in 30 minutes.
          </p>
          <Link to="/login">
            <Button variant="outline" fullWidth>
              Back to log in
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className={styles.serverError} role="alert">
            {serverError}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Send reset link
        </Button>

        <p className={styles.footerText}>
          Remembered your password?{" "}
          <Link to="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
