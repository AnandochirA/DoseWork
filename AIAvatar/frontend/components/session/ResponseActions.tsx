'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Action {
  id: string;
  label: string;
  duration: string;
  icon: string;
  description: string;
}

const actions: Action[] = [
  {
    id: 'breathing_exercise',
    label: 'Guided breathing exercise',
    duration: '3 minutes',
    icon: '<,',
    description: 'Calm your nervous system with 4-7-8 breathing',
  },
  {
    id: 'five_min_walk',
    label: 'Go for a 5-minute walk',
    duration: '5 minutes',
    icon: '=¶',
    description: 'Movement helps reset your mental state',
  },
  {
    id: 'jumping_jacks',
    label: 'Do jumping jacks for 30 seconds',
    duration: '30 seconds',
    icon: '<Ã',
    description: 'Quick burst of energy to release tension',
  },
  {
    id: 'ask_for_help',
    label: 'Ask someone for help',
    duration: 'Variable',
    icon: '>',
    description: 'Connection is strength, not weakness',
  },
];

interface ResponseActionsProps {
  onSelect: (actionId: string) => void;
  onComplete: () => void;
  selectedAction?: string;
}

export default function ResponseActions({
  onSelect,
  onComplete,
  selectedAction,
}: ResponseActionsProps) {
  const [currentAction, setCurrentAction] = useState<string>(selectedAction || '');
  const [isActionStarted, setIsActionStarted] = useState(false);

  const handleActionSelect = (actionId: string) => {
    setCurrentAction(actionId);
    onSelect(actionId);
  };

  const handleStartAction = () => {
    setIsActionStarted(true);
  };

  const handleCompleteAction = () => {
    onComplete();
  };

  const selectedActionData = actions.find((a) => a.id === currentAction);

  return (
    <div className="space-y-4">
      {!isActionStarted ? (
        <>
          {/* Action Selection */}
          <div className="space-y-3">
            {actions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionSelect(action.id)}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${
                    currentAction === action.id
                      ? 'border-spark-response bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{action.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{action.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{action.description}</div>
                    <div className="text-xs text-gray-400 mt-1">Duration: {action.duration}</div>
                  </div>
                  {currentAction === action.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-spark-response rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Start Button */}
          {currentAction && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartAction}
              className="w-full py-4 bg-spark-response text-white rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition-colors"
            >
              Start {selectedActionData?.label}
            </motion.button>
          )}
        </>
      ) : (
        /* Action In Progress */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-spark-response"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">{selectedActionData?.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedActionData?.label}
            </h3>
            <p className="text-gray-600 mb-6">{selectedActionData?.description}</p>

            {/* Action-specific guidance will be shown here */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                Take your time. When you&apos;re ready, click the button below.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteAction}
              className="w-full py-4 bg-spark-keyresult text-white rounded-xl font-semibold shadow-lg hover:bg-green-600 transition-colors"
            >
              I&apos;ve Completed This Action
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
