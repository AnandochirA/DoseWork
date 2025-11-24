// app/about/page.tsx
"use client";

import { motion, Variants, Easing } from "framer-motion";
import Link from "next/link";
import styles from "./about.module.css";

export default function AboutPage() {
  /* ────────────────────── Nav animation ────────────────────── */
  const navVariants: Variants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  /* ────────────────────── Page container ────────────────────── */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" as Easing, type: "spring", stiffness: 100 },
    },
  };

  const heroImageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" as Easing, type: "spring", stiffness: 80 },
    },
  };

  const mediaItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as Easing },
    },
  };

  return (
    <>
      {/* ────────────────────── Page content ────────────────────── */}
      <motion.main
        className={styles.main}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section className={styles.container}>
          {/* Hero Section */}
          <motion.section className={styles.heroSection} variants={childVariants}>
            <motion.img
              src="steve-photo.jpg"
              alt="Steev Hodgson - ADHD Coach and DOSE Founder"
              className={styles.profileImage}
              variants={heroImageVariants}
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <motion.h1 className={styles.heroTitle} variants={childVariants}>
              Steev Hodgson
            </motion.h1>
            <motion.p className={styles.heroSubtitle} variants={childVariants}>
              Certified ADHD Coach & Founder of DOSE<br />
              Building the cognitive infrastructure for neurodivergent success
            </motion.p>
          </motion.section>

          {/* Career Background */}
          <motion.section className={styles.storySection} variants={childVariants}>
            <motion.h2 className={styles.sectionTitle} variants={childVariants}>
              From Sales Professional to ADHD Advocate
            </motion.h2>
            <motion.div className={styles.storyContent} variants={childVariants}>
              <p>
                For over 20 years, I built a successful career in tech sales, closing
                million-dollar deals with clients and navigating complex B2B relationships.
                But something was always challenging about the way my brain worked. I could
                never reach my full potential and often faced burnout.
              </p>
              <p>
                In 2020, at age 48, I received my ADHD diagnosis. Like many adults, this
                revelation brought both relief and guilt, but suddenly, decades of
                struggles with focus, emotional regulation, and rejection sensitivity had a
                name and explanation.
              </p>
            </motion.div>
          </motion.section>

          {/* ADHD Journey */}
          <motion.section className={styles.storySection} variants={childVariants}>
            <motion.h2 className={styles.sectionTitle} variants={childVariants}>
              The ADHD Awakening
            </motion.h2>
            <motion.div className={styles.storyContent} variants={childVariants}>
              <p>
                My diagnosis led me to Dr. Ned Hallowell's book "ADHD 2.0," which opened my
                eyes to concepts like executive functioning and emotional regulation. I
                realized that medication alone wouldn't solve all my challenges. I needed
                systematic approaches to work with my ADHD brain, not against it.
              </p>
              <p>
                This personal journey sparked a professional transformation. I became
                certified through two leading ADHD coach training programs: IACT
                (International ADHD Coach Training Center) and Kristen Carder's FOCUSED
                Coaching. In 2023, I joined the International Coach Federation (ICF) as a
                member Coach.
              </p>
            </motion.div>
          </motion.section>

          {/* Coaching Achievements */}
          <motion.section className={styles.achievements} variants={childVariants}>
            {[
              { number: "1,300+", label: "ADHD Coaching Sessions Completed" },
              { number: "90+%", label: "Client Retention Rate" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={styles.achievementCard}
                variants={childVariants}
                whileHover={{
                  scale: 1.1,
                  rotate: 3,
                  boxShadow: "0 15px 50px rgba(47, 172, 136, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.achievementNumber}>{item.number}</div>
                <div className={styles.achievementLabel}>{item.label}</div>
              </motion.div>
            ))}
          </motion.section>

          {/* Media & Speaking */}
          <motion.section className={styles.mediaMentions} variants={childVariants}>
            <motion.h3 className={styles.mediaTitle} variants={childVariants}>
              Media Appearances & Speaking Engagements
            </motion.h3>
            <div className={styles.mediaList}>
              {[
                {
                  title: "Attention Different Podcast",
                  link: "https://youtu.be/-EUiJUm-SuA?si=YP1wzwYQj3cOQOi_",
                  text: "Click here to watch →",
                },
                {
                  title: "I Have ADHD Podcast (December 2024)",
                  link: "https://www.youtube.com/watch?v=c92Exozd0gY&t=1s",
                  text: "Click here to watch →",
                },
                {
                  title: "Rush Hour Podcast with Dave Neal",
                  link: "https://youtu.be/O4Sy7JCYkXw?si=e7my1YE-4b5gDyoq",
                  text: "Click here to watch →",
                },
                {
                  title: "I Have ADHD Podcast (August 2023)",
                  link: "https://ihaveadhd.com/chatting-with-kristens-focused-adhd-certified-coaches/",
                  text: "Click here to listen →",
                },
                {
                  title: "A Better Pill to Swallow with David Niemann",
                  link: "https://open.spotify.com/episode/6hIKMeSFJlt3I2mzA6frZf?si=349a614579c34322",
                  text: "Click here to listen →",
                },
                {
                  title: "The Coaching Edge Podcast",
                  link: "https://youtu.be/FyhVN08yP-0?si=_YWNz6yzf1m3QesQ",
                  text: "Click here to listen →",
                },
                {
                  title: "UC Berkeley NOW Conference Coach (2024 & 2025)",
                  link: "https://hr.berkeley.edu/people/steev-hodgson",
                  text: "View profile →",
                },
                {
                  title: "2024 International ADHD Conference Exhibitor",
                  link: "https://digitaleditions.sheridan.com/publication/?i=834853&p=64&view=issueViewer",
                  text: "View profile →",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  className={styles.mediaItem}
                  variants={mediaItemVariants}
                >
                  {item.title}
                  <br />
                  <Link href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.text}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Video Embed */}
          <motion.div className={styles.videoContainer} variants={childVariants}>
            <iframe
              src="https://thecoachingedgepodcast.com/embed/interview/3363?type=video"
              allowFullScreen
            ></iframe>
          </motion.div>

          {/* Creating DOSE */}
          <motion.section className={styles.storySection} variants={childVariants}>
            <motion.h2 className={styles.sectionTitle} variants={childVariants}>
              Building DOSE: The Missing Infrastructure
            </motion.h2>
            <motion.div className={styles.storyContent} variants={childVariants}>
              <p>
                Through 1,300+ coaching sessions, I discovered a critical gap: 99% of
                ADHD adults experience rejection sensitivity dysphoria, yet zero tools
                existed to address it. Existing productivity apps weren't designed for
                ADHD brains in crisis, as they assumed you could think clearly when you
                needed help most.
              </p>
              <p>
                I taught myself to code and spent 8 months designing an application that I
                could use for my Daily Organization, Strategy, and Execution. Welcome
                DOSE, the world's first cognitive operating system for the ADHD brain.
                DOSE features four evidence-based tools, including the pioneering RSD
                Meter for rejection sensitivity intervention.
              </p>
              <p>
                DOSE isn't just another app. It's the command center that ADHD minds have
                been searching for. Just like your iPhone has iOS and your laptop has an
                operating system, your ADHD brain deserves tools designed specifically for
                how it works.
              </p>
            </motion.div>
          </motion.section>

          {/* CTA Section */}
          <motion.section className={styles.ctaSection} variants={childVariants}>
            <motion.img
              src="coaching-logo.png"
              alt="DamnHealthyDose Coaching Logo"
              className={styles.ctaLogo}
              variants={childVariants}
              whileHover={{ scale: 1.1 }}
            />
            <motion.div className={styles.ctaButtons} variants={childVariants}>
              <Link href="/" className={styles.ctaButton}>
                Try DOSE
              </Link>
              <Link
                href="https://www.damnhealthydose.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaButton}
              >
                ADHD Coaching
              </Link>
              <Link
                href="https://www.canva.com/design/DAGtXN6tgDg/0a7W52NBxbs8CHaeA58owg/view"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaButton}
              >
                View Pitch Deck
              </Link>
            </motion.div>
          </motion.section>
        </motion.section>
      </motion.main>
    </>
  );
}
