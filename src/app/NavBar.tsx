"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            DOSE
          </Link>
        </div>
        <ul className={styles.navLinks}>
          <li>
            <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className={`${styles.navLink} ${pathname === "/about" ? styles.active : ""}`}>
              About
            </Link>
          </li>
          <li>
            <Link href="/pricing" className={`${styles.navLink} ${pathname === "/pricing" ? styles.active : ""}`}>
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/investors" className={`${styles.navLink} ${pathname === "/investors" ? styles.active : ""}`}>
              Investors
            </Link>
          </li>
          <li>
            <Link href="/contact" className={`${styles.navLink} ${pathname === "/contact" ? styles.active : ""}`}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}