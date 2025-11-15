"use client";

import { motion, useInView, Variants, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect, MouseEvent } from "react";
import styles from "./pricing.module.css";

export default function PricingPage() {
  const pricingRef = useRef(null);
  const inView = useInView(pricingRef, { once: true, amount: 0.3 });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.42, 0, 0.58, 1],
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <>
      <div className={styles.particlesContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.blobContainer}>
            <div className={styles.blob} style={{ left: '10%', top: '20%' }} />
            <div className={styles.blob} style={{ right: '15%', top: '40%' }} />
            <div className={styles.blob} style={{ left: '20%', bottom: '30%' }} />
          </div>

          <motion.section
            ref={pricingRef}
            className={styles.pricingSection}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div className={styles.titleWrapper} variants={childVariants}>
              <svg className={styles.titleSvg} viewBox="0 0 800 120">
                <defs>
                  <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#B4AD9A" />
                    <stop offset="50%" stopColor="#2FAC88" />
                    <stop offset="100%" stopColor="#E8E4DA" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <text
                  x="50%"
                  y="70%"
                  textAnchor="middle"
                  className={styles.svgTitle}
                  fill="url(#titleGradient)"
                  filter="url(#glow)"
                >
                  Choose Your Plan
                </text>
              </svg>
              <div className={styles.titleUnderline} />
            </motion.div>

            <motion.p className={styles.subtitle} variants={childVariants}>
              Unlock your cognitive potential with DOSE
            </motion.p>

            <motion.div className={styles.pricingGrid} variants={containerVariants}>
              {/* ───── DOSE Essentials ───── */}
              <PricingCard3D
                title="DOSE Essentials"
                price="Free"
                badge={null}
                features={[
                  "1 SPARK session/week",
                  "3 WAVE resets/day",
                  "5 POPCORN ideas/month",
                  "2 RSD episodes/month",
                ]}
                featured={false}
                variants={childVariants}
                inView={inView}
              />

              {/* ───── DOSE OS Pro (Featured) ───── */}
              <PricingCard3D
                title="DOSE OS Pro"
                price="Coming Soon"
                badge="Most Popular"
                features={[
                  "Unlimited everything",
                  "Session analytics & insights",
                  "Progress tracking & exports",
                  "RSD pattern recognition",
                  "Priority support",
                ]}
                featured={true}
                variants={childVariants}
                inView={inView}
              />
            </motion.div>

            <motion.a
              href="https://getdose.kit.com/e84f961e02"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButton}
              variants={childVariants}
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.ctaText}>Join the Waitlist</span>
              <div className={styles.ctaShimmer} />
            </motion.a>
          </motion.section>
        </div>
      </main>
    </>
  );
}

function PricingCard3D({
  title,
  price,
  badge,
  features,
  featured,
  variants,
  inView,
}: {
  title: string;
  price: string;
  badge: string | null;
  features: string[];
  featured: boolean;
  variants: Variants;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.pricingCard} ${featured ? styles.featured : ''}`}
      variants={variants}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 50 }}
    >
      <div className={styles.lightBeam} />
      
      <div className={styles.cardShimmer} />
      
      <div className={styles.floatingRing} />
      
      {badge && <div className={styles.featuredBadge}>{badge}</div>}
      
      <h3 className={styles.cardTitle}>{title}</h3>
      
      <div className={styles.priceWrapper}>
        <div className={styles.price}>{price}</div>
        {featured && <div className={styles.priceGlow} />}
      </div>
      
      <ul className={styles.priceList}>
        {features.map((item, i) => (
          <motion.li
            key={item}
            variants={variants}
            custom={i}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={styles.featureItem}
          >
            <span className={styles.checkIcon}>✓</span>
            {item}
          </motion.li>
        ))}
      </ul>
      
      <div className={styles.cornerAccent} style={{ top: 0, left: 0 }} />
      <div className={styles.cornerAccent} style={{ top: 0, right: 0 }} />
      <div className={styles.cornerAccent} style={{ bottom: 0, left: 0 }} />
      <div className={styles.cornerAccent} style={{ bottom: 0, right: 0 }} />
    </motion.div>
  );
}
