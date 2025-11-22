export enum CyclePhase {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATION = 'Ovulation',
  LUTEAL = 'Luteal',
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  cycleDay: number;
  cyclePhase: CyclePhase;
  suggestion: string;
  predictedWeight: number;
  predictedBodyFat: number;
  actualWeight?: number;
  actualBodyFat?: number;
  note?: string;
  completedFasting?: boolean;
  isCheatDay?: boolean;
  completedWorkout?: boolean;
}

export interface UserGoal {
  targetDate: string;
  targetWeight: number;
  targetBodyFat: number;
  startWeight: number; // For calculation reference
  startBodyFat: number;
}

export interface AppState {
  currentDate: string;
  records: DailyRecord[];
  goal: UserGoal;
  isFasting: boolean;
  fastingStartTime: number | null; // timestamp
}