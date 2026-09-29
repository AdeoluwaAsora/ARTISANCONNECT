import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Input, PasswordInput, Checkbox, Select } from "@/components/forms";
import { Button } from "@/components/ui";
import {
    artisanRegisterSchema,
    type ArtisanRegisterFormValues,
} from "@/features/auth/schemas";
import { authApi } from "@/api/authApi";
import { setSession } from "@/store/authSession";
import { UserRoleValue } from "@/types/api";
import styles from "./ArtisanRegisterPage.module.css";

const tradeOptions = [
    { value: "electrician", label: "Electrician" },
    { value: "plumber", label: "Plumber" },
    { value: "carpenter", label: "Carpenter" },
    { value: "mechanic", label: "Mechanic" },
    { value: "painter", label: "Painter" },
    { value: "tailor", label: "Tailor" },
    { value: "ac_technician", label: "AC Technician" },
    { value: "solar_installer", label: "Solar Installer" },
    { value: "housing_agent", label: "Housing Agent" },
];

export function ArtisanRegisterPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ArtisanRegisterFormValues>({
        resolver: zodResolver(artisanRegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            trade: "",
            yearsExperience: 0,
            password: "",
            confirmPassword: "",
            agreedToTerms: false as unknown as true,
        },
    });

    const passwordValue = watch("password");

    const onSubmit = async (values: ArtisanRegisterFormValues) => {
        setServerError(null);
        try {
            // NOTE: backend's Phase 1 MVP RegisterRequest only accepts
            // { email, password, firstName, lastName, phoneNumber, role } — trade
            // and yearsExperience aren't sent yet; wire them into a "complete
            // artisan profile" call once that endpoint exists.
            const response = await authApi.register({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phone,
                password: values.password,
                confirmPassword: values.confirmPassword,
                role: UserRoleValue.Artisan,
            });

            if (!response.success) {
                setServerError(
                    response.message ?? response.errors?.[0] ?? "Couldn't create your account.",
                );
                return;
            }

            setSession(response.data, true);
            navigate("/artisan/dashboard");
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
            eyebrow="Join as an artisan"
            title="Start getting hired nearby"
            subtitle="Get verified, set your trade, and receive job requests in your area."
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

                <Select
                    label="Trade"
                    placeholder="Select your trade"
                    options={tradeOptions}
                    error={errors.trade?.message}
                    {...register("trade")}
                />

                <Input
                    label="Years of experience"
                    type="number"
                    min={0}
                    max={60}
                    error={errors.yearsExperience?.message}
                    {...register("yearsExperience", { valueAsNumber: true })}
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
                    Create artisan account
                </Button>

                <p className={styles.footerText}>
                    Already have an account?{" "}
                    <Link to="/login" className={styles.link}>
                        Log in
                    </Link>
                    . Looking to hire instead?{" "}
                    <Link to="/register/customer" className={styles.link}>
                        Register as a customer
                    </Link>
                    .
                </p>
            </form>
        </AuthLayout>
    );
}