import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Input, PasswordInput, Checkbox } from "@/components/forms";
import { Button } from "@/components/ui";
import {
    customerRegisterSchema,
    type CustomerRegisterFormValues,
} from "@/features/auth/schemas";
import { authApi } from "@/api/authApi";
import { setSession } from "@/store/authSession";
import { UserRoleValue } from "@/types/api";
import styles from "./CustomerRegisterPage.module.css";

export function CustomerRegisterPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CustomerRegisterFormValues>({
        resolver: zodResolver(customerRegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            agreedToTerms: false as unknown as true,
        },
    });

    const passwordValue = watch("password");

    const onSubmit = async (values: CustomerRegisterFormValues) => {
        setServerError(null);
        try {
            const response = await authApi.register({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phone,
                password: values.password,
                confirmPassword: values.confirmPassword,
                role: UserRoleValue.Customer,
            });

            if (!response.success) {
                setServerError(
                    response.message ?? response.errors?.[0] ?? "Couldn't create your account.",
                );
                return;
            }

            setSession(response.data, true);
            navigate("/customer/dashboard");
        } catch (err) {
            if (isAxiosError(err) && err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Couldn't create your account. Please try again.");
            }
        }
    };

    return (
        <AuthLayout
            eyebrow="Get started"
            title="Create your customer account"
            subtitle="Find and hire verified artisans near you."
        >
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                {serverError && (
                    <div className={styles.serverError} role="alert">
                        {serverError}
                    </div>
                )}

                <div className={styles.nameRow}>
                    <Input
                        label="First name"
                        type="text"
                        autoComplete="given-name"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                    />
                    <Input
                        label="Last name"
                        type="text"
                        autoComplete="family-name"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </div>

                <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <Input
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 08012345678"
                    error={errors.phone?.message}
                    {...register("phone")}
                />

                <PasswordInput
                    label="Password"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    strengthValue={passwordValue}
                    {...register("password")}
                />

                <PasswordInput
                    label="Confirm password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <Checkbox
                    label={
                        <>
                            I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                            <Link to="/privacy">Privacy Policy</Link>
                        </>
                    }
                    error={errors.agreedToTerms?.message}
                    {...register("agreedToTerms")}
                />

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                    Create account
                </Button>

                <p className={styles.footerText}>
                    Already have an account?{" "}
                    <Link to="/login" className={styles.link}>
                        Log in
                    </Link>
                    . Signing up as an artisan instead?{" "}
                    <Link to="/register/artisan" className={styles.link}>
                        Register here
                    </Link>
                    .
                </p>
            </form>
        </AuthLayout>
    );
}