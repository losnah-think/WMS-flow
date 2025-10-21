// src/hooks/useFlowController.ts
'use client';

import { useState, useEffect } from 'react';
import { FlowType } from '@/models/types';
import { flowData } from '@/models/flowData';

export const useFlowController = (initialFlowType: FlowType = 'inbound') => {
  const [flowType, setFlowType] = useState<FlowType>(initialFlowType);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [showInfo, setShowInfo] = useState(true);

  const currentFlow = flowData[flowType];

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= currentFlow.steps.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentFlow.steps.length]);

  const handleFlowTypeChange = (newFlowType: FlowType) => {
    setFlowType(newFlowType);
    setActiveStep(-1);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setActiveStep(-1);
    setIsPlaying(false);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const getActorPosition = (actorId: string): number => {
    const index = currentFlow.actors.findIndex(a => a.id === actorId);
    return index * 150 + 100;
  };

  return {
    flowType,
    isPlaying,
    activeStep,
    showInfo,
    currentFlow,
    handleFlowTypeChange,
    handlePlayPause,
    handleReset,
    toggleInfo,
    getActorPosition,
  };
};
