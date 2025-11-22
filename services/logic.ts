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

/**
 * INTELLIGENT RECALCULATION
 * Iterates through all records. 
 * If it finds an 'actualWeight', that becomes the new anchor.
 * Subsequent 'predictedWeights' are recalculated based on that anchor + goal trajectory + cycle fluctuations.
 */
export const recalculateFuturePredictions = (records: DailyRecord[], goal: UserGoal): DailyRecord[] => {
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // We need at least one record to start
  if (sorted.length === 0) return sorted;

  let currentAnchorWeight = sorted[0].actualWeight || sorted[0].predictedWeight || goal.startWeight;
  // let currentAnchorFat = sorted[0].actualBodyFat || sorted[0].predictedBodyFat || goal.startBodyFat;
  
  // Calculate average daily loss needed to hit goal from start (simplified linear model for the "baseline")
  // In a complex app, this would adjust dynamically based on remaining days.
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, (new Date(goal.targetDate).getTime() - new Date(sorted[0].date).getTime()) / msPerDay);
  const totalLoss = goal.startWeight - goal.targetWeight;
  const baseDailyLoss = totalLoss / totalDays;

  return sorted.map((record, index) => {
    // If this is the very first record, keep it (or use actual if available)
    if (index === 0) return record;

    const prevRecord = sorted[index - 1];
    const phaseInfo = PHASES_CONFIG[record.cyclePhase];
    const kFactor = phaseInfo.kFactor || 0;

    // Logic:
    // 1. Did the user log a weight yesterday? If so, that's our new reality base.
    // 2. If not, we continue predicting from yesterday's prediction.
    
    let baseForToday = prevRecord.predictedWeight;
    if (prevRecord.actualWeight) {
      baseForToday = prevRecord.actualWeight;
    }

    // Calculate new prediction
    // Prediction = Base - DailyDeficit + CycleFluctuation
    // Note: We remove the cycle fluctuation of the *previous* day (to normalize) and add *this* day's? 
    // Simplified: Prediction = Base - Loss + K_Factor
    
    let newPredicted = baseForToday - baseDailyLoss + kFactor;
    
    // Rounding
    newPredicted = Math.round(newPredicted * 100) / 100;

    // If this record HAS an actual weight, we don't change the actual, but we update the predicted
    // so we can see how we did against the plan.
    // HOWEVER, for the NEXT iteration, this record's actual weight will become the anchor.

    return {
      ...record,
      predictedWeight: newPredicted,
      // Simplified fat logic: drop 0.02% per day if not tracked
      predictedBodyFat: Number((prevRecord.actualBodyFat || prevRecord.predictedBodyFat - 0.02).toFixed(1))
    };
  });
};
