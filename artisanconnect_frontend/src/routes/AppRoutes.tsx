import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { CustomerRegisterPage } from "@/pages/auth/CustomerRegisterPage";
import { ArtisanRegisterPage } from "@/pages/auth/ArtisanRegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { FindArtisansPage } from "@/pages/FindArtisansPage";
import { ArtisanPublicProfilePage } from "@/pages/ArtisanPublicProfilePage";
import { CustomerDashboardPage } from "@/pages/customer/CustomerDashboardPage";
import { CustomerJobsPage } from "@/pages/customer/CustomerJobsPage";
import { CustomerProfilePage } from "@/pages/customer/CustomerProfilePage";
import { ArtisanDashboardPage } from "@/pages/artisan/ArtisanDashboardPage";
import { ArtisanJobsPage } from "@/pages/artisan/ArtisanJobsPage";
import { ArtisanBidsPage } from "@/pages/artisan/ArtisanBidsPage";
import { ArtisanProfilePage } from "@/pages/artisan/ArtisanProfilePage";
import { PostJobPage } from "@/pages/jobs/PostJobPage";
import { JobDetailsPage } from "@/pages/jobs/JobDetailsPage";
import { ChatPage } from "@/pages/chat/ChatPage";

const router = createBrowserRouter([
    // Public marketing site
    {
        element: <MainLayout />,
        children: [{ path: "/", element: <LandingPage /> }],
    },

    // Auth pages render full-bleed (no Navbar/Footer shell)
    { path: "/login", element: <LoginPage /> },
    { path: "/register/customer", element: <CustomerRegisterPage /> },
    { path: "/register/artisan", element: <ArtisanRegisterPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },

    // Authenticated app (any role) — dashboard template shell
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: "/find-artisans", element: <FindArtisansPage /> },
                    { path: "/artisans/:id", element: <ArtisanPublicProfilePage /> },
                    { path: "/jobs/:id", element: <JobDetailsPage /> },
                    { path: "/messages", element: <ChatPage /> },

                    // Customer-only routes
                    {
                        element: <ProtectedRoute allowedRoles={["Customer"]} />,
                        children: [
                            { path: "/customer/dashboard", element: <CustomerDashboardPage /> },
                            { path: "/customer/jobs", element: <CustomerJobsPage /> },
                            { path: "/customer/profile", element: <CustomerProfilePage /> },
                            { path: "/jobs/post", element: <PostJobPage /> },
                        ],
                    },

                    // Artisan-only routes
                    {
                        element: <ProtectedRoute allowedRoles={["Artisan"]} />,
                        children: [
                            { path: "/artisan/dashboard", element: <ArtisanDashboardPage /> },
                            { path: "/artisan/jobs", element: <ArtisanJobsPage /> },
                            { path: "/artisan/bids", element: <ArtisanBidsPage /> },
                            { path: "/artisan/profile", element: <ArtisanProfilePage /> },
                        ],
                    },
                ],
            },
        ],
    },
]);

export function AppRoutes() {
    return <RouterProvider router={router} />;
}