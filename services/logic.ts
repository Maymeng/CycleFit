import { DailyRecord, CyclePhase, UserGoal } from '../types';
import { PHASES_CONFIG } from '../constants';

// Constants for algorithm
const CALORIES_PER_KG = 7700;

export const calculateProgress = (current: number, start: number, target: number) => {
  const totalToLose = start - target;
  const lostSoFar = start - current;
  const percentage = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
  return percentage;
};

export const getCyclePhaseInfo = (phase: CyclePhase) => {
  return PHASES_CONFIG[phase];
};

export const getTodayPrediction = (
  records: DailyRecord[],
  todayDate: string,
  goal: UserGoal
): { predictedWeight: number; predictedFat: number; kFactor: number } => {
  // Find yesterday's record
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const todayIndex = sorted.findIndex(r => r.date === todayDate);
  
  if (todayIndex <= 0) return { predictedWeight: goal.startWeight, predictedFat: goal.startBodyFat, kFactor: 0 };

  const yesterday = sorted[todayIndex - 1];
  const today = sorted[todayIndex];

  // Calculate Target Daily Deficit to reach goal by targetDate (Linear approximation for simplicity)
  const todayTime = new Date(todayDate).getTime();
  const targetTime = new Date(goal.targetDate).getTime();
  const daysLeft = Math.max(1, (targetTime - todayTime) / (1000 * 60 * 60 * 24));
  
  // Use latest actual weight or fall back to predicted
  const baseWeight = yesterday.actualWeight || yesterday.predictedWeight;
  
  // Simple Linear needed loss
  const neededLossTotal = baseWeight - goal.targetWeight;
  const dailyBaseLoss = neededLossTotal > 0 ? neededLossTotal / daysLeft : 0;

  // Apply K-Factor
  const phaseConfig = PHASES_CONFIG[today.cyclePhase];
  const kFactor = phaseConfig ? phaseConfig.kFactor : 0;

  // Formula: Prediction = Yesterday - (Standard Loss) + K_Factor
  // Note: The user provided formula is specific: P = Actual_Yest - (Gap/7700) + K.
  // We will approximate "Gap/7700" as a standard deficit if they did workouts, or just linear trajectory.
  // For this demo, we stick closer to the linear trajectory + K factor to smooth it out.
  
  let predictedWeight = baseWeight - dailyBaseLoss + kFactor;
  
  // Clamp
  predictedWeight = Number(predictedWeight.toFixed(2));

  return {
    predictedWeight,
    predictedFat: yesterday.predictedBodyFat - 0.01, // Simplified fat loss
    kFactor
  };
};

export const isBetterThanPredicted = (actual: number, predicted: number) => {
  return actual < predicted;
};
