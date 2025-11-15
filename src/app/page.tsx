"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./Home.module.css";

const WorldGlobe = dynamic(() => import("../../components/worldGlobe"), {
  ssr: false,
});

export default function HomePage() {
  const heroRef = useRef(null);
  const globeRef = useRef(null);
  const toolsRef = useRef(null);
  const statsRef = useRef(null);
  const coachingRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const globeInView = useInView(globeRef, { once: true, amount: 0.3 });
  const toolsInView = useInView(toolsRef, { once: true, amount: 0.3 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const coachingInView = useInView(coachingRef, { once: true, amount: 0.3 });

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
      <main className={styles.main}>
        {/* HERO */}
        <motion.section
          ref={heroRef}
          className={styles.titleSection}
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className={styles.svgHeaderContainer}>
            <svg 
              viewBox="0 0 800 400" 
              className={styles.svgHeader}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="textGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#317D66">
                    <animate attributeName="stop-color" values="#317D66; #2FAC88; #317D66" dur="6s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#2FAC88">
                    <animate attributeName="stop-color" values="#2FAC88; #35C49A; #2FAC88" dur="6s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#35C49A">
                    <animate attributeName="stop-color" values="#35C49A; #2FAC88; #35C49A" dur="6s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <linearGradient id="textGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2A322F" />
                  <stop offset="50%" stopColor="#313B38" />
                  <stop offset="100%" stopColor="#2A322F" />
                </linearGradient>

                <linearGradient id="worldwideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2FAC88">
                    <animate attributeName="stop-color" values="#2FAC88; #35C49A; #2FAC88" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#317D66">
                    <animate attributeName="stop-color" values="#317D66; #2FAC88; #317D66" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#2FAC88">
                    <animate attributeName="stop-color" values="#2FAC88; #35C49A; #2FAC88" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <filter id="shadow">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" floodColor="#2FAC88"/>
                </filter>
              </defs>

              <motion.text
                x="50%"
                y="80"
                fontSize="56"
                fontWeight="800"
                fill="url(#textGradient2)"
                textAnchor="middle"
                filter="url(#shadow)"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Helping People
              </motion.text>

              <g>
                <motion.text
                  x="50%"
                  y="160"
                  fontSize="68"
                  fontWeight="900"
                  fill="url(#textGradient1)"
                  textAnchor="middle"
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  with ADHD
                </motion.text>
                
                <motion.path
                  d="M 200 180 Q 400 170 600 180"
                  stroke="url(#textGradient1)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                />
              </g>

              <g>
                <motion.text
                  x="50%"
                  y="280"
                  fontSize="90"
                  fontWeight="900"
                  fill="none"
                  stroke="url(#worldwideGradient)"
                  strokeWidth="3"
                  textAnchor="middle"
                  filter="url(#glow)"
                  initial={{ opacity: 0, strokeDasharray: 1000, strokeDashoffset: 1000 }}
                  animate={{ opacity: 1, strokeDashoffset: 0 }}
                  transition={{ duration: 2, delay: 0.6 }}
                >
                  Worldwide
                </motion.text>
                
                <motion.text
                  x="50%"
                  y="280"
                  fontSize="90"
                  fontWeight="900"
                  fill="url(#worldwideGradient)"
                  textAnchor="middle"
                  filter="url(#glow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                >
                  Worldwide
                </motion.text>

                <motion.circle
                  cx="120"
                  cy="250"
                  r="8"
                  fill="#2FAC88"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                </motion.circle>
                
                <motion.circle
                  cx="680"
                  cy="260"
                  r="6"
                  fill="#317D66"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.6, delay: 2 }}
                >
                  <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
                </motion.circle>
              </g>

              <motion.path
                d="M 50 100 Q 80 80 110 100"
                stroke="#2FAC88"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
              />
              
              <motion.path
                d="M 690 120 Q 720 100 750 120"
                stroke="#317D66"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
              />
            </svg>
          </div>
        </motion.section>

        <motion.section
          ref={globeRef}
          className={styles.globeSection}
          initial={{ opacity: 0 }}
          animate={globeInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className={styles.globeRow}>
            <motion.div
              className={styles.doseContent}
              variants={containerVariants}
              initial="hidden"
              animate={globeInView ? "visible" : "hidden"}
            >
              <motion.h2 className={styles.doseTitle} variants={childVariants}>
                <span className={styles.brandName}>DOSE:</span> The Cognitive OS for{" "}
                <span className={styles.highlightText}>Neurodivergent Minds</span>
              </motion.h2>
              
              <motion.p className={styles.doseDescription} variants={childVariants}>
                <span className={styles.descriptionIcon}>✨</span>
                Our platform supports{" "}
                <strong className={styles.emphasisText}>emotional regulation</strong>,{" "}
                <strong className={styles.emphasisText}>crisis management</strong>, and{" "}
                <strong className={styles.emphasisText}>creative thinking</strong> for ADHD—wherever you are on the globe.
              </motion.p>

              <motion.div className={styles.ctaRow} variants={childVariants}>
                <a
                  href="https://dose41.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  <span className={styles.buttonIcon}>💻</span>
                  <span className={styles.buttonText}>
                    <span className={styles.buttonLabel}>Try DOSE for</span>
                    <span className={styles.buttonPlatform}>Desktop</span>
                  </span>
                  <span className={styles.buttonArrow}>→</span>
                </a>
                <a
                  href="https://dosedemo.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.mobileButton}`}
                >
                  <span className={styles.buttonIcon}>📱</span>
                  <span className={styles.buttonText}>
                    <span className={styles.buttonLabel}>Try DOSE for</span>
                    <span className={styles.buttonPlatform}>Mobile</span>
                  </span>
                  <span className={styles.buttonArrow}>→</span>
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div
              className={styles.globeWrapper}
              initial={{ x: 100, opacity: 0 }}
              animate={globeInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <WorldGlobe size={700} radius={180} />
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          ref={toolsRef}
          className={styles.differenceSection}
          variants={containerVariants}
          initial="hidden"
          animate={toolsInView ? "visible" : "hidden"}
        >
          <motion.h2 className={styles.differenceTitle} variants={childVariants}>
            What Makes DOSE Different?
          </motion.h2>

          <div className={styles.differenceGrid}>
            {[
              {
                href: "https://dose41.netlify.app/spark",
                class: styles.sparkCard,
                icon: "🧠",
                title: "SPARK",
                desc: "Deep cognitive restructuring for complex challenges",
                time: "15 min",
                detail: "Tackle big problems with guided focus.",
              },
              {
                href: "https://dose41.netlify.app/wave",
                class: styles.waveCard,
                icon: "🌊",
                title: "WAVE",
                desc: "Quick emotional reset for crisis moments",
                time: "2-3 min",
                detail: "Calm the storm in just minutes.",
              },
              {
                href: "https://dose41.netlify.app/popcorn",
                class: styles.popcornCard,
                icon: "🍿",
                title: "POPCORN",
                desc: "Capture and organize creative ideas",
                time: "1-3 min",
                detail: "Turn bursts of inspiration into action.",
              },
              {
                href: "https://dose41.netlify.app/rsd",
                class: styles.rsdCard,
                icon: "💜",
                title: "RSD METER",
                desc: "World's first rejection sensitivity intervention",
                time: "",
                detail: "Navigate rejection with confidence.",
              },
            ].map((tool) => (
              <motion.a
                key={tool.title}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.differenceCard} ${tool.class}`}
                variants={childVariants}
              >
                <div className={styles.differenceIcon}>{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                {tool.time && <div className={styles.differenceTime}>{tool.time}</div>}
                <p className={styles.differenceDetail}>{tool.detail}</p>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* WHAT MAKES DOSE DIFFERENT? */}
        {/* <rest of code here> */}

        {/* OUR IMPACT */}
        <motion.section
          ref={statsRef}
          className={styles.statsSection}
          variants={containerVariants}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
          <motion.h2 variants={childVariants}>Our Impact</motion.h2>
          <motion.div className={styles.stats} variants={containerVariants}>
            {[
              { number: "366M+", label: "ADHD Adults Worldwide" },
              { number: "99%", label: "Experience RSD" },
              { number: "4", label: "Evidence-Based Tools" },
              { number: "#1", label: "RSD Intervention Platform" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={styles.stat}
                variants={childVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 24px rgba(44, 172, 136, 0.3)",
                  transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                }}
              >
                <motion.span
                  className={styles.statNumber}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    statsInView
                      ? {
                          opacity: 1,
                          scale: 1,
                          transition: { delay: index * 0.2, duration: 0.8, ease: "easeOut" },
                        }
                      : {}
                  }
                >
                  {stat.number}
                </motion.span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div className={styles.statsNote} variants={childVariants}>
            <span>Source: World Health Organization, 2025</span>
          </motion.div>
        </motion.section>

        {/* COACHING CTA */}
        <motion.section
          ref={coachingRef}
          className={styles.coachingCta}
          variants={containerVariants}
          initial="hidden"
          animate={coachingInView ? "visible" : "hidden"}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{
              y: [0, -10, 0],
              transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            }}
          >
            <Image
              src="/coaching-logo.png"
              alt="DamnHealthyDose Coaching"
              width={160}
              height={50}
            />
          </motion.div>
          <motion.h3 variants={childVariants}>
            Looking for 1:1 ADHD Coaching?
          </motion.h3>
          <motion.p variants={childVariants}>
            Get personalized support alongside our cognitive toolkit
          </motion.p>
          <motion.a
            href="https://www.damnhealthydose.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.coachingButton}
            variants={childVariants}
          >
            Explore Coaching
          </motion.a>
        </motion.section>
      </main>
    </>
  );
}
