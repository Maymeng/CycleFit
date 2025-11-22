
import { DailyRecord, CyclePhase, UserGoal } from '../types';
import { PHASES_CONFIG } from '../constants';

// --- ALGORITHM CONSTANTS & CURVES ---

// 1. Sensitivity & Impact Parameters
const PARAMS = {
  hormoneSensitivity: 1.0, // Medium sensitivity
  bfSensitivity: 0.5,      // Lower sensitivity for BF
  cheatImpactMin: 0.5,     // kg gain next day
  cheatImpactMax: 0.8,     // kg gain next day
  maxDailyLoss: 0.20,      // kg/day cap
  maxDailyBFDrop: 0.08,    // %/day cap
};

// 2. Hormone Curves (28-Day Cycle)
// index 0 = Day 1, index 27 = Day 28
const HORMONE_CURVE_KG: number[] = [
  +0.10, +0.10,   // D1-2 Menstrual (Slight bloat)
  +0.05, 0.00,    // D3-4
  -0.05, -0.10, -0.15, -0.20, // D5-8 Follicular (Golden period, low water)
  -0.15, -0.10, -0.05, 0.00,  // D9-12
  +0.05, +0.10, +0.15, +0.20, // D13-16 Luteal Start (Bloat begins)
  +0.25, +0.30, +0.35, +0.30, // D17-20 PMS Peak
  +0.25, +0.20, +0.15, +0.10, // D21-24 Tapering
  +0.05, 0.00, 0.00, 0.00     // D25-28 Neutral
];

const HORMONE_CURVE_BF: number[] = [
  +0.20, +0.20,  // D1-2
  +0.10, 0.00,   // D3-4
  -0.05, -0.10, -0.15, -0.15, // D5-8
  -0.10, -0.05, 0.00, 0.00,   // D9-12
  +0.05, +0.10, +0.15, +0.20, // D13-16
  +0.20, +0.20, +0.15, +0.10, // D17-20
  +0.05, 0.00, 0.00, 0.00,    // D21-24
  0.00, 0.00, 0.00, 0.00      // D25-28
];

// Helper: Clamp value between min and max
const clamp = (x: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, x));
};

// Helper: Get Cycle Phase based on Day (Simple 28-day model for projection)
const getPhaseFromDay = (day: number): CyclePhase => {
  if (day <= 5) return CyclePhase.MENSTRUAL;
  if (day <= 12) return CyclePhase.FOLLICULAR;
  if (day <= 16) return CyclePhase.OVULATION;
  return CyclePhase.LUTEAL;
};

// --- CORE PREDICTION FUNCTION ---

interface PredictInput {
  weightYesterday: number;
  bfYesterday: number;
  targetWeight: number;
  targetBF: number;
  daysLeft: number;
  cycleDay: number;      // 1-28
  cheatYesterday: boolean;
  cheatIntensity?: number; // 0-1
  adherenceScore: number;  // 0-1
}

export const predictNextDay = (input: PredictInput) => {
  const {
    weightYesterday,
    bfYesterday,
    targetWeight,
    targetBF,
    daysLeft,
    cycleDay,
    cheatYesterday,
    cheatIntensity = 0.7, // Default moderate-heavy meal
    adherenceScore
  } = input;

  // Safe cycle day index (0-27)
  const cycleIndex = Math.max(0, Math.min(27, cycleDay - 1));

  // --- WEIGHT PREDICTION ---

  // 1. Trend Term (Linear goal trajectory)
  const gap = weightYesterday - targetWeight;
  const theoreticalDailyLoss = daysLeft > 0 ? gap / daysLeft : 0;
  // If gap < 0 (already met goal), daily loss is 0. Cap max loss for realism.
  const baseDailyLoss = clamp(Math.max(0, theoreticalDailyLoss), 0, PARAMS.maxDailyLoss);
  
  // Adherence affects how much of the "Plan" we achieve. 
  // Negative because we are losing weight.
  const trendTerm = -baseDailyLoss * adherenceScore; 

  // 2. Hormone Term (Cyclical water weight)
  const K_hormone = HORMONE_CURVE_KG[cycleIndex] * PARAMS.hormoneSensitivity;

  // 3. Cheat Meal Term (Immediate water retention next day)
  const impact = PARAMS.cheatImpactMin + (PARAMS.cheatImpactMax - PARAMS.cheatImpactMin) * cheatIntensity;
  const cheatTerm = cheatYesterday ? impact : 0;

  // 4. Aggregate
  // Note: The K_hormone is an absolute offset relative to "neutral", 
  // but since we iterate day-by-day, we need the *change* in hormone effect from yesterday to today,
  // OR we treat the baseline as the 'dry weight' and add K_hormone on top.
  // *ADJUSTMENT FOR ITERATIVE MODEL*: 
  // To avoid accumulating K_hormone infinitely (e.g. +0.1 every day = +3kg/month), 
  // we need to calculate the "Dry Weight" trend separately, then add the Hormone Factor on top for the final display value.
  // However, to stick to the user's requested formula structure: 
  // Let's assume `weightYesterday` already includes yesterday's water. 
  // So we need (K_hormone_today - K_hormone_yesterday) to apply the *delta*.
  
  // Let's refine the "Dry Weight" approach for stability:
  // EstimatedDryWeightToday = (PrevDryWeight) + TrendTerm + CheatTerm(temporary, usually flushes out)
  
  // SIMPLIFIED APPROACH COMPATIBLE WITH PROMPT:
  // We will calculate the delta of hormone effect to apply to the running total.
  const prevCycleIndex = cycleIndex === 0 ? 27 : cycleIndex - 1;
  const K_hormone_prev = HORMONE_CURVE_KG[prevCycleIndex] * PARAMS.hormoneSensitivity;
  const hormoneDelta = K_hormone - K_hormone_prev;

  // Cheat term is a temporary spike. In a real physical model, it decays. 
  // For this daily step function: If yesterday was cheat, we add the spike. 
  // If yesterday was NOT cheat, but day before was, we should naturally lose that water (Trend covers this naturally via weight diff).
  // Let's stick to: Add spike if yesterday was cheat.
  
  let weightPred = weightYesterday + trendTerm + hormoneDelta + cheatTerm;

  // Clamp max daily fluctuation to prevent explosions
  weightPred = clamp(weightPred, weightYesterday - 1.0, weightYesterday + 1.0);


  // --- BODY FAT PREDICTION ---

  const bfGap = bfYesterday - targetBF;
  const theoreticalDailyBFDrop = daysLeft > 0 ? bfGap / daysLeft : 0;
  const baseDailyBFDrop = clamp(Math.max(0, theoreticalDailyBFDrop), 0, PARAMS.maxDailyBFDrop);
  const bfTrend = -baseDailyBFDrop * adherenceScore;

  const K_hormoneBF = HORMONE_CURVE_BF[cycleIndex] * PARAMS.bfSensitivity;
  const K_hormoneBF_prev = HORMONE_CURVE_BF[prevCycleIndex] * PARAMS.bfSensitivity;
  const hormoneBFDelta = K_hormoneBF - K_hormoneBF_prev;

  let bfPred = bfYesterday + bfTrend + hormoneBFDelta;
  bfPred = clamp(bfPred, 10, 50); // Safety clamp

  return {
    predictedWeight: Number(weightPred.toFixed(2)),
    predictedBodyFat: Number(bfPred.toFixed(1))
  };
};


// --- RECALCULATION SERVICE ---

/**
 * INTELLIGENT RECALCULATION
 * Iterates through all records.
 * 1. Sorts records.
 * 2. Finds the last record with ACTUAL data (The "Anchor").
 * 3. Re-predicts everything AFTER the Anchor based on the new algorithm.
 * 4. (Optional) Can also back-fill predictions if needed, but usually we focus on future.
 */
export const recalculateFuturePredictions = (records: DailyRecord[], goal: UserGoal): DailyRecord[] => {
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (sorted.length === 0) return sorted;

  // 1. Find Anchor (Last Actual)
  let anchorIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].actualWeight !== undefined || sorted[i].actualBodyFat !== undefined) {
      anchorIndex = i;
      break;
    }
  }

  // If no actual data, start from index 0 using goal start data
  if (anchorIndex === -1) {
     // Fallback initialization if totally empty
     anchorIndex = -1; 
  }

  // 2. Iterate forward from Anchor + 1
  const result = [...sorted];
  const msPerDay = 1000 * 60 * 60 * 24;

  for (let i = 0; i < result.length; i++) {
    // Skip records that are actual data points (unless we want to update their predicted value for reference?)
    // The requirement is: "Update future predictions".
    // So we update everything AFTER the anchor.
    
    // However, to keep the chart continuous, even the Anchor day needs a 'predicted' value 
    // derived from the day before. But for the Anchor itself, we usually trust its actual value 
    // as the basis for the NEXT day.
    
    if (i <= anchorIndex) {
      // This is history/today with actuals. We generally leave their 'predicted' value 
      // as whatever it was historically, OR we can update it to show "what should have been".
      // Let's leave history alone to preserve "what the app told me then".
      continue;
    }

    // PREDICTION LOGIC FOR FUTURE (i > anchorIndex)
    
    const prevRecord = result[i - 1];
    const currentRecord = result[i];
    
    // Base values from Previous Record
    // If previous record has Actual, use it (resetting the error).
    // If not, use its Predicted (chaining predictions).
    const weightBase = prevRecord.actualWeight || prevRecord.predictedWeight || goal.startWeight;
    const fatBase = prevRecord.actualBodyFat || prevRecord.predictedBodyFat || goal.startBodyFat;
    
    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date(currentRecord.date);
    const daysLeft = Math.max(1, (targetDate.getTime() - currentDate.getTime()) / msPerDay);
    
    // Adherence: If user marked workout in future (planning), use 1.0, else default 0.9
    // For future dates, we usually assume standard adherence unless planned otherwise.
    const adherence = currentRecord.completedWorkout ? 1.0 : 0.9;

    const prediction = predictNextDay({
      weightYesterday: weightBase,
      bfYesterday: fatBase,
      targetWeight: goal.targetWeight,
      targetBF: goal.targetBodyFat,
      daysLeft: daysLeft,
      cycleDay: currentRecord.cycleDay,
      cheatYesterday: prevRecord.isCheatDay || false, // Check PREVIOUS day for cheat spike
      cheatIntensity: 0.7, // Default
      adherenceScore: adherence
    });

    result[i] = {
      ...currentRecord,
      predictedWeight: prediction.predictedWeight,
      predictedBodyFat: prediction.predictedBodyFat
    };
  }

  return result;
};


/**
 * GENERATE PROJECTED RECORDS FOR VISUALIZATION
 * Projects future dates from the last known record up to a future date.
 * Fills the gap for charts using the new algorithm.
 */
export const generateProjectedRecords = (existingRecords: DailyRecord[], goal: UserGoal): DailyRecord[] => {
  if (existingRecords.length === 0) return [];
  
  const sorted = [...existingRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastRecord = sorted[sorted.length - 1];
  
  const projected: DailyRecord[] = [];
  
  // Generate until end of next year
  const today = new Date();
  const endGenDate = new Date(today.getFullYear() + 1, 11, 31);
  
  let current = new Date(lastRecord.date);
  current.setDate(current.getDate() + 1); // Start tomorrow
  
  let prevRecord = lastRecord;
  
  // We need a running tracker for Cycle Day since we are generating dates
  let currentCycleDay = lastRecord.cycleDay;

  const msPerDay = 1000 * 60 * 60 * 24;

  while (current <= endGenDate) {
      // Increment Cycle Day (1-28 loop)
      currentCycleDay = (currentCycleDay % 28) + 1;
      const phase = getPhaseFromDay(currentCycleDay);
      
      // Prepare inputs
      const weightBase = prevRecord.actualWeight || prevRecord.predictedWeight;
      const fatBase = prevRecord.actualBodyFat || prevRecord.predictedBodyFat;
      
      const daysLeft = Math.max(1, (new Date(goal.targetDate).getTime() - current.getTime()) / msPerDay);

      // Predict
      const prediction = predictNextDay({
        weightYesterday: weightBase,
        bfYesterday: fatBase,
        targetWeight: goal.targetWeight,
        targetBF: goal.targetBodyFat,
        daysLeft: daysLeft,
        cycleDay: currentCycleDay,
        cheatYesterday: prevRecord.isCheatDay || false, // Use prev record's cheat flag
        cheatIntensity: 0.7,
        adherenceScore: 0.95 // Assume good behavior in future projections
      });

      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const newRecord: DailyRecord = {
          date: dateStr,
          cycleDay: currentCycleDay,
          cyclePhase: phase,
          suggestion: "Predicted",
          predictedWeight: prediction.predictedWeight,
          predictedBodyFat: prediction.predictedBodyFat,
          actualWeight: undefined,
          // Assume no cheat days planned in far future for baseline projection
          isCheatDay: false 
      };
      
      projected.push(newRecord);
      
      // Update pointers
      prevRecord = newRecord;
      current.setDate(current.getDate() + 1);
  }
  
  return projected;
};

// Re-export helper if needed by components
export const getCyclePhaseInfo = (phase: CyclePhase) => {
  return PHASES_CONFIG[phase];
};
export const calculateProgress = (current: number, start: number, target: number) => {
  const totalToLose = start - target;
  const lostSoFar = start - current;
  const percentage = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
  return percentage;
};
export const getTodayPrediction = (records: DailyRecord[], todayDate: string, goal: UserGoal) => {
   // We reuse the projection logic but specific for one day
   // This is a simplified wrapper to avoid full recalculation overhead if just checking today
   // But given the linked nature of the new algo, it's safer to generate from last record.
   
   const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
   const todayRec = sorted.find(r => r.date === todayDate);
   
   if (todayRec) return { predictedWeight: todayRec.predictedWeight, predictedFat: todayRec.predictedBodyFat };
   
   // If today doesn't exist, project 1 step from last known
   const last = sorted[sorted.length - 1];
   if (!last) return { predictedWeight: goal.startWeight, predictedFat: goal.startBodyFat };
   
   // ... (Simplification: In the app, we usually already have today's record generated via recalculateFuturePredictions)
   // So we just return the last knowns.
   return { predictedWeight: last.predictedWeight, predictedFat: last.predictedBodyFat };
};
