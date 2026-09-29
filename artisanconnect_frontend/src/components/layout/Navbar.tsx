import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { Button } from "@/components/ui";
import styles from "./Navbar.module.css";

const navItems = [
    { label: "Find artisans", to: "/#categories" },
    { label: "How it works", to: "/#how-it-works" },
    { label: "Become an artisan", to: "/register/artisan" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const handleAnchorClick = (targetId: string) => (e: React.MouseEvent) => {
        if (location.pathname === "/") {
            e.preventDefault();
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
            setIsOpen(false);
        }
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.inner}`}>
                <Link to="/" className={styles.brand} aria-label="ArtisanConnect home">
                    <img src="/favicon.ico" alt="ArtisanConnect" className={styles.brandMark} />
                    <span className={styles.brandName}>
                        Artisan<span className={styles.brandAccent}>Connect</span>
                    </span>
                </Link>

                <nav className={styles.navDesktop} aria-label="Primary">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={item.to.startsWith("/#") ? handleAnchorClick(item.to.slice(2)) : undefined}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.actionsDesktop}>
                    <Link to="/login" className={styles.loginLink}>
                        Log in
                    </Link>
                    <Link to="/register/customer">
                        <Button size="sm">Get started</Button>
                    </Link>
                </div>

                <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={isOpen}
                    aria-controls="mobile-nav"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
            </div>

            {isOpen && (
                <nav id="mobile-nav" className={styles.navMobile} aria-label="Mobile">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={styles.navLinkMobile}
                            onClick={(e) => {
                                if (item.to.startsWith("/#")) {
                                    handleAnchorClick(item.to.slice(2))(e);
                                } else {
                                    setIsOpen(false);
                                }
                            }}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <div className={styles.mobileActions}>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" fullWidth>
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register/customer" onClick={() => setIsOpen(false)}>
                            <Button fullWidth>Get started</Button>
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}