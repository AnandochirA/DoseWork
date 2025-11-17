'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/state/sessionStore';
import { useAvatarStore } from '@/lib/state/avatarStore';
import { socketManager, AvatarMessage, UserInput } from '@/lib/websocket/SocketManager';
import ProgressBar from '@/components/session/ProgressBar';
import EmotionSelector from '@/components/session/EmotionSelector';
import ResponseActions from '@/components/session/ResponseActions';
import BreathingGuide from '@/components/shared/BreathingGuide';
import Timer from '@/components/shared/Timer';

// Dynamic import for 3D avatar to avoid SSR issues
const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-sky-100 to-sky-200 rounded-2xl flex items-center justify-center">
      <div className="text-gray-500">Loading Avatar...</div>
    </div>
  ),
});

export default function SparkSessionPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Global state
  const {
    sessionId,
    userId,
    isActive,
    isLoading,
    currentStep,
    progress,
    messages,
    setSessionId,
    setActive,
    setLoading,
    setProgress,
    addMessages,
    updateSessionData,
    resetSession,
  } = useSessionStore();

  const { setEmotion } = useAvatarStore();

  // Local state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showActionGuide, setShowActionGuide] = useState(false);
  const [actionGuideType, setActionGuideType] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);

      try {
        // Connect to WebSocket server
        await socketManager.connect();
        setIsConnected(true);

        // Set up event handlers
        socketManager.setEventHandlers({
          onSessionJoined: (data) => {
            console.log('Session joined:', data);
            setProgress(data.progress);
          },
          onSessionUpdate: (data) => {
            console.log('Session update:', data);
            addMessages(data.messages);
            setProgress(data.progress);

            if (data.completed) {
              setActive(false);
            }
          },
          onActionGuide: (guide) => {
            console.log('Action guide:', guide);
            setActionGuideType(guide.type);
            setShowActionGuide(true);
          },
          onError: (error) => {
            console.error('Socket error:', error);
          },
        });

        // Create new session via REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        setSessionId(data.sessionId);
        addMessages(data.messages);
        setProgress(data.progress);
        setActive(true);

        // Join WebSocket room
        socketManager.joinSession(data.sessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      socketManager.disconnect();
      resetSession();
    };
  }, []);

  // Update avatar emotion based on step
  useEffect(() => {
    const stepEmotions: Record<string, 'neutral' | 'happy' | 'empathetic' | 'encouraging' | 'celebrating'> = {
      SITUATION: 'empathetic',
      PERCEPTION: 'encouraging',
      AFFECT: 'empathetic',
      RESPONSE: 'encouraging',
      KEY_RESULT: 'celebrating',
      COMPLETED: 'happy',
    };

    setEmotion(stepEmotions[currentStep] || 'neutral');
  }, [currentStep, setEmotion]);

  // Handle text submission
  const handleTextSubmit = () => {
    if (!userInput.trim() || !sessionId) return;

    const input: UserInput = {
      type: 'text',
      value: userInput.trim(),
      timestamp: new Date(),
    };

    socketManager.sendUserInput(sessionId, input);
    setUserInput('');

    // Update local session data based on step
    if (currentStep === 'SITUATION') {
      // Check if we already have description
      const currentData = useSessionStore.getState().sessionData;
      if (!currentData.situation?.description) {
        updateSessionData({
          situation: { description: userInput.trim(), thoughts: '' },
        });
      } else {
        updateSessionData({
          situation: { ...currentData.situation, thoughts: userInput.trim() },
        });
      }
    } else if (currentStep === 'PERCEPTION') {
      updateSessionData({
        perception: {
          selectedReframe: selectedOption,
          userReflection: userInput.trim(),
        },
      });
    } else if (currentStep === 'KEY_RESULT') {
      updateSessionData({
        keyResult: {
          followThrough: selectedOption,
          insights: userInput.trim(),
        },
      });
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (!sessionId) return;

    setSelectedOption(option);

    const input: UserInput = {
      type: 'option_select',
      value: option,
      timestamp: new Date(),
    };

    socketManager.sendUserInput(sessionId, input);
  };

  // Handle emotion selection
  const handleEmotionSelect = (emotion: string, intensity: number) => {
    if (!sessionId) return;

    updateSessionData({
      affect: { emotion, intensity },
    });

    // Send emotion
    socketManager.sendUserInput(sessionId, {
      type: 'emotion_select',
      value: emotion,
      timestamp: new Date(),
    });

    // Send intensity
    socketManager.sendUserInput(sessionId, {
      type: 'intensity',
      value: intensity,
      timestamp: new Date(),
    });
  };

  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    if (!sessionId) return;

    updateSessionData({
      response: { selectedAction: actionId, actionCompleted: false },
    });

    socketManager.sendUserInput(sessionId, {
      type: 'option_select',
      value: actionId,
      timestamp: new Date(),
    });

    // Request action guide
    socketManager.startAction(actionId);
  };

  // Handle action completion
  const handleActionComplete = () => {
    if (!sessionId) return;

    setShowActionGuide(false);
    socketManager.completeAction(sessionId);
  };

  // Get current message to display
  const currentMessage = messages[currentMessageIndex];

  // Render input based on message type
  const renderInput = () => {
    if (!currentMessage) return null;

    switch (currentMessage.type) {
      case 'input':
        if (currentMessage.inputType === 'textarea' || currentMessage.inputType === 'text') {
          return (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={currentMessage.content}
                className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTextSubmit}
                disabled={!userInput.trim()}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
              >
                Continue
              </motion.button>
            </div>
          );
        } else if (currentMessage.inputType === 'emotion_selector') {
          return (
            <EmotionSelector
              onSelect={handleEmotionSelect}
            />
          );
        }
        break;

      case 'options':
        if (currentStep === 'RESPONSE') {
          return (
            <ResponseActions
              onSelect={handleActionSelect}
              onComplete={handleActionComplete}
            />
          );
        }
        return (
          <div className="space-y-3">
            {currentMessage.options?.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedOption === option
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SPARK Session</h1>
          <ProgressBar />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-[400px] mb-4">
              <AvatarCanvas />
            </div>

            {/* Avatar Speech */}
            <AnimatePresence mode="wait">
              {currentMessage?.type === 'speech' && (
                <motion.div
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gray-50 p-4 rounded-xl"
                >
                  <p className="text-gray-800 leading-relaxed">
                    {currentMessage.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interaction Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-full flex flex-col">
              {/* Current Prompt */}
              {currentMessage?.type === 'prompt' && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentMessage.content}
                  </h3>
                </div>
              )}

              {/* Input Area */}
              <div className="flex-1">
                {showActionGuide ? (
                  <div className="flex items-center justify-center h-full">
                    {actionGuideType === 'breathing' ? (
                      <BreathingGuide onComplete={handleActionComplete} />
                    ) : actionGuideType === 'timer' ? (
                      <Timer
                        duration={actionGuideType === 'five_min_walk' ? 300 : 30}
                        onComplete={handleActionComplete}
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">
                          Complete your action when ready
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleActionComplete}
                          className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold"
                        >
                          I&apos;ve completed this action
                        </motion.button>
                      </div>
                    )}
                  </div>
                ) : (
                  renderInput()
                )}
              </div>

              {/* Session Controls */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => router.push('/')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Exit Session
                  </button>
                  <div className="text-sm text-gray-500">
                    {isConnected ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
