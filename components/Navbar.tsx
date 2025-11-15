// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Investors", href: "/investors" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <Link href="/" className={styles.logo}>
          DOSE
        </Link>

        <ul className={styles.navLinks}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${
                  pathname === item.href ? styles.active : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}