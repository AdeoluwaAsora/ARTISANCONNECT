import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Input, PasswordInput, Checkbox } from "@/components/forms";
import { Button } from "@/components/ui";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { authApi } from "@/api/authApi";
import { setSession } from "@/store/authSession";
import styles from "./LoginPage.module.css";

export function LoginPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "", rememberMe: true },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null);
        try {
            const response = await authApi.login({
                email: values.email,
                password: values.password,
            });

            if (!response.success) {
                setServerError(response.message ?? response.errors?.[0] ?? "Couldn't sign you in.");
                return;
            }

            setSession(response.data, values.rememberMe);

            navigate(response.data.role === "Artisan" ? "/artisan/dashboard" : "/customer/dashboard");
        } catch (err) {
            if (isAxiosError(err) && err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Couldn't sign you in. Please check your connection and try again.");
            }
        }
    };

    return (
        <AuthLayout
            eyebrow="Welcome back"
            title="Log in to your account"
            subtitle="Customers and artisans both sign in here."
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
                    autoComplete="username"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <PasswordInput
                    label="Password"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <div className={styles.row}>
                    <Checkbox label="Remember me" {...register("rememberMe")} />
                    <Link to="/forgot-password" className={styles.link}>
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                    Log in
                </Button>

                <p className={styles.footerText}>
                    New to ArtisanConnect?{" "}
                    <Link to="/register/customer" className={styles.link}>
                        Create a customer account
                    </Link>{" "}
                    or{" "}
                    <Link to="/register/artisan" className={styles.link}>
                        join as an artisan
                    </Link>
                    .
                </p>
            </form>
        </AuthLayout>
    );
}