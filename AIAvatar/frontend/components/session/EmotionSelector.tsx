'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Emotion {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const emotions: Emotion[] = [
  { id: 'anxious', label: 'Anxious', emoji: '=0', color: 'border-yellow-400 bg-yellow-50' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '=5', color: 'border-purple-400 bg-purple-50' },
  { id: 'frustrated', label: 'Frustrated', emoji: '=$', color: 'border-orange-400 bg-orange-50' },
  { id: 'sad', label: 'Sad', emoji: '="', color: 'border-blue-400 bg-blue-50' },
  { id: 'angry', label: 'Angry', emoji: '= ', color: 'border-red-400 bg-red-50' },
  { id: 'confused', label: 'Confused', emoji: '=', color: 'border-indigo-400 bg-indigo-50' },
  { id: 'hopeless', label: 'Hopeless', emoji: '=', color: 'border-gray-400 bg-gray-50' },
  { id: 'stressed', label: 'Stressed', emoji: '=+', color: 'border-pink-400 bg-pink-50' },
];

interface EmotionSelectorProps {
  onSelect: (emotionId: string, intensity: number) => void;
  selectedEmotion?: string;
  intensity?: number;
}

export default function EmotionSelector({
  onSelect,
  selectedEmotion,
  intensity = 5,
}: EmotionSelectorProps) {
  const [currentEmotion, setCurrentEmotion] = useState<string>(selectedEmotion || '');
  const [currentIntensity, setCurrentIntensity] = useState<number>(intensity);

  const handleEmotionSelect = (emotionId: string) => {
    setCurrentEmotion(emotionId);
    onSelect(emotionId, currentIntensity);
  };

  const handleIntensityChange = (value: number) => {
    setCurrentIntensity(value);
    if (currentEmotion) {
      onSelect(currentEmotion, value);
    }
  };

  const getIntensityLabel = (value: number): string => {
    if (value <= 2) return 'Mild';
    if (value <= 4) return 'Moderate';
    if (value <= 6) return 'Notable';
    if (value <= 8) return 'Strong';
    return 'Intense';
  };

  const getIntensityColor = (value: number): string => {
    if (value <= 2) return 'text-green-600';
    if (value <= 4) return 'text-yellow-600';
    if (value <= 6) return 'text-orange-600';
    if (value <= 8) return 'text-red-500';
    return 'text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Emotion Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {emotions.map((emotion) => (
          <motion.button
            key={emotion.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEmotionSelect(emotion.id)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200
              ${
                currentEmotion === emotion.id
                  ? `${emotion.color} border-opacity-100 shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="text-3xl mb-2">{emotion.emoji}</div>
            <div className="text-sm font-medium text-gray-700">{emotion.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Intensity Slider */}
      {currentEmotion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate your emotional intensity
          </label>

          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={currentIntensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-300 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-2xl font-bold">{currentIntensity}</span>
            <span className={`block text-sm font-medium ${getIntensityColor(currentIntensity)}`}>
              {getIntensityLabel(currentIntensity)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
