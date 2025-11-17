'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const startSession = () => {
    router.push('/session/spark');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Avatar Coach
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your interactive companion for navigating ADHD challenges with the SPARK methodology
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            SPARK: Intentional Thinking
          </h2>
          <p className="text-gray-600 mb-6">
            10-15 minutes • When life feels overwhelming
          </p>

          <div className="grid grid-cols-1 gap-3 text-left mb-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-spark-situation text-white flex items-center justify-center font-bold">S</span>
              <span className="text-gray-700">Situation - Describe what&apos;s happening</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-spark-perception text-white flex items-center justify-center font-bold">P</span>
              <span className="text-gray-700">Perception - Reframe your thoughts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-spark-affect text-white flex items-center justify-center font-bold">A</span>
              <span className="text-gray-700">Affect - Acknowledge your emotions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-spark-response text-white flex items-center justify-center font-bold">R</span>
              <span className="text-gray-700">Response - Take action</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-spark-keyresult text-white flex items-center justify-center font-bold">K</span>
              <span className="text-gray-700">Key Result - Reflect on insights</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSession}
            className="w-full bg-primary-600 text-white py-4 px-8 rounded-xl text-lg font-semibold shadow-lg hover:bg-primary-700 transition-colors"
          >
            Start SPARK Session
          </motion.button>
        </div>

        <p className="text-sm text-gray-500">
          Let&apos;s work through it together, one step at a time
        </p>
      </motion.div>
    </div>
  );
}
