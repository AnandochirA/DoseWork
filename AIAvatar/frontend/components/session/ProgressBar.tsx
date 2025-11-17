'use client';

import { motion } from 'framer-motion';
import { useSessionStore } from '@/lib/state/sessionStore';

const steps = [
  { key: 'S', name: 'Situation', color: 'bg-spark-situation' },
  { key: 'P', name: 'Perception', color: 'bg-spark-perception' },
  { key: 'A', name: 'Affect', color: 'bg-spark-affect' },
  { key: 'R', name: 'Response', color: 'bg-spark-response' },
  { key: 'K', name: 'Key Result', color: 'bg-spark-keyresult' },
];

export default function ProgressBar() {
  const { progress } = useSessionStore();
  const currentStep = progress?.currentStep || 1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: stepNumber <= currentStep ? 1 : 0.4,
                }}
                transition={{ duration: 0.3 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                  ${isCompleted || isCurrent ? step.color : 'bg-gray-300'}
                  ${isCurrent ? 'ring-4 ring-offset-2 ring-opacity-50' : ''}
                `}
                style={{
                  ringColor: isCurrent ? step.color.replace('bg-', '') : undefined,
                }}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.key
                )}
              </motion.div>
              <span
                className={`
                  text-xs mt-1 font-medium
                  ${isCurrent ? 'text-gray-900' : 'text-gray-500'}
                `}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress line */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress?.percentage || 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute h-full bg-gradient-to-r from-spark-situation via-spark-affect to-spark-keyresult rounded-full"
        />
      </div>

      {/* Current step info */}
      {progress && (
        <div className="text-center mt-3">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {progress.totalSteps}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {progress.stepDescription}
          </p>
        </div>
      )}
    </div>
  );
}
