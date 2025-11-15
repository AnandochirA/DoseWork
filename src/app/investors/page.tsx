"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Investors.module.css";

export default function InvestorsPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Floating particles background */}
      <div className={styles.particlesContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className={styles.particle} style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }} />
        ))}
      </div>

      {/* Morphing blobs */}
      <div className={styles.blobContainer}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      {/* Main Content */}
      <motion.main className={styles.main} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className={styles.container}>
          
          {/* Hero Section with curved shape */}
          <motion.section 
            className={styles.hero}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.heroShape}>
              <motion.h1 
                className={styles.heroTitle}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                Investment Opportunity
              </motion.h1>
              <motion.p 
                className={styles.heroSubtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                The world's first rejection sensitivity dysphoria (RSD) intervention platform,
                addressing a crisis affecting <strong>99% of 366M ADHD adults globally</strong>
              </motion.p>
              <motion.div 
                className={styles.highlightStatContainer}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <p className={styles.highlightStat}>Raising $500K on $4M cap SAFE</p>
              </motion.div>

              <motion.div 
                className={styles.ctaButtons}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="https://www.canva.com/design/DAGtXN6tgDg/0a7W52NBxbs8CHaeA58owg/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  <span>View Pitch Deck</span>
                </Link>
                <Link
                  href="https://www.canva.com/design/DAG1DHTF6C4/VP4bQZdzr1fV-hucZ2Eyaw/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.secondary}`}
                >
                  <span>Download One-Pager</span>
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* Key Metrics with hexagon shapes */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>Traction & Validation</h2>
            <div className={styles.metricsGrid}>
              {[
                { number: "366M", label: "ADHD Adults Globally" },
                { number: "99%", label: "Experience RSD With Zero Tools" },
                { number: "1,300+", label: "Clinical Coaching Sessions" },
                { number: "350+", label: "Active Users & Waitlist" },
                { number: "90%", label: "Invite-to-Use Conversion" },
                { number: "100%", label: "Retention After First Session" },
                { number: "$5.6B", label: "Mental Health App Market" },
                { number: "$0", label: "Raised – Bootstrapped" },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  className={styles.metricHexagon}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className={styles.hexagonInner}>
                    <div className={styles.metricNumber}>{metric.number}</div>
                    <div className={styles.metricLabel}>{metric.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Market Opportunity with organic shape */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>The Market Opportunity</h2>
            <div className={styles.opportunityBlob}>
              <div className={styles.glowEffect} />
              <h3 className={styles.opportunityTitle}>First-Mover in Untapped Crisis Category</h3>
              <p className={styles.opportunityText}>
                <strong>RSD</strong> devastates 99% of ADHD adults — yet <strong>zero tools exist</strong>.
              </p>
              <p className={styles.opportunityText}>
                Competitors build productivity apps. <strong>We build crisis intervention</strong> — tools that work when the brain is in dysregulation.
              </p>
              <p className={styles.opportunityText}>
                <strong>We're not a better to-do app. We're a new category:</strong> cognitive infrastructure for neurodivergent minds in crisis.
              </p>
            </div>
          </motion.section>

          {/* Why Now with circular cards */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>Why Now?</h2>
            <div className={styles.whyNowGrid}>
              {[
                { title: "ADHD Awareness Explosion", text: "Adult diagnoses up 30% in 5 years. Social media destigmatization." },
                { title: "Mental Health Funding Surge", text: "$5.6B invested in 2023. Digital therapeutics gaining traction." },
                { title: "Technology Maturity", text: "Cross-platform tools enable real-time crisis intervention." },
                { title: "Clinical Gap Recognition", text: "Therapy waitlists: 3–6 months. Urgent need for immediate tools." },
                { title: "Enterprise Opportunity", text: "Neurodiversity spending up 40% annually." },
                { title: "Competitive Validation", text: "Inflow & Numo prove market. Their limits = our opening." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={styles.whyNowCircle}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <div className={styles.circleRing} />
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Founder with curved container */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>Unique Founder-Market Fit</h2>
            <div className={styles.founderCurve}>
              <div className={styles.founderGlow} />
              <p className={styles.opportunityText}>
                <strong>Steev Hodgson</strong> combines:
              </p>
              <ul className={styles.founderList}>
                <li>1,300+ ADHD coaching sessions (95% retention)</li>
                <li>Self-taught dev: 4,000+ lines of production code</li>
                <li>20+ years enterprise sales ($3M deals)</li>
                <li>Lived ADHD experience (diagnosed at 48)</li>
              </ul>
              <p className={styles.opportunityText}>
                This <strong>clinical + technical + business</strong> trifecta is <strong>extremely rare</strong> and creates a <strong>defensible moat</strong>.
              </p>
            </div>
          </motion.section>

          {/* Use of Funds with organic layout */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>Use of Capital</h2>
            <div className={styles.fundsContainer}>
              <h3 className={styles.fundsTitle}>$500K Seed Allocation</h3>
              <div className={styles.fundsGrid}>
                {[
                  { percent: "40%", amount: "$200K", label: "Product: iOS/Android, HIPAA, AI RSD Analytics", color: "#2FAC88" },
                  { percent: "30%", amount: "$150K", label: "Growth: ADHD Communities, Influencers, Coaches", color: "#317D66" },
                  { percent: "20%", amount: "$100K", label: "Team: Tech Co-founder, Marketing, Success", color: "#B4AD9A" },
                  { percent: "10%", amount: "$50K", label: "Ops: Legal, Compliance, Studies", color: "#313B38" },
                ].map((fund, i) => (
                  <motion.div 
                    key={i} 
                    className={styles.fundCircle}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.1, y: -10 }}
                    style={{ '--fund-color': fund.color } as React.CSSProperties}
                  >
                    <div className={styles.fundPercent}>{fund.percent}</div>
                    <div className={styles.fundAmount}>{fund.amount}</div>
                    <div className={styles.fundLabel}>{fund.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Milestones with diamond shapes */}
          <motion.section 
            className={styles.section}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.sectionTitle}>18-Month Milestones</h2>
            <div className={styles.milestonesGrid}>
              {[
                { number: "10K", label: "Active Users (B2C + Enterprise)" },
                { number: "$500K", label: "Annual Recurring Revenue" },
                { number: "25", label: "Enterprise Wellness Customers" },
                { number: "Series A", label: "Readiness with Unit Economics" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  className={styles.diamondCard}
                  initial={{ scale: 0, rotate: 45 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <div className={styles.diamondInner}>
                    <div className={styles.metricNumber}>{m.number}</div>
                    <div className={styles.metricLabel}>{m.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Final CTA with curved shape */}
          <motion.section 
            className={styles.finalCta}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.ctaShape}>
              <h2 className={styles.ctaTitle}>Let's Talk</h2>
              <p className={styles.ctaSubtitle}>
                Interested? Review materials and reach out.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/contact" className={styles.ctaButton}>
                  <span>Contact Us</span>
                </Link>
                <a
                  href="mailto:steev@damnhealthydose.com"
                  className={`${styles.ctaButton} ${styles.secondary}`}
                >
                  <span>steev@damnhealthydose.com</span>
                </a>
              </div>
              <p className={styles.disclaimer}>
                Currently in conversations with strategic partners.
              </p>
            </div>
          </motion.section>
        </div>
      </motion.main>
    </>
  );
}
