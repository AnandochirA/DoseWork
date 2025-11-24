// app/contact/page.tsx
"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import styles from "./contact.module.css";
import { useState } from "react";

export default function ContactPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>DOSE</div>
          <ul className={styles.navLinks}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/investors">Investors</Link></li>
            <li><Link href="/contact" className={styles.active}>Contact</Link></li>
          </ul>
        </div>
      </nav>

      <motion.main className={styles.main} variants={containerVariants} initial="hidden" animate="visible">
        
        {/* Background effects */}
        <div className={styles.backgroundShapes}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
          <div className={styles.gridPattern}></div>
        </div>

        <div className={styles.container}>
          
          {/* Hero Split Section */}
          <div className={styles.heroSplit}>
            
            {/* Left Column - Text Content */}
            <motion.div className={styles.heroLeft} variants={itemVariants}>
              <div className={styles.badge}>
                <span className={styles.badgeDot}></span>
                Available for Consultation
              </div>
              <h1 className={styles.mainTitle}>
                <span className={styles.titleWord1}>Let's</span>
                <span className={styles.titleWord2}>Connect</span>
              </h1>
              <p className={styles.heroDescription}>
                Whether you're seeking ADHD coaching, exploring DOSE, or interested in partnership opportunities—I'm here to help you thrive.
              </p>
              
              {/* Quick contact info */}
              <div className={styles.quickInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Email</div>
                    <a href="mailto:steev@damnhealthydose.com" className={styles.infoLink}>
                      steev@damnhealthydose.com
                    </a>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.infoLabel}>Response Time</div>
                    <div className={styles.infoValue}>24-48 hours</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Profile Card */}
            <motion.div className={styles.heroRight} variants={itemVariants}>
              <div className={styles.profileCard}>
                <div className={styles.profileCardGlow}></div>
                <div className={styles.profileImageWrapper}>
                  <img
                    src="steve-photo.jpg"
                    alt="Steev Hodgson"
                    className={styles.profileImage}
                  />
                  <div className={styles.profileRing}></div>
                </div>
                <h2 className={styles.profileName}>Steev Hodgson</h2>
                <p className={styles.profileTitle}>ADHD Coach & DOSE Founder</p>
                <div className={styles.profileDivider}></div>
                <p className={styles.profileBio}>
                  Certified ADHD coach dedicated to helping neurodivergent minds thrive through innovative tools and personalized support.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action Cards */}
          <motion.div className={styles.actionCards} variants={itemVariants}>
            
            <motion.a
              href="https://dosedemo.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionCard}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.cardShape}></div>
              <div className={styles.cardIconLarge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Try DOSE Platform</h3>
              <p className={styles.cardDesc}>Experience our cognitive OS for ADHD minds</p>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </motion.a>

            <motion.a
              href="https://www.damnhealthydose.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionCard} ${styles.coachingCard}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.cardShape}></div>
              <div className={styles.cardIconLarge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>ADHD Coaching</h3>
              <p className={styles.cardDesc}>Personalized support for your journey</p>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </motion.a>

            <motion.a
              href="https://www.canva.com/design/DAG1DHTF6C4/VP4bQZdzr1fV-hucZ2Eyaw/view"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionCard} ${styles.investorCard}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.cardShape}></div>
              <div className={styles.cardIconLarge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Investor Resources</h3>
              <p className={styles.cardDesc}>View our one-pager and opportunities</p>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </motion.a>
          </motion.div>

          {/* Logo Footer */}
          <motion.div className={styles.logoFooter} variants={itemVariants}>
            <div className={styles.logoWrapper}>
              <img
                src="/coaching-logo.png"
                alt="DOSE Logo"
                className={styles.footerLogo}
              />
              <div className={styles.logoGlowEffect}></div>
            </div>
          </motion.div>

        </div>
      </motion.main>
    </>
  );
}
