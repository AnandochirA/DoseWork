'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingGuideProps {
  pattern?: [number, number, number]; // [inhale, hold, exhale] in seconds
  cycles?: number;
  onComplete?: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function BreathingGuide({
  pattern = [4, 7, 8],
  cycles = 3,
  onComplete,
}: BreathingGuideProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('rest');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [inhaleTime, holdTime, exhaleTime] = pattern;

  useEffect(() => {
    if (!isStarted || isCompleted) return;

    let timer: NodeJS.Timeout;

    const runPhase = (phase: BreathingPhase, duration: number, nextPhase: () => void) => {
      setCurrentPhase(phase);
      setCountdown(duration);

      let remaining = duration;
      timer = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          nextPhase();
        }
      }, 1000);
    };

    const startCycle = () => {
      // Inhale
      runPhase('inhale', inhaleTime, () => {
        // Hold
        runPhase('hold', holdTime, () => {
          // Exhale
          runPhase('exhale', exhaleTime, () => {
            // Check if more cycles
            const nextCycle = currentCycle + 1;
            if (nextCycle >= cycles) {
              setIsCompleted(true);
              setCurrentPhase('rest');
              if (onComplete) {
                onComplete();
              }
            } else {
              setCurrentCycle(nextCycle);
            }
          });
        });
      });
    };

    startCycle();

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isStarted, currentCycle, cycles, inhaleTime, holdTime, exhaleTime, onComplete, isCompleted]);

  const getPhaseInstruction = (): string => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Get Ready';
    }
  };

  const getCircleScale = (): number => {
    switch (currentPhase) {
      case 'inhale':
        return 1.3;
      case 'hold':
        return 1.3;
      case 'exhale':
        return 1;
      default:
        return 1;
    }
  };

  const getCircleColor = (): string => {
    switch (currentPhase) {
      case 'inhale':
        return 'bg-blue-400';
      case 'hold':
        return 'bg-purple-400';
      case 'exhale':
        return 'bg-green-400';
      default:
        return 'bg-gray-300';
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setCurrentCycle(0);
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Breathing Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          animate={{
            scale: getCircleScale(),
            transition: {
              duration:
                currentPhase === 'inhale'
                  ? inhaleTime
                  : currentPhase === 'exhale'
                  ? exhaleTime
                  : 0.3,
              ease: 'easeInOut',
            },
          }}
          className={`w-48 h-48 rounded-full ${getCircleColor()} opacity-60 shadow-lg`}
        />

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className="text-2xl font-semibold text-gray-800">
                {getPhaseInstruction()}
              </p>
              {isStarted && !isCompleted && (
                <p className="text-4xl font-bold text-gray-900 mt-2">{countdown}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cycle Progress */}
      {isStarted && !isCompleted && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cycle {currentCycle + 1} of {cycles}
          </p>
          <div className="flex gap-2 justify-center mt-2">
            {Array.from({ length: cycles }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < currentCycle
                    ? 'bg-green-500'
                    : i === currentCycle
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isStarted && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            4-7-8 Breathing Pattern
            <br />
            <span className="text-sm">
              Inhale for 4s, Hold for 7s, Exhale for 8s
            </span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-colors"
          >
            Start Breathing Exercise
          </motion.button>
        </div>
      )}

      {/* Completion */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-green-600 font-semibold text-lg">
            Excellent! You&apos;ve completed {cycles} breathing cycles.
          </p>
          <p className="text-gray-600 mt-2">
            Take a moment to notice how you feel.
          </p>
        </motion.div>
      )}
    </div>
  );
}
