
import React, { useState, useEffect } from 'react';
import { DailyRecord, UserGoal, CyclePhase } from '../types';
import { PHASES_CONFIG } from '../constants';
import { calculateProgress } from '../services/logic';
import { Card } from './ui/Card';
import { 
  Activity, 
  Flame, 
  Utensils, 
  Timer, 
  TrendingDown, 
  ChevronRight,
  Edit2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  todayRecord: DailyRecord | undefined;
  goal: UserGoal;
  fastingState: { isFasting: boolean; startTime: number | null };
  toggleFasting: () => void;
  onOpenCheckIn: () => void;
  onNavigateToGoal: () => void;
  onUpdateCycle: (phase: CyclePhase, day: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  todayRecord, 
  goal, 
  fastingState,
  toggleFasting,
  onOpenCheckIn,
  onNavigateToGoal,
  onUpdateCycle
}) => {
  // Renamed from timeLeft to elapsedTime to reflect cumulative counting
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [weightProgress, setWeightProgress] = useState(0);
  const [fatProgress, setFatProgress] = useState(0);
  const [showCycleEdit, setShowCycleEdit] = useState(false);

  // Local state for cycle editing (waiting for confirmation)
  const [tempPhase, setTempPhase] = useState<CyclePhase>(CyclePhase.FOLLICULAR);
  const [tempDay, setTempDay] = useState<number>(1);

  // Phase Styling
  const phaseStyle = todayRecord ? PHASES_CONFIG[todayRecord.cyclePhase] : PHASES_CONFIG[CyclePhase.FOLLICULAR];

  // Sync temp state when modal opens
  useEffect(() => {
    if (showCycleEdit && todayRecord) {
      setTempPhase(todayRecord.cyclePhase);
      setTempDay(todayRecord.cycleDay);
    }
  }, [showCycleEdit, todayRecord]);

  // Progress Calculation
  useEffect(() => {
    if (todayRecord) {
      // Weight Progress
      const currentWeight = todayRecord.actualWeight || todayRecord.predictedWeight;
      const wp = calculateProgress(currentWeight, goal.startWeight, goal.targetWeight);
      setWeightProgress(wp);

      // Fat Progress
      const currentFat = todayRecord.actualBodyFat || todayRecord.predictedBodyFat;
      const fp = calculateProgress(currentFat, goal.startBodyFat, goal.targetBodyFat);
      setFatProgress(fp);
    }
  }, [todayRecord, goal]);

  // Fasting/Eating Cumulative Timer Logic
  useEffect(() => {
    const updateTimer = () => {
      if (fastingState.startTime) {
        const now = Date.now();
        const elapsed = now - fastingState.startTime; // Count UP from start time
        
        const totalSeconds = Math.floor(elapsed / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        // Format: HH:MM:SS
        const format = (num: number) => num.toString().padStart(2, '0');
        setElapsedTime(`${format(h)}:${format(m)}:${format(s)}`);
      } else {
        setElapsedTime('00:00:00');
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [fastingState]);

  const handleFireworks = () => {
    if (todayRecord && todayRecord.actualWeight && todayRecord.actualWeight < todayRecord.predictedWeight) {
       confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7']
      });
    }
  };

  useEffect(() => {
    handleFireworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRecord?.actualWeight]);

  const handleConfirmCycleUpdate = () => {
    onUpdateCycle(tempPhase, tempDay);
    setShowCycleEdit(false);
  };

  // Helper to format start time
  const formatStartTime = (timestamp: number | null) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (!todayRecord) return <div className="p-4">Loading today's plan...</div>;

  const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const currentW = todayRecord.actualWeight || todayRecord.predictedWeight;
  const currentF = todayRecord.actualBodyFat || todayRecord.predictedBodyFat;
  
  const weightGap = Math.max(0, currentW - goal.targetWeight);
  const fatGap = Math.max(0, currentF - goal.targetBodyFat);

  const phaseLabels: Record<CyclePhase, string> = {
    [CyclePhase.MENSTRUAL]: '月经期 Menstrual',
    [CyclePhase.FOLLICULAR]: '卵泡期 Follicular',
    [CyclePhase.OVULATION]: '排卵期 Ovulation',
    [CyclePhase.LUTEAL]: '黄体期 Luteal',
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Top Status Bar (Dynamic Color) */}
      <div className={`${phaseStyle.color} ${phaseStyle.textColor} pl-9 pr-6 pt-[38px] pb-8 rounded-b-[2.5rem] shadow-sm -mx-4 -mt-4 relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
           <Activity size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
             <span className="text-sm font-semibold opacity-80">{todayRecord.date}</span>
             
             {/* Clickable Cycle Pill */}
             <button 
               onClick={() => setShowCycleEdit(true)}
               className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border ${phaseStyle.borderColor} shadow-sm hover:bg-white/70 transition-all`}
             >
               <span>{phaseLabels[todayRecord.cyclePhase].split(' ')[1]} D{todayRecord.cycleDay}</span>
               <Edit2 size={10} className="opacity-70" />
             </button>
          </div>
          
          <h1 className="text-2xl font-bold leading-tight mb-4">
            {todayRecord.suggestion}
          </h1>

          {/* Core Suggestion Bubble */}
          <div className="bg-white/90 backdrop-blur text-gray-800 p-3 rounded-xl shadow-sm inline-flex items-center gap-2 animate-fade-in-up">
             <Flame size={18} className="text-orange-500" />
             <span className="text-sm font-medium">今天适合: {todayRecord.suggestion.split('，')[0] || "普拉提 + 轻有氧"}</span>
          </div>
        </div>
      </div>

      {/* 2. Overall Progress Ring (Compact Side-by-Side with Dual Rings) */}
      <div className="px-4">
        <Card 
          className="relative overflow-hidden cursor-pointer active:scale-[0.98]"
          onClick={onNavigateToGoal}
        >
           <div className="absolute top-3 right-3 text-gray-300">
             <Edit2 size={14} />
           </div>
           
           <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Goal Progress</h3>
           
           <div className="flex items-center gap-6">
             {/* Dual Concentric Rings */}
             <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                {/* Outer Ring: Weight */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#10B981 ${weightProgress * 3.6}deg, #F3F4F6 0deg)`
                  }}
                ></div>
                {/* Mask 1 */}
                <div className="absolute inset-1.5 bg-white rounded-full"></div>

                {/* Inner Ring: Body Fat */}
                <div 
                  className="absolute inset-3 rounded-full"
                  style={{
                    background: `conic-gradient(#3B82F6 ${fatProgress * 3.6}deg, #F3F4F6 0deg)`
                  }}
                ></div>
                {/* Mask 2 (Center) */}
                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                   <span className="text-[10px] text-gray-400 font-bold tracking-widest">GOAL</span>
                </div>
             </div>

             {/* Detailed Stats Stacked Vertically */}
             <div className="flex flex-col gap-3 flex-1 min-w-0">
                {/* Days Left */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-400 text-xs">Days Left</span>
                  <span className="text-lg font-bold text-gray-700">{daysRemaining}</span>
                </div>

                {/* Weight Gap */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                      <span className="text-gray-400 text-xs">Weight Left</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{weightGap.toFixed(1)} <span className="text-xs font-normal text-gray-400">kg</span></span>
                  </div>
                </div>

                {/* Fat Gap */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                      <span className="text-gray-400 text-xs">Fat Left</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{fatGap.toFixed(1)} <span className="text-xs font-normal text-gray-400">%</span></span>
                  </div>
                </div>
             </div>
           </div>
        </Card>
      </div>

      {/* 3. Central Instrument Panel (Weight) */}
      <div className="px-4">
        <div className="flex gap-4">
          {/* Predicted (Left) */}
          <Card className="flex-1 bg-gray-50 border-dashed border-gray-200 opacity-80">
            <p className="text-xs text-gray-400 mb-1">Predicted</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-gray-500">{todayRecord.predictedWeight}</span>
              <span className="text-xs text-gray-400">kg</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{todayRecord.predictedBodyFat}% Fat</div>
          </Card>

          {/* Actual (Right) - Actionable */}
          <Card 
            className="flex-1 bg-white ring-2 ring-offset-2 ring-black cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onOpenCheckIn}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-500 mb-1">Actual</p>
              <div className="bg-black text-white rounded-full p-1">
                <ChevronRight size={12} />
              </div>
            </div>
            
            {todayRecord.actualWeight ? (
               <>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{todayRecord.actualWeight}</span>
                  <span className="text-xs text-gray-500">kg</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">{todayRecord.actualBodyFat}% Fat</span>
                  {todayRecord.actualWeight < todayRecord.predictedWeight && (
                    <TrendingDown size={12} className="text-green-500" />
                  )}
                </div>
               </>
            ) : (
              <div className="h-12 flex items-center text-gray-400 text-sm">
                Tap to log
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 4. 16+8 Timer - Cumulative Count with Timestamp */}
      <div className="px-4">
        <Card className="bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${fastingState.isFasting ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                 {fastingState.isFasting ? <Timer size={24} /> : <Utensils size={24} />}
              </div>
              {/* Flattened text structure with exact height alignment */}
              <div className="flex flex-col h-10 justify-between">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider leading-none translate-y-[5px]">
                  {fastingState.isFasting ? 'Time Fasted' : 'Time Eating'}
                </p>
                <p className="text-xl font-mono tracking-widest leading-none">
                  {elapsedTime}
                </p>
                <p className="text-[10px] text-gray-500 font-medium leading-none -translate-y-[5px]">
                  Since {formatStartTime(fastingState.startTime)}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleFasting}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                fastingState.isFasting 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {fastingState.isFasting ? 'END FAST' : 'START FAST'}
            </button>
          </div>
        </Card>
      </div>

      {/* Dynamic Alert for unexpected changes */}
      {(todayRecord.actualWeight && todayRecord.actualWeight > todayRecord.predictedWeight + 0.4 && todayRecord.cyclePhase === CyclePhase.LUTEAL) && (
         <div className="px-4 animate-pulse">
           <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex gap-2">
             <span>💧</span>
             <span>Normal physiological edema during Luteal phase. Don't panic, it will drop by D1.</span>
           </div>
         </div>
      )}

      {/* Cycle Edit Modal */}
      {showCycleEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Adjust Cycle</h3>
              <button onClick={() => setShowCycleEdit(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phase</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(phaseLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTempPhase(key as CyclePhase)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        tempPhase === key 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Day of Cycle (D{tempDay})</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setTempDay(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-mono text-3xl font-bold">
                    {tempDay}
                  </div>
                  <button 
                    onClick={() => setTempDay(prev => Math.min(28, prev + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                onClick={handleConfirmCycleUpdate}
                className="w-full bg-black text-white py-3 rounded-xl font-bold mt-2 hover:bg-gray-800 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
