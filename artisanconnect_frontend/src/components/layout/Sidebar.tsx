import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiSearch,
  FiBriefcase,
  FiPlusCircle,
  FiHeart,
  FiUser,
  FiLogOut,
  FiList,
} from "react-icons/fi";
import { useAuth } from "@/store/AuthContext";
import styles from "./Sidebar.module.css";

const customerNav = [
  { label: "Dashboard", to: "/customer/dashboard", icon: FiGrid },
  { label: "Find artisans", to: "/find-artisans", icon: FiSearch },
  { label: "My jobs", to: "/customer/jobs", icon: FiBriefcase },
  { label: "Post a job", to: "/jobs/post", icon: FiPlusCircle },
  { label: "Saved artisans", to: "/customer/profile?tab=saved", icon: FiHeart },
  { label: "Profile & settings", to: "/customer/profile", icon: FiUser },
];

const artisanNav = [
  { label: "Dashboard", to: "/artisan/dashboard", icon: FiGrid },
  { label: "Find jobs", to: "/artisan/jobs", icon: FiList },
  { label: "My bids", to: "/artisan/bids", icon: FiBriefcase },
  { label: "Profile & settings", to: "/artisan/profile", icon: FiUser },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navItems = user?.role === "Artisan" ? artisanNav : customerNav;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
      <img src="/favicon.ico" alt="ArtisanConnect" className={styles.brandMark} />
        <span className={styles.brandName}>
          Artisan<span className={styles.brandAccent}>Connect</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Dashboard">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            <item.icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userRow}>
          <span className={styles.avatar} aria-hidden="true">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </span>
            <span className={styles.userRole}>{user?.role ?? ""}</span>
          </div>
        </div>
        <button type="button" className={styles.logoutButton} onClick={logout}>
          <FiLogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
