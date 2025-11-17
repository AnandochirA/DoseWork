'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
}

export default function Timer({
  duration,
  onComplete,
  autoStart = true,
  showControls = true,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);
  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke={isCompleted ? '#10B981' : '#0ea5e9'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progressPercentage) / 100}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 553 - (553 * progressPercentage) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            {isCompleted ? 'Complete!' : isRunning ? 'Running' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && !isCompleted && (
        <div className="flex gap-3 mt-4">
          {isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              Pause
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResume}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Resume
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Reset
          </motion.button>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-green-600 font-semibold">Great job! Time&apos;s up!</p>
        </motion.div>
      )}
    </div>
  );
}
